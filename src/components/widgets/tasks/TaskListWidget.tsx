'use client';

import { useState, useRef } from 'react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonCheckbox from '@/components/ui/NeonCheckbox';
import NeonInput from '@/components/ui/NeonInput';
import NeonBadge from '@/components/ui/NeonBadge';
import { useTaskStore } from '@/stores/useTaskStore';
import { usePomodoroStore } from '@/stores/usePomodoroStore';
import type { Task } from '@/types/app';

const priorityConfig = {
  high: { label: 'URGENT', variant: 'red' as const },
  medium: { label: 'MOYEN', variant: 'yellow' as const },
  low: { label: 'FAIBLE', variant: 'blue' as const },
};

function SortableTaskItem({
  task, toggleComplete, deleteTask, pomodoroCount,
}: {
  task: Task; toggleComplete: (id: string) => void; deleteTask: (id: string) => void; pomodoroCount: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef} style={style}
      className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors ${
        task.is_completed ? 'opacity-40 hover:opacity-60' : 'hover:bg-white/[0.03]'
      }`}
    >
      <button
        {...attributes} {...listeners}
        className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-cyber-text-dim/30 hover:text-cyber-text-dim/60 cursor-grab active:cursor-grabbing touch-manipulation"
      >
        <span className="text-[10px] leading-none">⠇</span>
      </button>

      <NeonCheckbox checked={task.is_completed} onChange={() => toggleComplete(task.id)} label={task.title} className="flex-1 min-w-0" />

      {pomodoroCount > 0 && (
        <span className="flex-shrink-0 font-mono text-[9px] text-cyber-yellow/70 bg-cyber-yellow/10 px-1.5 py-0.5 rounded">
          ⏱{pomodoroCount}
        </span>
      )}

      <NeonBadge variant={priorityConfig[task.priority].variant}>
        {priorityConfig[task.priority].label}
      </NeonBadge>

      <button
        onClick={() => { if (confirm('Supprimer cette tache ?')) deleteTask(task.id); }}
        className="opacity-0 group-hover:opacity-100 active:opacity-100 text-cyber-red/60 hover:text-cyber-red text-xs transition-opacity flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}

// ===================== COMPACT VIEW =====================
function CompactTasks() {
  const {
    tasks, addTask, deleteTask, toggleComplete, reorderTasks,
    filter, setFilter, filteredTasks,
  } = useTaskStore();

  const taskSessions = usePomodoroStore((s) => s.taskSessions);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [showInput, setShowInput] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayedTasks = filteredTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

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

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = tasks.findIndex((t) => t.id === active.id);
    const toIndex = tasks.findIndex((t) => t.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) reorderTasks(fromIndex, toIndex);
  };

  const activeTask = activeId ? displayedTasks.find((t) => t.id === activeId) : null;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter({ priority: null })}
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all min-h-[44px] ${
            filter.priority === null ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40' : 'text-cyber-text-dim hover:text-cyber-text border border-transparent'
          }`}
        >Toutes</button>
        {(['high', 'medium', 'low'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter({ priority: filter.priority === p ? null : p })}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all min-h-[44px] ${
              filter.priority === p
                ? `bg-${priorityConfig[p].variant === 'red' ? 'cyber-red' : priorityConfig[p].variant === 'yellow' ? 'cyber-yellow' : 'cyber-blue'}/20 text-${priorityConfig[p].variant === 'red' ? 'cyber-red' : priorityConfig[p].variant === 'yellow' ? 'cyber-yellow' : 'cyber-blue'} border border-current/40`
                : 'text-cyber-text-dim hover:text-cyber-text border border-transparent'
            }`}
          >{priorityConfig[p].label}</button>
        ))}
        <button
          onClick={() => setFilter({ showCompleted: !filter.showCompleted })}
          className={`ml-auto px-2 py-0.5 rounded text-[10px] font-mono transition-all min-h-[44px] ${
            filter.showCompleted ? 'text-cyber-green' : 'text-cyber-text-dim hover:text-cyber-text'
          }`}
        >{filter.showCompleted ? '✓ Faites' : '○ Faites'}</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
        {displayedTasks.length === 0 ? (
          <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-6">
            {filter.priority ? 'Aucune tache avec ce filtre.' : 'Aucune tache. Ajoute-en une !'}
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={displayedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {displayedTasks.map((task) => (
                <SortableTaskItem
                  key={task.id} task={task} toggleComplete={toggleComplete}
                  deleteTask={deleteTask} pomodoroCount={taskSessions?.[task.id] || 0}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeTask && (
                <div className="glass-panel px-3 py-2 rounded-lg border border-cyber-blue/30 shadow-neon-blue">
                  <span className="font-mono text-xs text-cyber-text">{activeTask.title}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {showInput ? (
        <div className="space-y-2">
          <NeonInput
            ref={inputRef} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="Nouvelle tache..." accent="blue" className="text-xs" autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyber-text-dim font-mono">Priorite:</span>
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button key={p} onClick={() => setNewPriority(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  newPriority === p ? 'bg-white/10 text-cyber-text' : 'text-cyber-text-dim hover:text-cyber-text'
                }`}
              >{priorityConfig[p].label}</button>
            ))}
            <button onClick={handleAdd} className="ml-auto text-cyber-green text-xs font-mono hover:text-glow-green">
              ✓ Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-2 border border-dashed border-white/10 rounded-lg text-cyber-text-dim text-xs font-mono hover:border-cyber-blue/30 hover:text-cyber-blue transition-all min-h-[44px]"
        >+ Ajouter une tache</button>
      )}
    </div>
  );
}

