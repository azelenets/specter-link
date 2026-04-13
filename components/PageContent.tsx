'use client';

import { useState } from 'react';
import { usePeer } from '@/hooks/usePeer';
import { useRingtone } from '@/hooks/useRingtone';
import RoomEntry from '@/components/RoomEntry';
import Chat from '@/components/Chat';
import VideoPanel from '@/components/VideoPanel';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@azelenets/aegis-design-system';

export default function Page() {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const {
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
  } = usePeer();

  useRingtone(incomingCall && !callActive);

  // ── State A: Lobby ─────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgb(var(--color-bg-dark))',
        }}
      >
        {/* Logo / title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '2rem',
              fontWeight: 900,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 0.4rem',
            }}
          >
            SPECTER
            <span style={{ color: 'rgb(var(--color-primary))' }}>-LINK</span>
          </h1>
          <p
            style={{
              fontSize: '0.6rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgb(51 65 85)',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              margin: 0,
            }}
          >
            Secure · Peer-to-Peer · No Accounts
          </p>
        </div>

        {/* HUD frame */}
        <div
          className="hud-border"
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '2rem 1.75rem',
            background: 'rgb(var(--color-panel-dark) / 0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <RoomEntry peerId={peerId} onJoin={joinRoom} status={status} />
        </div>

        {/* Privacy note */}
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.5625rem',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgb(51 65 85)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            textAlign: 'center',
          }}
        >
          All communication is end-to-end encrypted via WebRTC.
          <br />
          No messages or call content are stored on any server.
        </p>
      </main>
    );
  }

  // ── State B: In Room ───────────────────────────────────────────────────────
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgb(var(--color-bg-dark))',
      }}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <header className="navbar-header">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginRight: 'auto' }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 900,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            SPECTER-LINK
          </span>
          <span
            style={{
              padding: '0.1rem 0.45rem',
              fontSize: '0.5rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: 'rgb(var(--color-primary))',
              color: '#000',
            }}
          >
            LIVE
          </span>
        </div>

        {/* Desktop call controls */}
        <div className="navbar-controls-desktop">
          {!callActive && (
            <>
              <Button variant="ghost" size="sm" icon="volume_up" onClick={() => startCall('audio')}>
                Audio Call
              </Button>
              <Button variant="ghost" size="sm" icon="sensors" onClick={() => startCall('video')}>
                Video Call
              </Button>
              <Button variant="ghost" size="sm" icon="terminal" onClick={() => startCall('screen')}>
                Screen
              </Button>
            </>
          )}
          {callActive && (
            <Button variant="danger" size="sm" icon="cancel" onClick={endCall}>
              End Call
            </Button>
          )}
          <Button variant="danger" size="sm" icon="logout" onClick={() => setConfirmLeave(true)}>
            Leave Room
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#fff' }}>
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </header>

      {/* Mobile accordion menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {!callActive && (
            <>
              <button className="navbar-mobile-item" onClick={() => { setMenuOpen(false); startCall('audio'); }}>
                <span className="material-symbols-outlined">mic</span>
                Audio Call
              </button>
              <button className="navbar-mobile-item" onClick={() => { setMenuOpen(false); startCall('video'); }}>
                <span className="material-symbols-outlined">videocam</span>
                Video Call
              </button>
              <button className="navbar-mobile-item" onClick={() => { setMenuOpen(false); startCall('screen'); }}>
                <span className="material-symbols-outlined">screen_share</span>
                Screen Share
              </button>
            </>
          )}
          {callActive && (
            <button className="navbar-mobile-item navbar-mobile-item--danger" onClick={() => { setMenuOpen(false); endCall(); }}>
              <span className="material-symbols-outlined">call_end</span>
              End Call
            </button>
          )}
          <button className="navbar-mobile-item navbar-mobile-item--danger" onClick={() => { setMenuOpen(false); setConfirmLeave(true); }}>
            <span className="material-symbols-outlined">logout</span>
            Leave Room
          </button>
        </div>
      )}

      {/* ── Media error banner ────────────────────────────────────────── */}
      {callError && (
        <div style={{ padding: '0.5rem 1.5rem', flexShrink: 0 }}>
          <Alert variant="danger">{callError}</Alert>
        </div>
      )}

      {/* ── Incoming call banner ───────────────────────────────────────── */}
      {incomingCall && !callActive && (
        <div
          style={{
            padding: '0.5rem 1.5rem',
            background: 'rgb(var(--color-hazard) / 0.08)',
            borderBottom: '1px solid rgb(var(--color-hazard) / 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: 'rgb(var(--color-hazard))', fontSize: '1.1rem', animation: 'pulse 1s infinite' }}
          >
            call
          </span>
          <span
            style={{
              flex: 1,
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgb(var(--color-hazard))',
            }}
          >
            Incoming {incomingCallType === 'video' ? 'video call' : incomingCallType === 'screen' ? 'screen share' : 'audio call'}
          </span>
          <Button variant="primary" size="sm" icon="check_circle" onClick={answerCall}>
            Answer
          </Button>
          <Button variant="danger" size="sm" icon="cancel" onClick={declineCall}>
            Decline
          </Button>
        </div>
      )}

      {/* ── Privacy reminder (dismissible via leaving) ─────────────────── */}
      <div style={{ padding: '0.5rem 1.5rem', flexShrink: 0 }}>
        <Alert variant="info">
          End-to-end encrypted via WebRTC — no messages or media are stored on any server.
        </Alert>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          padding: '0 1.5rem 1.5rem',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="call-container" style={{ flex: 1 }}>
          <VideoPanel
            localStream={localStream}
            remoteStream={remoteStream}
            callActive={callActive}
          />
          <Chat messages={messages} onSend={sendMessage} />
        </div>
      </div>

      <Modal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        variant="hazard"
        size="sm"
        closeOnBackdrop
        closeOnEscape
      >
        <ModalHeader
          title="Leave Room"
          eyebrow="Confirm"
          onClose={() => setConfirmLeave(false)}
          variant="hazard"
        />
        <ModalBody>
          <p
            style={{
              fontSize: '0.8rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgb(var(--color-text, 203 213 225))',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            This will close the chat and end any active call. The other peer will be disconnected.
          </p>
        </ModalBody>
        <ModalFooter align="right">
          <Button variant="ghost" size="sm" onClick={() => setConfirmLeave(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="logout"
            onClick={() => { setConfirmLeave(false); leaveRoom(); }}
          >
            Leave Room
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}
