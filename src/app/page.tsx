'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/layout/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-cyber-bg-deep">
      <div className="text-center space-y-3">
        <h1 className="font-display text-2xl font-bold text-cyber-blue text-glow-blue animate-pulse-neon">
          COMMAND CENTER
        </h1>
        <p className="font-mono text-xs text-cyber-text-dim tracking-[0.3em]">
          INITIALISATION...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}
