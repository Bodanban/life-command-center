'use client';

import { useState, useEffect, useRef } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonCheckbox from '@/components/ui/NeonCheckbox';
import NeonInput from '@/components/ui/NeonInput';
import NeonProgressBar from '@/components/ui/NeonProgressBar';
import { useObjectiveStore } from '@/stores/useObjectiveStore';

export default function DailyObjectivesWidget() {
  const {
    objectives,
    addObjective,
    toggleObjective,
    removeObjective,
    checkDateReset,
    completionPercentage,
  } = useObjectiveStore();

  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for day change
  useEffect(() => {
    checkDateReset();
    const interval = setInterval(checkDateReset, 60000);
    return () => clearInterval(interval);
  }, [checkDateReset]);

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addObjective(title);
    setNewTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <WidgetPanel accent="green" title="Objectifs du Jour" icon="🎯" className="h-full">
      <div className="flex flex-col h-full gap-3">
        {/* Progress bar */}
        <NeonProgressBar value={completionPercentage()} size="sm" />

        {/* Objectives list */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
          {objectives.length === 0 ? (
            <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-6">
              Aucun objectif. Ajoute-en un ci-dessous.
            </p>
          ) : (
            objectives.map((obj) => (
              <div
                key={obj.id}
                className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <NeonCheckbox
                  checked={obj.is_completed}
                  onChange={() => toggleObjective(obj.id)}
                  label={obj.title}
                  className="flex-1 min-w-0"
                />
                <button
                  onClick={() => {
                    if (confirm('Supprimer cet objectif ?')) removeObjective(obj.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 active:opacity-100 text-cyber-red/60 hover:text-cyber-red text-xs transition-opacity flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new objective */}
        <div className="flex gap-2">
          <NeonInput
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+ Nouvel objectif..."
            accent="green"
            className="text-xs"
          />
        </div>
      </div>
    </WidgetPanel>
  );
}
