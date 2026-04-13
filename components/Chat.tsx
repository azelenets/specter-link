'use client';

import { memo, useCallback, useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { Button, Input } from '@azelenets/aegis-design-system';
import type { Message } from '@/hooks/usePeer';

interface ChatProps {
  messages: Message[];
  onSend: (text: string) => void;
}

function Chat({ messages, onSend }: ChatProps) {
  const [input, setInput]   = useState('');
  const scrollRef           = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  }, [input, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="chat-container">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '0.625rem 1rem',
          borderBottom: '1px solid rgb(var(--color-border-dark))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '1rem', color: 'rgb(var(--color-primary) / 0.6)' }}
        >
          forum
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'rgb(100 116 139)',
          }}
        >
          Secure Chat
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.5625rem',
            fontFamily: 'var(--font-mono), monospace',
            color: 'rgb(51 65 85)',
          }}
        >
          {messages.length} msg{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Message list ────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          minHeight: 0,
        }}
      >
        {messages.length === 0 && (
          <p
            style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono), monospace',
              color: 'rgb(51 65 85)',
              textAlign: 'center',
              textTransform: 'uppercase',
              marginTop: '1rem',
            }}
          >
            No messages yet. Say hello.
          </p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={msg.fromSelf ? 'message-self' : 'message-peer'}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '0.625rem',
          borderTop: '1px solid rgb(var(--color-border-dark))',
          display: 'flex',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            aria-label="Message input"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          icon="arrow_forward"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

const MemoizedChat = memo(Chat);
MemoizedChat.displayName = 'Chat';

export default MemoizedChat;
