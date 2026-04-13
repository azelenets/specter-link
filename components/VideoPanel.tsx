'use client';

import { memo, useRef, useEffect } from 'react';

interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callActive: boolean;
}

function VideoPanel({ localStream, remoteStream, callActive }: VideoPanelProps) {
  const localRef  = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callActive) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '240px',
          background: 'rgb(var(--color-surface-terminal))',
          border: '1px solid rgb(var(--color-border-dark))',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '2.5rem',
              color: 'rgb(51 65 85)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            videocam_off
          </span>
          <p
            style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono), monospace',
              color: 'rgb(71 85 105)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: '0 0 0.25rem',
            }}
          >
            No Active Call
          </p>
          <p
            style={{
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono), monospace',
              color: 'rgb(51 65 85)',
              margin: 0,
            }}
          >
            Use the toolbar to start audio / video / screen share
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        minHeight: '240px',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Remote stream — full panel */}
      <video
        ref={remoteRef}
        className="video-remote"
        autoPlay
        playsInline
      />

      {/* Waiting overlay when remote hasn't streamed yet */}
      {!remoteStream && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '50%',
              background: 'rgb(var(--color-primary))',
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <p
            style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono), monospace',
              color: 'rgb(var(--color-primary))',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: 0,
            }}
          >
            Waiting for remote stream…
          </p>
        </div>
      )}

      {/* Local stream — picture-in-picture */}
      {localStream && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            width: '11rem',
            height: '8.25rem',
            border: '1px solid rgb(var(--color-primary) / 0.35)',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgb(var(--color-primary) / 0.15)',
          }}
        >
          <video
            ref={localRef}
            className="video-local"
            autoPlay
            playsInline
            muted
          />
        </div>
      )}
    </div>
  );
}

const MemoizedVideoPanel = memo(VideoPanel);
MemoizedVideoPanel.displayName = 'VideoPanel';

export default MemoizedVideoPanel;
