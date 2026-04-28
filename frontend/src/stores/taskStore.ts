import { create } from 'zustand';
import type { ManualTask } from '../types/task';

interface TaskState {
  tasks: ManualTask[];
  upsertTask: (task: ManualTask) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  upsertTask: (task) => set((state) => ({ tasks: [task, ...state.tasks.filter((item) => item.id !== task.id)] })),
}));
