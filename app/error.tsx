'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ErrorScreen from '@/components/ErrorScreen';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[specter-link] app error boundary triggered', error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title="Channel Disrupted"
      description="Something went wrong while loading this session. You can retry the current view or return to the lobby."
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
  );
}
