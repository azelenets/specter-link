import { renderHook, act, waitFor } from '@testing-library/react';
import { usePeer } from '@/hooks/usePeer';

// ─── PeerJS mock ─────────────────────────────────────────────────────────────

type EventHandler = (...args: any[]) => void;

function makeMockPeer() {
  const handlers: Record<string, EventHandler> = {};
  return {
    on: jest.fn((event: string, cb: EventHandler) => { handlers[event] = cb; }),
    connect: jest.fn(),
    call: jest.fn(),
    destroy: jest.fn(),
    /** Helper — trigger a registered event in tests */
    _emit(event: string, ...args: any[]) { handlers[event]?.(...args); },
  };
}

type MockPeer = ReturnType<typeof makeMockPeer>;
let mockPeer: MockPeer;

jest.mock('peerjs', () => ({
  Peer: jest.fn().mockImplementation(() => {
    mockPeer = makeMockPeer();
    return mockPeer;
  }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMockCall(type: string | null = 'audio') {
  return {
    metadata: type !== null ? { type } : null,
    on: jest.fn(),
    answer: jest.fn(),
    close: jest.fn(),
  };
}

function makeMockDataConn() {
  const handlers: Record<string, EventHandler> = {};
  return {
    on: jest.fn((event: string, cb: EventHandler) => { handlers[event] = cb; }),
    close: jest.fn(),
    peer: 'remote-peer-id',
    open: true,
    send: jest.fn(),
    _emit(event: string, ...args: any[]) { handlers[event]?.(...args); },
  };
}

/** Waits until the PeerJS Peer constructor has been called by the hook's useEffect */
async function waitForPeer() {
  await waitFor(() => expect(mockPeer).toBeDefined());
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (mockPeer as unknown) = undefined;
});

describe('usePeer — initial state', () => {
  it('returns correct default values', () => {
    const { result } = renderHook(() => usePeer());
    expect(result.current.peerId).toBeNull();
    expect(result.current.connected).toBe(false);
    expect(result.current.callActive).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.remoteStream).toBeNull();
    expect(result.current.localStream).toBeNull();
    expect(result.current.status).toBe('Initializing...');
    expect(result.current.callError).toBeNull();
    expect(result.current.incomingCall).toBe(false);
    expect(result.current.incomingCallType).toBeNull();
  });
});

describe('usePeer — peer lifecycle', () => {
  it('sets peerId and status on peer open event', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();
    act(() => mockPeer._emit('open', 'my-peer-id'));
    expect(result.current.peerId).toBe('my-peer-id');
    expect(result.current.status).toBe('Waiting for someone to join…');
  });

  it('sets status on peer error event', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();
    act(() => mockPeer._emit('error', { type: 'server-error', message: 'Connection refused' }));
    expect(result.current.status).toMatch(/peer error/i);
    expect(result.current.status).toContain('Connection refused');
  });

  it('destroys peer on unmount', async () => {
    const { unmount } = renderHook(() => usePeer());
    await waitForPeer();
    unmount();
    expect(mockPeer.destroy).toHaveBeenCalled();
  });
});

describe('usePeer — data connection', () => {
  it('sets connected=true when data connection opens', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    const conn = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn));
    act(() => conn._emit('open'));

    expect(result.current.connected).toBe(true);
    expect(result.current.status).toBe('Connected');
  });

  it('appends incoming message to messages array', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    const conn = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn));
    act(() => conn._emit('data', 'Hello from peer'));

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ text: 'Hello from peer', fromSelf: false });
  });

  it('resets connected state when connection closes', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    const conn = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn));
    act(() => conn._emit('open'));
    expect(result.current.connected).toBe(true);

    act(() => conn._emit('close'));
    expect(result.current.connected).toBe(false);
    expect(result.current.status).toBe('Peer disconnected');
  });

  it('rejects a second incoming connection while already in a room', async () => {
    const { result: _result } = renderHook(() => usePeer());
    await waitForPeer();

    const conn1 = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn1));
    act(() => conn1._emit('open'));

    const conn2 = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn2));

    expect(conn2.close).toHaveBeenCalled();
  });
});

describe('usePeer — incoming call', () => {
  it('sets incomingCall=true and type="video" for video call', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    act(() => mockPeer._emit('call', makeMockCall('video')));

    expect(result.current.incomingCall).toBe(true);
    expect(result.current.incomingCallType).toBe('video');
  });

  it('sets type="screen" for screen share call', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    act(() => mockPeer._emit('call', makeMockCall('screen')));

    expect(result.current.incomingCallType).toBe('screen');
  });

  it('defaults to "audio" for unknown call type', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    act(() => mockPeer._emit('call', makeMockCall('hologram')));

    expect(result.current.incomingCallType).toBe('audio');
  });

  it('defaults to "audio" when metadata is null', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    act(() => mockPeer._emit('call', makeMockCall(null)));

    expect(result.current.incomingCallType).toBe('audio');
  });
});

describe('usePeer — declineCall', () => {
  it('clears incomingCall state and calls close on the pending call', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    const call = makeMockCall('audio');
    act(() => mockPeer._emit('call', call));
    expect(result.current.incomingCall).toBe(true);

    act(() => result.current.declineCall());

    expect(result.current.incomingCall).toBe(false);
    expect(result.current.incomingCallType).toBeNull();
    expect(call.close).toHaveBeenCalled();
  });
});

describe('usePeer — leaveRoom', () => {
  it('resets connected, messages, and status', async () => {
    const { result } = renderHook(() => usePeer());
    await waitForPeer();

    const conn = makeMockDataConn();
    act(() => mockPeer._emit('connection', conn));
    act(() => conn._emit('open'));
    act(() => conn._emit('data', 'hi'));
    expect(result.current.connected).toBe(true);
    expect(result.current.messages).toHaveLength(1);

    act(() => result.current.leaveRoom());

    expect(result.current.connected).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe('Waiting for someone to join…');
  });
});

describe('usePeer — sendMessage', () => {
  it('is a no-op when there is no open data connection', () => {
    const { result } = renderHook(() => usePeer());
    act(() => result.current.sendMessage('hello'));
    expect(result.current.messages).toEqual([]);
  });
});
