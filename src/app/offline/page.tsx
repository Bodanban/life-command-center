'use client';

export default function OfflinePage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cyber-bg-deep">
      <div className="text-center space-y-4">
        {/* Glitching text effect */}
        <h1 className="font-display text-4xl font-bold text-cyber-red text-glow-red animate-pulse-neon">
          SIGNAL PERDU
        </h1>

        <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-cyber-red to-transparent mx-auto" />

        <p className="font-mono text-sm text-cyber-text-dim">
          Connexion au reseau interrompue
        </p>

        <p className="font-mono text-xs text-cyber-text-dim/50">
          Les donnees locales sont toujours accessibles.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 border border-cyber-blue/40 text-cyber-blue font-mono text-sm rounded-lg hover:bg-cyber-blue/10 hover:shadow-neon-blue transition-all"
        >
          ↻ Reconnecter
        </button>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-red/[0.02] to-transparent h-[200%] animate-scan" />
      </div>
    </div>
  );
}
