import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '@/types/app';

interface TaskFilter {
  priority: 'high' | 'medium' | 'low' | null;
  showCompleted: boolean;
}

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;

  addTask: (title: string, priority?: Task['priority'], category?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  setFilter: (filter: Partial<TaskFilter>) => void;
  filteredTasks: () => Task[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: { priority: null, showCompleted: false },

      addTask: (title, priority = 'medium', category) => {
        const task: Task = {
          id: generateId(),
          user_id: 'local',
          title,
          priority,
          category,
          is_completed: false,
          sort_order: get().tasks.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updated_at: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  is_completed: !task.is_completed,
                  completed_at: !task.is_completed ? new Date().toISOString() : undefined,
                  updated_at: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      reorderTasks: (fromIndex, toIndex) => {
        set((state) => {
          const tasks = [...state.tasks];
          const [moved] = tasks.splice(fromIndex, 1);
          tasks.splice(toIndex, 0, moved);
          return {
            tasks: tasks.map((task, i) => ({ ...task, sort_order: i })),
          };
        });
      },

      setFilter: (newFilter) => {
        set((state) => ({ filter: { ...state.filter, ...newFilter } }));
      },

      filteredTasks: () => {
        const { tasks, filter } = get();
        return tasks
          .filter((task) => {
            if (!filter.showCompleted && task.is_completed) return false;
            if (filter.priority && task.priority !== filter.priority) return false;
            return true;
          })
          .sort((a, b) => {
            // Completed tasks go to bottom
            if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
            return a.sort_order - b.sort_order;
          });
      },
    }),
    { name: 'task-store' }
  )
);
