'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import '@azelenets/aegis-design-system/globals.css';
import './globals.css';
import ErrorScreen from '@/components/ErrorScreen';
import { jetBrainsMono, orbitron } from '@/lib/fonts';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[specter-link] global error boundary triggered', error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark" className={`${orbitron.variable} ${jetBrainsMono.variable}`}>
      <body>
        <ErrorScreen
          code="500"
          title="Core Link Failure"
          description="A root application error interrupted the secure channel shell. Retry the app or return to the homepage."
          actions={
            <>
              <button type="button" className="status-button status-button-primary" onClick={() => reset()}>
                Retry
              </button>
              <Link href="/" className="status-link">
                Return Home
              </Link>
            </>
          }
        />
      </body>
    </html>
  );
}
