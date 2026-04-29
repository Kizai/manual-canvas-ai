import { create } from 'zustand';
import type { CanvasElement, MarkdownRole } from '../types/element';
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
  movePage: (pageId: string, direction: 'up' | 'down') => void;
  removePage: (pageId: string) => void;
}

function renumberPages(pages: ManualPage[]): ManualPage[] {
  return pages.map((page, index) => ({ ...page, page_no: index + 1 }));
}

export const useEditorStore = create<EditorState>((set) => ({
  pages: [],
  scale: 1,
  setPages: (pages) => set({ pages: renumberPages(pages), selectedPageId: pages[0]?.id, selectedElementId: undefined }),
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
      elements_json: page.elements_json.map((element) => element.id === elementId ? { ...element, ...patch, metadata: { ...element.metadata, ...patch.metadata } } : element),
    } : page),
  })),
  deleteElement: (pageId, elementId) => set((state) => ({
    pages: state.pages.map((page) => page.id === pageId ? {
      ...page,
      elements_json: page.elements_json.filter((element) => element.id !== elementId),
    } : page),
    selectedElementId: undefined,
  })),
  movePage: (pageId, direction) => set((state) => {
    const pages = [...state.pages];
    const index = pages.findIndex((page) => page.id === pageId);
    if (index === -1) return state;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return state;
    [pages[index], pages[targetIndex]] = [pages[targetIndex], pages[index]];
    return { pages: renumberPages(pages), selectedPageId: pageId };
  }),
  removePage: (pageId) => set((state) => {
    const index = state.pages.findIndex((page) => page.id === pageId);
    if (index === -1) return state;
    const pages = renumberPages(state.pages.filter((page) => page.id !== pageId));
    const fallback = pages[Math.min(index, pages.length - 1)] || pages[index - 1];
    return { pages, selectedPageId: fallback?.id, selectedElementId: undefined };
  }),
}));

interface MakeElementOptions {
  markdown?: string;
}

export function parseMarkdownShortcut(markdown: string): {
  text: string;
  mdRole: MarkdownRole;
  fontSize: number;
  fontWeight: string;
  fontStyle?: string;
  textDecoration?: string;
  color: string;
  lineHeight: number;
  width: number;
  height: number;
} {
  const source = markdown.trim();
  const withoutBold = source.replace(/\*\*(.*?)\*\*/g, '$1');
  const withoutUnderline = withoutBold.replace(/<u>(.*?)<\/u>/g, '$1');
  const cleanInline = withoutUnderline.replace(/_(.*?)_/g, '$1').trim();
  if (source.startsWith('# ')) {
    return { text: cleanInline.replace(/^#\s+/, ''), mdRole: 'heading1', fontSize: 28, fontWeight: 'bold', color: '#0f172a', lineHeight: 1.2, width: 420, height: 54 };
  }
  if (source.startsWith('## ')) {
    return { text: cleanInline.replace(/^##\s+/, ''), mdRole: 'heading2', fontSize: 22, fontWeight: 'bold', color: '#1e293b', lineHeight: 1.25, width: 380, height: 46 };
  }
  if (source.startsWith('### ')) {
    return { text: cleanInline.replace(/^###\s+/, ''), mdRole: 'heading3', fontSize: 18, fontWeight: 'bold', color: '#334155', lineHeight: 1.3, width: 340, height: 40 };
  }
  if (source.startsWith('> ')) {
    return { text: cleanInline.replace(/^>\s+/, ''), mdRole: 'quote', fontSize: 15, fontWeight: 'normal', fontStyle: 'italic', color: '#475569', lineHeight: 1.5, width: 420, height: 72 };
  }
  if (source.startsWith('- ')) {
    return { text: `• ${cleanInline.replace(/^[-*]\s+/, '')}`, mdRole: 'bullet', fontSize: 15, fontWeight: 'normal', color: '#111827', lineHeight: 1.45, width: 380, height: 42 };
  }
  if (/^\d+\.\s+/.test(source)) {
    return { text: cleanInline, mdRole: 'numbered', fontSize: 15, fontWeight: 'normal', color: '#111827', lineHeight: 1.45, width: 380, height: 42 };
  }
  return {
    text: cleanInline || '正文内容',
    mdRole: 'body',
    fontSize: 15,
    fontWeight: source.includes('**') ? 'bold' : 'normal',
    fontStyle: /(^|\s)_[^_]+_/.test(source) ? 'italic' : undefined,
    textDecoration: source.includes('<u>') ? 'underline' : undefined,
    color: '#111827',
    lineHeight: 1.45,
    width: 360,
    height: 64,
  };
}

export function makeElement(type: CanvasElement['type'], options: MakeElementOptions = {}): CanvasElement {
  const id = `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const base = { id, type, x: 60, y: 60, width: 160, height: 80, visible: true, locked: false, opacity: 1 };
  if (type === 'text') {
    const markdown = options.markdown || '正文内容';
    const parsed = parseMarkdownShortcut(markdown);
    return {
      ...base,
      width: parsed.width,
      height: parsed.height,
      text: parsed.text,
      fontSize: parsed.fontSize,
      fontWeight: parsed.fontWeight,
      fontStyle: parsed.fontStyle,
      textDecoration: parsed.textDecoration,
      color: parsed.color,
      lineHeight: parsed.lineHeight,
      metadata: { markdown, mdRole: parsed.mdRole },
    };
  }
  if (type === 'line') return { ...base, height: 0, points: [60, 60, 220, 60], stroke: '#111827' };
  if (type === 'image') return { ...base, src: '', metadata: { placeholder: true } };
  if (type === 'table') return { ...base, width: 240, height: 120, stroke: '#64748b', fill: '#ffffff' };
  return { ...base, stroke: '#111827', fill: '#ffffff' };
}
