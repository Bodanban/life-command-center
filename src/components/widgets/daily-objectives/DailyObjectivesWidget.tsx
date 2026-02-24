'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonInput from '@/components/ui/NeonInput';
import { useObjectiveStore, getTodayQuests } from '@/stores/useObjectiveStore';
import type { DailyQuest } from '@/stores/useObjectiveStore';

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  routine_matin: { icon: '🌅', label: 'ROUTINE MATIN', color: '#00ff88' },
  routine_weekly: { icon: '📅', label: 'PROGRAMME HEBDO', color: '#00d4ff' },
  routine_soir: { icon: '🌙', label: 'ROUTINE SOIR', color: '#b400ff' },
  sport: { icon: '💪', label: 'SPORT', color: '#00ff88' },
};

function QuestRow({
  quest, completed, onToggle,
}: {
  quest: DailyQuest; completed: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all touch-manipulation min-h-[44px] ${
        completed ? 'bg-white/[0.02]' : 'hover:bg-white/[0.04] active:bg-white/[0.08]'
      }`}
      style={
        completed
          ? { borderLeft: `3px solid ${quest.color}40` }
          : { borderLeft: `3px solid ${quest.color}`, boxShadow: `inset 4px 0 12px ${quest.color}10` }
      }
    >
      {/* Checkbox */}
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          completed ? '' : 'border-2 border-dashed'
        }`}
        style={
          completed
            ? { backgroundColor: quest.color + '30', border: `2px solid ${quest.color}60`, boxShadow: `0 0 10px ${quest.color}40` }
            : { borderColor: quest.color + '40' }
        }
      >
        {completed && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={quest.color} strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <span
        className="text-lg flex-shrink-0"
        style={{ filter: completed ? 'grayscale(0.5) opacity(0.5)' : `drop-shadow(0 0 4px ${quest.color}60)` }}
      >
        {quest.icon}
      </span>

      {/* Title */}
      <span
        className={`font-mono text-[11px] font-semibold truncate text-left transition-all ${
          completed ? 'line-through text-cyber-text-dim/30' : 'text-cyber-text'
        }`}
      >
        {quest.title}
      </span>
    </button>
  );
}

export default function DailyObjectivesWidget() {
  const {
    objectives, addObjective, toggleObjective, removeObjective,
    checkDateReset, completionPercentage, toggleQuest, isQuestCompleted,
  } = useObjectiveStore();

  const [newTitle, setNewTitle] = useState('');
  const [hour, setHour] = useState(new Date().getHours());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkDateReset();
    const interval = setInterval(() => {
      checkDateReset();
      setHour(new Date().getHours());
    }, 60000);
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

  // Phase-aware quests — updates every minute when hour changes
  const quests = useMemo(() => getTodayQuests(hour), [hour]);
  const percentage = completionPercentage();

  // Group by category (preserve order: routine first, then sport)
  const routineQuests = quests.filter((q) => q.category !== 'sport');
  const sportQuests = quests.filter((q) => q.category === 'sport');

  // Category for the routine section
  const routineCategory = routineQuests.length > 0 ? routineQuests[0].category : null;
  const routineConfig = routineCategory ? CATEGORY_CONFIG[routineCategory] : null;

  const routineDone = routineQuests.filter((q) => isQuestCompleted(q.id)).length;
  const sportDone = sportQuests.filter((q) => isQuestCompleted(q.id)).length;
  const persoDone = objectives.filter((o) => o.is_completed).length;

  // Build summary
  const summaryParts: string[] = [];
  if (routineQuests.length > 0 && routineConfig) {
    summaryParts.push(`${routineDone}/${routineQuests.length} ${routineConfig.label.toLowerCase()}`);
  }
  if (sportQuests.length > 0) {
    summaryParts.push(`${sportDone}/${sportQuests.length} sport`);
  }
  if (objectives.length > 0) {
    summaryParts.push(`${persoDone}/${objectives.length} perso`);
  }

  return (
    <WidgetPanel accent="green" title="Objectifs du Jour" icon="🎯" className="h-full">
      <div className="flex flex-col h-full gap-2">
        {/* Progress header */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={percentage === 100 ? '#00ff88' : percentage >= 50 ? '#ffd700' : '#00d4ff'}
                strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${percentage === 100 ? '#00ff8860' : '#00d4ff40'})` }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center font-display text-[10px] font-bold ${
              percentage === 100 ? 'text-cyber-green' : 'text-cyber-text'
            }`}>
              {percentage}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display text-[10px] font-bold text-cyber-text uppercase tracking-wider">
              {percentage === 100 ? 'TOUT EST FAIT !' : percentage >= 50 ? 'CONTINUE' : 'EN COURS'}
            </p>
            <p className="font-mono text-[8px] text-cyber-text-dim/50 mt-0.5 truncate">
              {summaryParts.join(' · ')}
            </p>
          </div>
        </div>

        {/* Scrollable quests list */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 -mx-1 px-1">
          {/* Routine quests (phase-dependent: matin/hebdo/soir) */}
          {routineQuests.length > 0 && routineConfig && (
            <>
              <div className="flex items-center gap-1.5 px-2 pt-1">
                <span className="text-xs">{routineConfig.icon}</span>
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: routineConfig.color + '80' }}>
                  {routineConfig.label}
                </span>
              </div>
              {routineQuests.map((quest) => (
                <QuestRow
                  key={quest.id}
                  quest={quest}
                  completed={isQuestCompleted(quest.id)}
                  onToggle={() => toggleQuest(quest.id)}
                />
              ))}
            </>
          )}

          {/* Sport quests */}
          {sportQuests.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-2 pt-2">
                <span className="text-xs">💪</span>
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-cyber-green/60">
                  SPORT
                </span>
              </div>
              {sportQuests.map((quest) => (
                <QuestRow
                  key={quest.id}
                  quest={quest}
                  completed={isQuestCompleted(quest.id)}
                  onToggle={() => toggleQuest(quest.id)}
                />
              ))}
            </>
          )}

          {/* Manual objectives */}
          {objectives.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-2 pt-2">
                <span className="text-xs">📝</span>
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-cyber-text-dim/40">
                  PERSO
                </span>
              </div>
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all min-h-[44px]"
                  style={{
                    borderLeft: obj.is_completed ? '3px solid rgba(0,255,136,0.3)' : '3px solid rgba(0,255,136,0.8)',
                  }}
                >
                  <button
                    onClick={() => toggleObjective(obj.id)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      obj.is_completed
                        ? 'bg-cyber-green/20 border-2 border-cyber-green/50'
                        : 'border-2 border-dashed border-cyber-green/40'
                    }`}
                    style={obj.is_completed ? { boxShadow: '0 0 8px rgba(0,255,136,0.3)' } : undefined}
                  >
                    {obj.is_completed && (
                      <svg className="w-4 h-4 text-cyber-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`font-mono text-[11px] font-semibold truncate flex-1 transition-all ${
                      obj.is_completed ? 'line-through text-cyber-text-dim/30' : 'text-cyber-text'
                    }`}
                  >
                    {obj.title}
                  </span>
                  <button
                    onClick={() => { if (confirm('Supprimer ?')) removeObjective(obj.id); }}
                    className="opacity-0 group-hover:opacity-100 active:opacity-100 text-cyber-red/40 hover:text-cyber-red text-xs transition-opacity flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add new objective */}
        <div className="flex gap-1 pt-1 border-t border-white/[0.06]">
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
