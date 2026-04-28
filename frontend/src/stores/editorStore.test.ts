import { beforeEach, describe, expect, it } from 'vitest';
import { makeElement, useEditorStore } from './editorStore';

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({ pages: [], selectedPageId: undefined, selectedElementId: undefined, scale: 1 });
  });

  it('adds, updates and deletes canvas elements', () => {
    useEditorStore.getState().setPages([{ id: 'p1', project_id: 'proj', page_no: 1, width: 595, height: 842, unit: 'pt', background_color: '#fff', elements_json: [] }]);
    const text = makeElement('text');
    useEditorStore.getState().addElement('p1', text);
    expect(useEditorStore.getState().pages[0].elements_json).toHaveLength(1);
    useEditorStore.getState().updateElement('p1', text.id, { text: '产品使用说明书' });
    expect(useEditorStore.getState().pages[0].elements_json[0].text).toBe('产品使用说明书');
    useEditorStore.getState().deleteElement('p1', text.id);
    expect(useEditorStore.getState().pages[0].elements_json).toHaveLength(0);
  });
});
