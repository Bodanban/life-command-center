'use client';

import { useState } from 'react';
import NeonInput from '@/components/ui/NeonInput';
import NeonButton from '@/components/ui/NeonButton';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePomodoroStore } from '@/stores/usePomodoroStore';

export default function SettingsPanel() {
  const { closeSettings, resetAllData } = useSettingsStore();
  const pomodoroStore = usePomodoroStore();

  const [workMin, setWorkMin] = useState(pomodoroStore.workMinutes.toString());
  const [breakMin, setBreakMin] = useState(pomodoroStore.breakMinutes.toString());
  const [longBreakMin, setLongBreakMin] = useState(pomodoroStore.longBreakMinutes.toString());
  const [sessionsCount, setSessionsCount] = useState(pomodoroStore.sessionsBeforeLongBreak.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    // Save pomodoro settings
    const w = parseInt(workMin) || 25;
    const b = parseInt(breakMin) || 5;
    const lb = parseInt(longBreakMin) || 15;
    const sc = parseInt(sessionsCount) || 4;
    usePomodoroStore.getState().updateSettings(
      Math.max(1, Math.min(120, w)),
      Math.max(1, Math.min(60, b)),
      Math.max(1, Math.min(60, lb)),
      Math.max(1, Math.min(12, sc))
    );

    closeSettings();
  };

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center animate-expand-backdrop"
      style={{ background: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(12px)' }}
      onClick={closeSettings}
    >
      <div
        className="glass-panel w-[500px] max-w-[90vw] max-h-[85vh] overflow-y-auto animate-expand-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
          <span className="text-lg">⚙️</span>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.25em] text-cyber-blue">
            Reglages
          </h2>
          <button
            onClick={closeSettings}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-cyber-text-dim hover:text-cyber-red hover:border-cyber-red/40 transition-all text-sm font-mono"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Pomodoro Section */}
          <section>
            <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-cyber-purple mb-3 flex items-center gap-2">
              <span className="text-xs">⏱</span> Pomodoro
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] text-cyber-text-dim/60 uppercase mb-1">
                  Travail (min)
                </label>
                <NeonInput
                  type="number"
                  value={workMin}
                  onChange={(e) => setWorkMin(e.target.value)}
                  accent="purple"
                  className="text-xs"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-cyber-text-dim/60 uppercase mb-1">
                  Pause (min)
                </label>
                <NeonInput
                  type="number"
                  value={breakMin}
                  onChange={(e) => setBreakMin(e.target.value)}
                  accent="purple"
                  className="text-xs"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-cyber-text-dim/60 uppercase mb-1">
                  Longue pause (min)
                </label>
                <NeonInput
                  type="number"
                  value={longBreakMin}
                  onChange={(e) => setLongBreakMin(e.target.value)}
                  accent="purple"
                  className="text-xs"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-cyber-text-dim/60 uppercase mb-1">
                  Sessions avant longue pause
                </label>
                <NeonInput
                  type="number"
                  value={sessionsCount}
                  onChange={(e) => setSessionsCount(e.target.value)}
                  accent="purple"
                  className="text-xs"
                  min="1"
                  max="12"
                />
              </div>
            </div>
          </section>

          {/* Data Export/Import */}
          <section>
            <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-cyber-green mb-3 flex items-center gap-2">
              <span className="text-xs">💾</span> Donnees
            </h3>
            <div className="flex items-center gap-3">
              <NeonButton variant="green" size="sm" onClick={() => {
                const stores = ['objective-store', 'habit-store', 'task-store', 'pomodoro-store', 'daily-score-store', 'settings-store', 'routine-tracker-store'];
                const data: Record<string, unknown> = {};
                for (const key of stores) {
                  const raw = localStorage.getItem(key);
                  if (raw) {
                    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
                  }
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lcc-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Exporter mes donnees
              </NeonButton>
              <NeonButton variant="blue" size="sm" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(ev.target?.result as string);
                      for (const [key, value] of Object.entries(data)) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                      }
                      alert('Import reussi ! Rechargement...');
                      window.location.reload();
                    } catch {
                      alert('Fichier invalide.');
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}>
                Importer
              </NeonButton>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <NeonButton variant="green" size="sm" onClick={handleSave}>
              Sauvegarder
            </NeonButton>
            <NeonButton variant="ghost" size="sm" onClick={closeSettings}>
              Annuler
            </NeonButton>
            <div className="ml-auto">
              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-cyber-red">Confirmer ?</span>
                  <NeonButton variant="red" size="sm" onClick={resetAllData}>
                    Oui, tout supprimer
                  </NeonButton>
                  <NeonButton variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                    Non
                  </NeonButton>
                </div>
              ) : (
                <NeonButton variant="red" size="sm" onClick={() => setShowResetConfirm(true)}>
                  Reset donnees
                </NeonButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
