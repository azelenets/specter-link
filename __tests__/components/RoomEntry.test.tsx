import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomEntry from '@/components/RoomEntry';

const defaultProps = {
  peerId: null as string | null,
  onJoin: jest.fn(),
  status: 'Initializing...',
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

describe('RoomEntry — peer ID display', () => {
  it('shows spinner while peerId is null', () => {
    render(<RoomEntry {...defaultProps} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('Generating ID…')).toBeInTheDocument();
  });

  it('shows peer ID once available', () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    expect(screen.getByText('abc-123')).toBeInTheDocument();
  });

  it('copies peer ID to clipboard', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc-123');
  });

  it('shows "Copied" feedback after copying', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });
});

describe('RoomEntry — join validation', () => {
  it('shows error when submitting empty ID via Enter', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    // Button is disabled when input is empty; use Enter key to trigger validation
    await userEvent.type(screen.getByLabelText(/remote peer id/i), '{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter the remote peer ID');
    expect(defaultProps.onJoin).not.toHaveBeenCalled();
  });

  it('shows error when connecting to own peer ID', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.type(screen.getByLabelText(/remote peer id/i), 'abc-123');
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot connect to yourself');
    expect(defaultProps.onJoin).not.toHaveBeenCalled();
  });

  it('calls onJoin with trimmed remote ID', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.type(screen.getByLabelText(/remote peer id/i), '  xyz-456  ');
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));
    expect(defaultProps.onJoin).toHaveBeenCalledWith('xyz-456');
  });

  it('submits on Enter key', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.type(screen.getByLabelText(/remote peer id/i), 'xyz-456{Enter}');
    expect(defaultProps.onJoin).toHaveBeenCalledWith('xyz-456');
  });

  it('disables Join Room button when peerId is null', () => {
    render(<RoomEntry {...defaultProps} peerId={null} />);
    expect(screen.getByRole('button', { name: /join room/i })).toBeDisabled();
  });

  it('clears validation error when user starts typing', async () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" />);
    await userEvent.type(screen.getByLabelText(/remote peer id/i), '{Enter}');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/remote peer id/i), 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('RoomEntry — status line', () => {
  it('hides status when value is "Initializing..."', () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" status="Initializing..." />);
    expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
  });

  it('shows status for other values', () => {
    render(<RoomEntry {...defaultProps} peerId="abc-123" status="Connecting…" />);
    expect(screen.getByText('Connecting…')).toBeInTheDocument();
  });
});
