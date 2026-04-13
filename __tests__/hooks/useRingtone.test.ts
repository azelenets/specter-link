import { renderHook, act } from '@testing-library/react';
import { useRingtone } from '@/hooks/useRingtone';

// ─── AudioContext mock ────────────────────────────────────────────────────────

const mockClose = jest.fn().mockResolvedValue(undefined);

function makeMockOscillator() {
  const osc = {
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn().mockImplementation(() => {
      // Resolve the onended promise so the ring loop can advance in tests
      setTimeout(() => osc.onended?.(), 0);
    }),
    onended: null as (() => void) | null,
  };
  return osc;
}

const mockGain = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
  },
};

const MockAudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockImplementation(makeMockOscillator),
  createGain: jest.fn().mockReturnValue(mockGain),
  destination: {},
  currentTime: 0,
  close: mockClose,
}));

Object.defineProperty(global, 'AudioContext', { writable: true, value: MockAudioContext });

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useRingtone', () => {
  it('does not create AudioContext when active is false', () => {
    renderHook(() => useRingtone(false));
    expect(MockAudioContext).not.toHaveBeenCalled();
  });

  it('creates AudioContext when active is true', () => {
    renderHook(() => useRingtone(true));
    expect(MockAudioContext).toHaveBeenCalledTimes(1);
  });

  it('closes AudioContext when active transitions from true to false', () => {
    let active = true;
    const { rerender } = renderHook(() => useRingtone(active));
    expect(MockAudioContext).toHaveBeenCalledTimes(1);

    act(() => { active = false; });
    rerender();

    expect(mockClose).toHaveBeenCalled();
  });

  it('closes AudioContext on unmount while active', () => {
    const { unmount } = renderHook(() => useRingtone(true));
    unmount();
    expect(mockClose).toHaveBeenCalled();
  });

  it('does not close any AudioContext on unmount when never active', () => {
    const { unmount } = renderHook(() => useRingtone(false));
    unmount();
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('creates a fresh AudioContext each time active re-activates', () => {
    let active = true;
    const { rerender } = renderHook(() => useRingtone(active));
    expect(MockAudioContext).toHaveBeenCalledTimes(1);

    act(() => { active = false; });
    rerender();
    act(() => { active = true; });
    rerender();

    expect(MockAudioContext).toHaveBeenCalledTimes(2);
  });
});
