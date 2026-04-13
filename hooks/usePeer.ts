'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  text: string;
  fromSelf: boolean;
  timestamp: number;
}

export interface UsePeerReturn {
  peerId: string | null;
  connected: boolean;
  callActive: boolean;
  messages: Message[];
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  status: string;
  callError: string | null;
  incomingCall: boolean;
  incomingCallType: 'audio' | 'video' | 'screen' | null;
  joinRoom: (remoteId: string) => void;
  sendMessage: (text: string) => void;
  startCall: (type: 'audio' | 'video' | 'screen') => void;
  endCall: () => void;
  leaveRoom: () => void;
  answerCall: () => void;
  declineCall: () => void;
}

export function usePeer(): UsePeerReturn {
  const [peerId, setPeerId]           = useState<string | null>(null);
  const [callError, setCallError]     = useState<string | null>(null);
  const [incomingCallType, setIncomingCallType] = useState<'audio' | 'video' | 'screen' | null>(null);
  const [connected, setConnected]     = useState(false);
  const [callActive, setCallActive]   = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream]   = useState<MediaStream | null>(null);
  const [status, setStatus]           = useState('Initializing...');
  const [incomingCall, setIncomingCall] = useState(false);

  // Refs — never trigger re-renders, safe to read inside callbacks
  const peerRef        = useRef<import('peerjs').Peer | null>(null);
  const dataConnRef    = useRef<import('peerjs').DataConnection | null>(null);
  const mediaConnRef   = useRef<import('peerjs').MediaConnection | null>(null);
  const pendingCallRef = useRef<import('peerjs').MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Keep ref in sync so callbacks that capture it get the latest value
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // ─── Media cleanup ─────────────────────────────────────────────────────────
  const cleanupMediaCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    localStreamRef.current = null;

    mediaConnRef.current?.close();
    mediaConnRef.current = null;

    setRemoteStream(null);
    setCallActive(false);
  }, []);

  // ─── Wire a MediaConnection ────────────────────────────────────────────────
  const setupMediaConnection = useCallback(
    (call: import('peerjs').MediaConnection) => {
      mediaConnRef.current = call;

      call.on('stream', (remote) => {
        setRemoteStream(remote);
        setCallActive(true);
        setStatus('In call');
      });

      call.on('close', () => {
        cleanupMediaCall();
        setStatus('Call ended — chat still active');
      });

      call.on('error', (err) => {
        console.error('[specter-link] call error', err);
        cleanupMediaCall();
      });
    },
    [cleanupMediaCall],
  );

  // ─── Wire a DataConnection ─────────────────────────────────────────────────
  const setupDataConnection = useCallback(
    (conn: import('peerjs').DataConnection) => {
      dataConnRef.current = conn;

      conn.on('open', () => {
        setConnected(true);
        setStatus('Connected');
      });

      conn.on('data', (raw) => {
        if (typeof raw === 'string') {
          setMessages((prev) => [
            ...prev,
            { text: raw, fromSelf: false, timestamp: Date.now() },
          ]);
        }
      });

      conn.on('close', () => {
        setConnected(false);
        cleanupMediaCall();
        setStatus('Peer disconnected');
        dataConnRef.current = null;
      });

      conn.on('error', (err) => {
        setStatus(`Connection error: ${err.message}`);
      });
    },
    [cleanupMediaCall],
  );

  // ─── Bootstrap PeerJS (client-side only) ──────────────────────────────────
  useEffect(() => {
    let destroyed = false;

    async function init() {
      // Dynamic import avoids SSR issues — PeerJS requires window/navigator
      const { Peer } = await import('peerjs');
      if (destroyed) return;

      const isLocalhost =
        !process.env.NEXT_PUBLIC_PEER_HOST ||
        process.env.NEXT_PUBLIC_PEER_HOST === 'localhost' ||
        process.env.NEXT_PUBLIC_PEER_HOST === '127.0.0.1';

      const peer = new Peer({
        host:   process.env.NEXT_PUBLIC_PEER_HOST ?? 'localhost',
        port:   parseInt(process.env.NEXT_PUBLIC_PEER_PORT ?? '9000', 10),
        path:   process.env.NEXT_PUBLIC_PEER_PATH ?? '/peerjs',
        secure: !isLocalhost,
        debug:  0, // suppress verbose PeerJS logs; errors still surface via 'error' event
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        if (!destroyed) {
          setPeerId(id);
          setStatus('Waiting for someone to join…');
        }
      });

      // Host path: receive incoming data connection from guest
      peer.on('connection', (conn) => {
        if (dataConnRef.current) {
          // Already in a room — reject extra connections
          conn.close();
          return;
        }
        setupDataConnection(conn);
      });

      // Either peer can receive an incoming call — always show notification
      peer.on('call', (call) => {
        const type = call.metadata?.type;
        setIncomingCallType(
          type === 'video' || type === 'screen' ? type : 'audio',
        );
        pendingCallRef.current = call;
        setIncomingCall(true);
      });

      peer.on('error', (err) => {
        if (!destroyed) {
          console.error('[specter-link] peer error', err.type, err.message);
          setStatus(`Peer error: ${err.message}`);
        }
      });
    }

    init().catch(console.error);

    return () => {
      destroyed = true;
      peerRef.current?.destroy();
    };
  }, [setupDataConnection, setupMediaConnection]);

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Guest dials the host by pasting the host's Peer ID. */
  const joinRoom = useCallback(
    (remoteId: string) => {
      if (!peerRef.current) return;
      setStatus('Connecting…');
      const conn = peerRef.current.connect(remoteId, {
        reliable: true,
        serialization: 'json',
      });
      setupDataConnection(conn);
    },
    [setupDataConnection],
  );

  const sendMessage = useCallback((text: string) => {
    if (!dataConnRef.current?.open) return;
    dataConnRef.current.send(text);
    setMessages((prev) => [
      ...prev,
      { text, fromSelf: true, timestamp: Date.now() },
    ]);
  }, []);

  const startCall = useCallback(
    async (type: 'audio' | 'video' | 'screen') => {
      if (!peerRef.current || !dataConnRef.current) return;

      let stream: MediaStream;
      try {
        if (type === 'screen') {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video',
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Media access denied or unavailable';
        setCallError(msg);
        return;
      }

      setCallError(null);
      setLocalStream(stream);

      // Guard: connection may have closed while waiting for media permission
      if (!dataConnRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        setLocalStream(null);
        return;
      }

      const remoteId = dataConnRef.current.peer;
      const call = peerRef.current.call(remoteId, stream, { metadata: { type } });
      if (!call) {
        stream.getTracks().forEach((t) => t.stop());
        setLocalStream(null);
        return;
      }
      setupMediaConnection(call);
    },
    [setupMediaConnection],
  );

  /** Stop tracks + close MediaConnection; DataConnection (chat) stays alive. */
  const endCall = useCallback(() => {
    cleanupMediaCall();
    setStatus('Call ended — chat still active');
  }, [cleanupMediaCall]);

  /** Close everything and return to lobby. The Peer instance (and its ID) persists. */
  const leaveRoom = useCallback(() => {
    cleanupMediaCall();
    dataConnRef.current?.close();
    dataConnRef.current = null;
    setConnected(false);
    setMessages([]);
    setStatus('Waiting for someone to join…');
  }, [cleanupMediaCall]);

  const answerCall = useCallback(async () => {
    const call = pendingCallRef.current;
    if (!call) return;

    // Close any leftover call from the previous session before answering
    if (mediaConnRef.current) cleanupMediaCall();

    // Attempt to grab local media so the remote peer gets our stream too
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalStream(stream);
    } catch {
      // Answer receive-only if permissions are denied
    }

    call.answer(stream);
    setupMediaConnection(call);
    pendingCallRef.current = null;
    setIncomingCall(false);
    setIncomingCallType(null);
  }, [cleanupMediaCall, setupMediaConnection]);

  const declineCall = useCallback(() => {
    pendingCallRef.current?.close();
    pendingCallRef.current = null;
    setIncomingCall(false);
    setIncomingCallType(null);
  }, []);

  return {
    peerId,
    connected,
    callActive,
    messages,
    remoteStream,
    localStream,
    status,
    callError,
    incomingCall,
    incomingCallType,
    joinRoom,
    sendMessage,
    startCall,
    endCall,
    leaveRoom,
    answerCall,
    declineCall,
  };
}
