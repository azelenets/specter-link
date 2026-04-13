'use client';

import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('@/components/PageContent'), {
  ssr: false,
  loading: () => (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(var(--color-bg-dark))',
        color: 'rgb(var(--color-primary))',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '0.75rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      Loading secure channel…
    </main>
  ),
});

export default function PageLoader() {
  return <PageContent />;
}
