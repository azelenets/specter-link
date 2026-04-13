import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageContent from '@/components/PageContent';

// ── Hook mocks ────────────────────────────────────────────────────────────────

const basePeer = {
  peerId: null as string | null,
  connected: false,
  callActive: false,
  messages: [],
  remoteStream: null,
  localStream: null,
  status: 'Initializing...',
  callError: null as string | null,
  incomingCall: false,
  incomingCallType: null as string | null,
  joinRoom: jest.fn(),
  sendMessage: jest.fn(),
  startCall: jest.fn(),
  endCall: jest.fn(),
  leaveRoom: jest.fn(),
  answerCall: jest.fn(),
  declineCall: jest.fn(),
};

const mockUsePeer = jest.fn(() => ({ ...basePeer }));
const mockUseRingtone = jest.fn();

jest.mock('@/hooks/usePeer', () => ({
  usePeer: () => mockUsePeer(),
}));

jest.mock('@/hooks/useRingtone', () => ({
  useRingtone: (active: boolean) => mockUseRingtone(active),
}));

beforeEach(() => {
  mockUsePeer.mockReturnValue({ ...basePeer });
  jest.clearAllMocks();
});

// ── Lobby (disconnected) ───────────────────────────────────────────────────────

describe('PageContent — lobby (not connected)', () => {
  it('renders the SPECTER-LINK heading', () => {
    render(<PageContent />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the privacy tagline', () => {
    render(<PageContent />);
    expect(screen.getByText(/secure · peer-to-peer · no accounts/i)).toBeInTheDocument();
  });

  it('renders the RoomEntry "Your Peer ID" label', () => {
    render(<PageContent />);
    expect(screen.getByText(/your peer id/i)).toBeInTheDocument();
  });

  it('passes peerId to RoomEntry (null → spinner)', () => {
    render(<PageContent />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('passes peerId string to RoomEntry when available', () => {
    mockUsePeer.mockReturnValue({ ...basePeer, peerId: 'test-peer' });
    render(<PageContent />);
    expect(screen.getByText('test-peer')).toBeInTheDocument();
  });

  it('calls joinRoom when RoomEntry submits a remote ID', async () => {
    mockUsePeer.mockReturnValue({ ...basePeer, peerId: 'my-id' });
    render(<PageContent />);
    await userEvent.type(screen.getByLabelText(/remote peer id/i), 'other-id');
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));
    expect(basePeer.joinRoom).toHaveBeenCalledWith('other-id');
  });

  it('passes useRingtone false when no incoming call', () => {
    render(<PageContent />);
    expect(mockUseRingtone).toHaveBeenCalledWith(false);
  });
});

// ── Room (connected) ───────────────────────────────────────────────────────────

describe('PageContent — in room (connected)', () => {
  beforeEach(() => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true, peerId: 'me' });
  });

  it('renders the toolbar with SPECTER-LINK brand', () => {
    render(<PageContent />);
    expect(screen.getByText('SPECTER-LINK')).toBeInTheDocument();
  });

  it('renders the LIVE badge', () => {
    render(<PageContent />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders the privacy info alert', () => {
    render(<PageContent />);
    expect(screen.getByRole('alert')).toHaveTextContent(/end-to-end encrypted/i);
  });

  it('renders VideoPanel placeholder (no active call)', () => {
    render(<PageContent />);
    expect(screen.getByText(/no active call/i)).toBeInTheDocument();
  });

  it('renders Chat empty state', () => {
    render(<PageContent />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('shows Audio / Video / Screen call buttons when not in call', () => {
    render(<PageContent />);
    expect(screen.getByRole('button', { name: /audio call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /video call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /screen/i })).toBeInTheDocument();
  });

  it('calls startCall("audio") when Audio Call is clicked', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /audio call/i }));
    expect(basePeer.startCall).toHaveBeenCalledWith('audio');
  });

  it('hides call-start buttons and shows End Call when callActive', () => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true, callActive: true });
    render(<PageContent />);
    expect(screen.queryByRole('button', { name: /audio call/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end call/i })).toBeInTheDocument();
  });

  it('calls endCall when End Call is clicked', async () => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true, callActive: true });
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /end call/i }));
    expect(basePeer.endCall).toHaveBeenCalled();
  });

  it('passes useRingtone true when incoming call and not active', () => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true, incomingCall: true, callActive: false });
    render(<PageContent />);
    expect(mockUseRingtone).toHaveBeenCalledWith(true);
  });
});

