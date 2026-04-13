'use client';

import { useState, type KeyboardEvent } from 'react';
import { Button, Input, Spinner } from '@azelenets/aegis-design-system';

interface RoomEntryProps {
  peerId: string | null;
  onJoin: (remoteId: string) => void;
  status: string;
}

export default function RoomEntry({ peerId, onJoin, status }: RoomEntryProps) {
  const [remoteId, setRemoteId] = useState('');
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);

  const handleCopy = async () => {
    if (!peerId) return;
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in non-secure contexts
    }
  };

  const handleJoin = () => {
    const trimmed = remoteId.trim();
    if (!trimmed) {
      setError('Please enter the remote peer ID');
      return;
    }
    if (trimmed === peerId) {
      setError('Cannot connect to yourself');
      return;
    }
    setError('');
    onJoin(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="room-entry">
      {/* ── Your ID section ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'rgb(100 116 139)',
            margin: 0,
          }}
        >
          Your Peer ID
        </p>

        {!peerId ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              border: '1px solid rgb(var(--color-border-dark))',
              background: 'rgb(var(--color-surface-terminal))',
            }}
          >
            <Spinner size="sm" />
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono), monospace',
                color: 'rgb(100 116 139)',
              }}
            >
              Generating ID…
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              className="truncate-id"
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                border: '1px solid rgb(var(--color-border-dark))',
                background: 'rgb(var(--color-surface-terminal))',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.8rem',
                color: 'rgb(var(--color-primary))',
                letterSpacing: '0.02em',
              }}
            >
              {peerId}
            </div>
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="sm"
              icon={copied ? 'check' : 'content_copy'}
              onClick={handleCopy}
              aria-label="Copy peer ID"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )}

        <p
          style={{
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono), monospace',
            color: 'rgb(51 65 85)',
            margin: 0,
          }}
        >
          Share this ID with the person you want to connect with.
        </p>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgb(var(--color-border-dark))' }} />
        <span
          style={{
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono), monospace',
            color: 'rgb(51 65 85)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          or join a room
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgb(var(--color-border-dark))' }} />
      </div>

      {/* ── Join section ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <Input
          label="Remote Peer ID"
          value={remoteId}
          onChange={(e) => {
            setRemoteId(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste the other person's ID here"
          error={error || undefined}
          disabled={!peerId}
        />
        <Button
          variant="primary"
          size="md"
          icon="login"
          onClick={handleJoin}
          disabled={!peerId || !remoteId.trim()}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Join Room
        </Button>
      </div>

      {/* ── Status line ───────────────────────────────────────────────────── */}
      {status && status !== 'Initializing...' && (
        <p
          style={{
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono), monospace',
            color: 'rgb(100 116 139)',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: 0,
            letterSpacing: '0.12em',
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
