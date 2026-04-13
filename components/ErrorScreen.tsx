import Link from 'next/link';
import type { ReactNode } from 'react';

interface ErrorScreenProps {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function ErrorScreen({ code, title, description, actions }: ErrorScreenProps) {
  return (
    <main className="status-shell">
      <div className="hud-border status-card">
        <p className="status-code">{code}</p>
        <h1 className="status-title">{title}</h1>
        <p className="status-copy">{description}</p>

        <div className="status-actions">
          {actions ?? (
            <Link href="/" className="status-link">
              Return Home
            </Link>
          )}
        </div>

        <p className="status-note">
          SPECTER-LINK routes all chat, audio, video, and screen sharing directly between peers.
        </p>
      </div>
    </main>
  );
}
