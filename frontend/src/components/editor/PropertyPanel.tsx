import { Button, ColorPicker, Form, Input, InputNumber, Space } from 'antd';
import { useEditorStore } from '../../stores/editorStore';

export function PropertyPanel() {
  const pages = useEditorStore((state) => state.pages);
  const pageId = useEditorStore((state) => state.selectedPageId);
  const elementId = useEditorStore((state) => state.selectedElementId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const page = pages.find((item) => item.id === pageId);
  const element = page?.elements_json.find((item) => item.id === elementId);

  if (!page || !element) return <div className="side-panel muted">选择一个元素后编辑属性</div>;

  return (
    <div className="side-panel">
      <h3>属性</h3>
      <Form layout="vertical">
        <Form.Item label="X"><InputNumber value={element.x} onChange={(value) => updateElement(page.id, element.id, { x: Number(value) })} /></Form.Item>
        <Form.Item label="Y"><InputNumber value={element.y} onChange={(value) => updateElement(page.id, element.id, { y: Number(value) })} /></Form.Item>
        <Form.Item label="宽"><InputNumber value={element.width} onChange={(value) => updateElement(page.id, element.id, { width: Number(value) })} /></Form.Item>
        <Form.Item label="高"><InputNumber value={element.height} onChange={(value) => updateElement(page.id, element.id, { height: Number(value) })} /></Form.Item>
        {element.type === 'text' && <>
          <Form.Item label="文本"><Input.TextArea value={element.text} onChange={(event) => updateElement(page.id, element.id, { text: event.target.value })} /></Form.Item>
          <Form.Item label="字号"><InputNumber value={element.fontSize} onChange={(value) => updateElement(page.id, element.id, { fontSize: Number(value) })} /></Form.Item>
          <Form.Item label="颜色"><ColorPicker value={element.color} onChange={(_, hex) => updateElement(page.id, element.id, { color: hex })} /></Form.Item>
        </>}
        <Space><Button danger onClick={() => deleteElement(page.id, element.id)}>删除元素</Button></Space>
      </Form>
    </div>
  );
}
