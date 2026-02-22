'use client';

import { useState, useRef } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonCheckbox from '@/components/ui/NeonCheckbox';
import NeonInput from '@/components/ui/NeonInput';
import NeonBadge from '@/components/ui/NeonBadge';
import { useTaskStore } from '@/stores/useTaskStore';
import type { Task } from '@/types/app';

const priorityConfig = {
  high: { label: 'URGENT', variant: 'red' as const },
  medium: { label: 'MOYEN', variant: 'yellow' as const },
  low: { label: 'FAIBLE', variant: 'blue' as const },
};

export default function TaskListWidget() {
  const {
    addTask,
    deleteTask,
    toggleComplete,
    filter,
    setFilter,
    filteredTasks,
  } = useTaskStore();

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tasks = filteredTasks();

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addTask(title, newPriority);
    setNewTitle('');
    setNewPriority('medium');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowInput(false);
  };

  return (
    <WidgetPanel accent="blue" title="Taches" icon="📋" className="h-full">
      <div className="flex flex-col h-full gap-3">
        {/* Filter bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter({ priority: null })}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
              filter.priority === null
                ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40'
                : 'text-cyber-text-dim hover:text-cyber-text border border-transparent'
            }`}
          >
            Toutes
          </button>
          {(['high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter({ priority: filter.priority === p ? null : p })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                filter.priority === p
                  ? `bg-${priorityConfig[p].variant === 'red' ? 'cyber-red' : priorityConfig[p].variant === 'yellow' ? 'cyber-yellow' : 'cyber-blue'}/20 text-${priorityConfig[p].variant === 'red' ? 'cyber-red' : priorityConfig[p].variant === 'yellow' ? 'cyber-yellow' : 'cyber-blue'} border border-current/40`
                  : 'text-cyber-text-dim hover:text-cyber-text border border-transparent'
              }`}
            >
              {priorityConfig[p].label}
            </button>
          ))}
          <button
            onClick={() => setFilter({ showCompleted: !filter.showCompleted })}
            className={`ml-auto px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              filter.showCompleted
                ? 'text-cyber-green'
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            {filter.showCompleted ? '✓ Faites' : '○ Faites'}
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          {tasks.length === 0 ? (
            <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-6">
              {filter.priority ? 'Aucune tache avec ce filtre.' : 'Aucune tache. Ajoute-en une !'}
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all ${
                  task.is_completed
                    ? 'opacity-40 hover:opacity-60'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <NeonCheckbox
                  checked={task.is_completed}
                  onChange={() => toggleComplete(task.id)}
                  label={task.title}
                  className="flex-1 min-w-0"
                />
                <NeonBadge variant={priorityConfig[task.priority].variant}>
                  {priorityConfig[task.priority].label}
                </NeonBadge>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-cyber-red/60 hover:text-cyber-red text-xs transition-opacity flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new task */}
        {showInput ? (
          <div className="space-y-2">
            <NeonInput
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nouvelle tache..."
              accent="blue"
              className="text-xs"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyber-text-dim font-mono">Priorite:</span>
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    newPriority === p
                      ? 'bg-white/10 text-cyber-text'
                      : 'text-cyber-text-dim hover:text-cyber-text'
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
              <button
                onClick={handleAdd}
                className="ml-auto text-cyber-green text-xs font-mono hover:text-glow-green"
              >
                ✓ Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-cyber-text-dim text-xs font-mono hover:border-cyber-blue/30 hover:text-cyber-blue transition-all"
          >
            + Ajouter une tache
          </button>
        )}
      </div>
    </WidgetPanel>
  );
}