// ===================== EXPANDED EISENHOWER =====================
const QUADRANTS = [
  { key: 'q1', label: 'URGENT + IMPORTANT', color: '#ff0040', priority: 'high' as const, icon: '🔴' },
  { key: 'q2', label: 'IMPORTANT', color: '#ffd700', priority: 'medium' as const, icon: '🟡' },
  { key: 'q3', label: 'URGENT SEULEMENT', color: '#00d4ff', priority: 'high' as const, icon: '🔵' },
  { key: 'q4', label: 'NI L\'UN NI L\'AUTRE', color: '#666', priority: 'low' as const, icon: '⚪' },
];

function ExpandedTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const taskSessions = usePomodoroStore((s) => s.taskSessions) || {};

  // Map tasks to quadrants: high → Q1, medium → Q2, low → Q4
  const quadrantTasks: Record<string, Task[]> = {
    q1: tasks.filter((t) => t.priority === 'high' && !t.is_completed),
    q2: tasks.filter((t) => t.priority === 'medium' && !t.is_completed),
    q3: [], // No mapping for Q3 since we don't have "urgent only"
    q4: tasks.filter((t) => t.priority === 'low' && !t.is_completed),
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
          Matrice d&apos;Eisenhower
        </p>
        <span className="ml-auto font-mono text-[10px] text-cyber-text-dim">
          {completedCount}/{totalCount} terminees
        </span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {QUADRANTS.map((q) => (
          <div
            key={q.key}
            className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] overflow-y-auto no-scrollbar"
            style={{ border: `1px solid ${q.color}20` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{q.icon}</span>
              <span className="font-display text-[9px] font-bold uppercase tracking-wider" style={{ color: q.color }}>
                {q.label}
              </span>
              <span className="ml-auto font-mono text-[9px] text-cyber-text-dim/40">
                {quadrantTasks[q.key].length}
              </span>
            </div>
            <div className="space-y-1">
              {quadrantTasks[q.key].length === 0 ? (
                <p className="font-mono text-[9px] text-cyber-text-dim/30 text-center py-2">Vide</p>
              ) : (
                quadrantTasks[q.key].map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.03]">
                    <span className="font-mono text-[10px] text-cyber-text truncate flex-1">{task.title}</span>
                    {(taskSessions[task.id] || 0) > 0 && (
                      <span className="font-mono text-[8px] text-cyber-yellow/70">⏱{taskSessions[task.id]}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completed tasks */}
      {completedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-xs">✅</span>
          <span className="font-mono text-[10px] text-cyber-green/70">
            {completedCount} tache(s) terminee(s) aujourd&apos;hui
          </span>
        </div>
      )}
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function TaskListWidget() {
  return (
    <WidgetPanel accent="blue" title="Taches" icon="📋" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedTasks /> : <CompactTasks />
      }
    </WidgetPanel>
  );
}
