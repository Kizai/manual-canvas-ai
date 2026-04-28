import { create } from 'zustand';
import type { CanvasElement } from '../types/element';
import type { ManualPage } from '../types/page';

interface EditorState {
  pages: ManualPage[];
  selectedPageId?: string;
  selectedElementId?: string;
  scale: number;
  setPages: (pages: ManualPage[]) => void;
  selectPage: (pageId: string) => void;
  selectElement: (elementId?: string) => void;
  setScale: (scale: number) => void;
  addElement: (pageId: string, element: CanvasElement) => void;
  updateElement: (pageId: string, elementId: string, patch: Partial<CanvasElement>) => void;
  deleteElement: (pageId: string, elementId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  pages: [],
  scale: 1,
  setPages: (pages) => set({ pages, selectedPageId: pages[0]?.id }),
  selectPage: (selectedPageId) => set({ selectedPageId, selectedElementId: undefined }),
  selectElement: (selectedElementId) => set({ selectedElementId }),
  setScale: (scale) => set({ scale }),
  addElement: (pageId, element) => set((state) => ({
    pages: state.pages.map((page) => page.id === pageId ? { ...page, elements_json: [...page.elements_json, element] } : page),
    selectedElementId: element.id,
  })),
  updateElement: (pageId, elementId, patch) => set((state) => ({
    pages: state.pages.map((page) => page.id === pageId ? {
      ...page,
      elements_json: page.elements_json.map((element) => element.id === elementId ? { ...element, ...patch } : element),
    } : page),
  })),
  deleteElement: (pageId, elementId) => set((state) => ({
    pages: state.pages.map((page) => page.id === pageId ? {
      ...page,
      elements_json: page.elements_json.filter((element) => element.id !== elementId),
    } : page),
    selectedElementId: undefined,
  })),
}));

export function makeElement(type: CanvasElement['type']): CanvasElement {
  const id = `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const base = { id, type, x: 60, y: 60, width: 160, height: 80, visible: true, locked: false, opacity: 1 };
  if (type === 'text') return { ...base, text: '双击编辑文本', fontSize: 16, color: '#111827', lineHeight: 1.4 };
  if (type === 'line') return { ...base, height: 0, points: [60, 60, 220, 60], stroke: '#111827' };
  if (type === 'image') return { ...base, src: '', metadata: { placeholder: true } };
  if (type === 'table') return { ...base, width: 240, height: 120, stroke: '#64748b', fill: '#ffffff' };
  return { ...base, stroke: '#111827', fill: '#ffffff' };
}
