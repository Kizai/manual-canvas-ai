import { beforeEach, describe, expect, it } from 'vitest';
import { makeElement, useEditorStore } from './editorStore';
import type { ManualPage } from '../types/page';

function page(id: string, pageNo: number): ManualPage {
  return { id, project_id: 'proj', page_no: pageNo, width: 595, height: 842, unit: 'pt', background_color: '#fff', elements_json: [] };
}

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({ pages: [], selectedPageId: undefined, selectedElementId: undefined, scale: 1 });
  });

  it('adds, updates and deletes canvas elements', () => {
    useEditorStore.getState().setPages([page('p1', 1)]);
    const text = makeElement('text');
    useEditorStore.getState().addElement('p1', text);
    expect(useEditorStore.getState().pages[0].elements_json).toHaveLength(1);
    useEditorStore.getState().updateElement('p1', text.id, { text: '产品使用说明书' });
    expect(useEditorStore.getState().pages[0].elements_json[0].text).toBe('产品使用说明书');
    useEditorStore.getState().deleteElement('p1', text.id);
    expect(useEditorStore.getState().pages[0].elements_json).toHaveLength(0);
  });

  it('creates markdown-first text blocks with semantic metadata', () => {
    const title = makeElement('text', { markdown: '# 安装说明' });
    expect(title.text).toBe('安装说明');
    expect(title.fontSize).toBe(28);
    expect(title.fontWeight).toBe('bold');
    expect(title.metadata?.markdown).toBe('# 安装说明');
    expect(title.metadata?.mdRole).toBe('heading1');
  });

  it('moves pages up and down while keeping page numbers and selection stable', () => {
    useEditorStore.getState().setPages([page('p1', 1), page('p2', 2), page('p3', 3)]);
    useEditorStore.getState().selectPage('p2');
    useEditorStore.getState().movePage('p2', 'up');
    expect(useEditorStore.getState().pages.map((item) => item.id)).toEqual(['p2', 'p1', 'p3']);
    expect(useEditorStore.getState().pages.map((item) => item.page_no)).toEqual([1, 2, 3]);
    expect(useEditorStore.getState().selectedPageId).toBe('p2');
    useEditorStore.getState().movePage('p2', 'down');
    expect(useEditorStore.getState().pages.map((item) => item.id)).toEqual(['p1', 'p2', 'p3']);
  });

  it('removes the selected page and selects a nearby page', () => {
    useEditorStore.getState().setPages([page('p1', 1), page('p2', 2), page('p3', 3)]);
    useEditorStore.getState().selectPage('p2');
    useEditorStore.getState().removePage('p2');
    expect(useEditorStore.getState().pages.map((item) => item.id)).toEqual(['p1', 'p3']);
    expect(useEditorStore.getState().pages.map((item) => item.page_no)).toEqual([1, 2]);
    expect(useEditorStore.getState().selectedPageId).toBe('p3');
  });
});
