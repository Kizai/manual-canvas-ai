import { Button, ColorPicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { parseMarkdownShortcut, useEditorStore } from '../../stores/editorStore';

export function PropertyPanel() {
  const pages = useEditorStore((state) => state.pages);
  const pageId = useEditorStore((state) => state.selectedPageId);
  const elementId = useEditorStore((state) => state.selectedElementId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const page = pages.find((item) => item.id === pageId);
  const element = page?.elements_json.find((item) => item.id === elementId);

  if (!page || !element) {
    return (
      <div className="side-panel muted">
        <h3>Markdown 属性</h3>
        <p>选择一个文本块后，可以用 Markdown 快捷指令控制标题、正文、加粗、下划线、引用和列表。</p>
      </div>
    );
  }

  const updateMarkdown = (markdown: string) => {
    const parsed = parseMarkdownShortcut(markdown);
    updateElement(page.id, element.id, {
      text: parsed.text,
      fontSize: parsed.fontSize,
      fontWeight: parsed.fontWeight,
      fontStyle: parsed.fontStyle,
      textDecoration: parsed.textDecoration,
      color: parsed.color,
      lineHeight: parsed.lineHeight,
      width: Math.max(element.width, parsed.width),
      height: Math.max(element.height, parsed.height),
      metadata: { markdown, mdRole: parsed.mdRole },
    });
  };

  return (
    <div className="side-panel">
      <h3>属性</h3>
      <Form layout="vertical">
        <Form.Item label="X"><InputNumber value={element.x} onChange={(value) => updateElement(page.id, element.id, { x: Number(value) })} /></Form.Item>
        <Form.Item label="Y"><InputNumber value={element.y} onChange={(value) => updateElement(page.id, element.id, { y: Number(value) })} /></Form.Item>
        <Form.Item label="宽"><InputNumber value={element.width} onChange={(value) => updateElement(page.id, element.id, { width: Number(value) })} /></Form.Item>
        <Form.Item label="高"><InputNumber value={element.height} onChange={(value) => updateElement(page.id, element.id, { height: Number(value) })} /></Form.Item>
        {element.type === 'text' && <>
          <Form.Item label="MD 指令">
            <Input.TextArea
              value={String(element.metadata?.markdown || element.text || '')}
              onChange={(event) => updateMarkdown(event.target.value)}
              placeholder="# 标题 / ## 小节 / **加粗** / <u>下划线</u> / - 列表"
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
          <Form.Item label="文本"><Input.TextArea value={element.text} onChange={(event) => updateElement(page.id, element.id, { text: event.target.value })} autoSize /></Form.Item>
          <Form.Item label="字号"><InputNumber value={element.fontSize} min={8} max={96} onChange={(value) => updateElement(page.id, element.id, { fontSize: Number(value) })} /></Form.Item>
          <Form.Item label="字重">
            <Select value={element.fontWeight || 'normal'} onChange={(value) => updateElement(page.id, element.id, { fontWeight: value })} options={[{ value: 'normal', label: '常规' }, { value: 'bold', label: '加粗' }]} />
          </Form.Item>
          <Form.Item label="装饰">
            <Select value={element.textDecoration || 'none'} onChange={(value) => updateElement(page.id, element.id, { textDecoration: value === 'none' ? undefined : value })} options={[{ value: 'none', label: '无' }, { value: 'underline', label: '下划线' }]} />
          </Form.Item>
          <Form.Item label="颜色"><ColorPicker value={element.color} onChange={(_, hex) => updateElement(page.id, element.id, { color: hex })} /></Form.Item>
        </>}
        <Space><Button danger onClick={() => deleteElement(page.id, element.id)}>删除元素</Button></Space>
      </Form>
    </div>
  );
}
