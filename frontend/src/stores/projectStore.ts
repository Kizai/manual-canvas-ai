import { create } from 'zustand';
import type { Project } from '../types/project';

interface ProjectState {
  projects: Project[];
  currentProject?: Project;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
}));
