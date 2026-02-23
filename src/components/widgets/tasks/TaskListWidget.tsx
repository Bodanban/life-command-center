'use client';

import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
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
  task,
  toggleComplete,
  deleteTask,
  pomodoroCount,
}: {
  task: Task;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  pomodoroCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors ${
        task.is_completed
          ? 'opacity-40 hover:opacity-60'
          : 'hover:bg-white/[0.03]'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-cyber-text-dim/30 hover:text-cyber-text-dim/60 cursor-grab active:cursor-grabbing touch-manipulation"
      >
        <span className="text-[10px] leading-none">⠇</span>
      </button>

      <NeonCheckbox
        checked={task.is_completed}
        onChange={() => toggleComplete(task.id)}
        label={task.title}
        className="flex-1 min-w-0"
      />

      {pomodoroCount > 0 && (
        <span className="flex-shrink-0 font-mono text-[9px] text-cyber-yellow/70 bg-cyber-yellow/10 px-1.5 py-0.5 rounded">
          ⏱{pomodoroCount}
        </span>
      )}

      <NeonBadge variant={priorityConfig[task.priority].variant}>
        {priorityConfig[task.priority].label}
      </NeonBadge>

      <button
        onClick={() => {
          if (confirm('Supprimer cette tâche ?')) deleteTask(task.id);
        }}
        className="opacity-0 group-hover:opacity-100 active:opacity-100 text-cyber-red/60 hover:text-cyber-red text-xs transition-opacity flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}

export default function TaskListWidget() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    filter,
    setFilter,
    filteredTasks,
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = tasks.findIndex((t) => t.id === active.id);
    const toIndex = tasks.findIndex((t) => t.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderTasks(fromIndex, toIndex);
    }
  };

  const activeTask = activeId ? displayedTasks.find((t) => t.id === activeId) : null;

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

        {/* Task list with drag & drop */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          {displayedTasks.length === 0 ? (
            <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-6">
              {filter.priority ? 'Aucune tache avec ce filtre.' : 'Aucune tache. Ajoute-en une !'}
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {displayedTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    toggleComplete={toggleComplete}
                    deleteTask={deleteTask}
                    pomodoroCount={taskSessions?.[task.id] || 0}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeTask && (
                  <div className="glass-panel px-3 py-2 rounded-lg border border-cyber-blue/30 shadow-neon-blue">
                    <span className="font-mono text-xs text-cyber-text">
                      {activeTask.title}
                    </span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
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