// ── Call error banner ──────────────────────────────────────────────────────────

describe('PageContent — call error', () => {
  it('shows the call error alert', () => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true, callError: 'Camera not found' });
    render(<PageContent />);
    const alerts = screen.getAllByRole('alert');
    const errorAlert = alerts.find((el) => el.textContent?.includes('Camera not found'));
    expect(errorAlert).toBeInTheDocument();
  });
});

// ── Incoming call banner ───────────────────────────────────────────────────────

describe('PageContent — incoming call banner', () => {
  it('shows incoming audio call label', () => {
    mockUsePeer.mockReturnValue({
      ...basePeer,
      connected: true,
      incomingCall: true,
      incomingCallType: 'audio',
      callActive: false,
    });
    render(<PageContent />);
    expect(screen.getByText(/incoming audio call/i)).toBeInTheDocument();
  });

  it('shows incoming video call label', () => {
    mockUsePeer.mockReturnValue({
      ...basePeer,
      connected: true,
      incomingCall: true,
      incomingCallType: 'video',
      callActive: false,
    });
    render(<PageContent />);
    expect(screen.getByText(/incoming video call/i)).toBeInTheDocument();
  });

  it('calls answerCall when Answer is clicked', async () => {
    mockUsePeer.mockReturnValue({
      ...basePeer,
      connected: true,
      incomingCall: true,
      incomingCallType: 'audio',
      callActive: false,
    });
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /answer/i }));
    expect(basePeer.answerCall).toHaveBeenCalled();
  });

  it('calls declineCall when Decline is clicked', async () => {
    mockUsePeer.mockReturnValue({
      ...basePeer,
      connected: true,
      incomingCall: true,
      incomingCallType: 'audio',
      callActive: false,
    });
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(basePeer.declineCall).toHaveBeenCalled();
  });

  it('hides incoming call banner when call is already active', () => {
    mockUsePeer.mockReturnValue({
      ...basePeer,
      connected: true,
      incomingCall: true,
      callActive: true,
    });
    render(<PageContent />);
    expect(screen.queryByRole('button', { name: /answer/i })).not.toBeInTheDocument();
  });
});

// ── Leave Room modal ───────────────────────────────────────────────────────────

describe('PageContent — leave room modal', () => {
  beforeEach(() => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true });
  });

  it('does not show the dialog before clicking Leave Room', () => {
    render(<PageContent />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the confirmation dialog after clicking Leave Room', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /leave room/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Modal heading rendered by ModalHeader
    expect(screen.getByRole('heading', { name: /leave room/i })).toBeInTheDocument();
  });

  it('closes the dialog when Cancel is clicked', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /leave room/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls leaveRoom when confirmed', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /leave room/i }));
    // Click the danger Leave Room button inside the dialog
    const dialog = screen.getByRole('dialog');
    const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Leave Room'),
    );
    await userEvent.click(confirmBtn!);
    expect(basePeer.leaveRoom).toHaveBeenCalled();
  });
});

// ── Mobile menu ────────────────────────────────────────────────────────────────

describe('PageContent — mobile menu', () => {
  beforeEach(() => {
    mockUsePeer.mockReturnValue({ ...basePeer, connected: true });
  });

  it('hamburger button is present in room view', () => {
    render(<PageContent />);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('opens the mobile menu on click', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    // "Screen Share" only appears in the mobile accordion (desktop says "Screen")
    expect(screen.getByText('Screen Share')).toBeInTheDocument();
  });

  it('closes the mobile menu on second click', async () => {
    render(<PageContent />);
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(screen.queryByText('Screen Share')).not.toBeInTheDocument();
  });
});
