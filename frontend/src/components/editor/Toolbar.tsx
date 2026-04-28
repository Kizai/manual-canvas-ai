import { Button, Space, Select, Slider, message } from 'antd';
import { makeElement, useEditorStore } from '../../stores/editorStore';
import { exportPdf, qualityCheck, translateProject } from '../../api/task';
import type { Project } from '../../types/project';
import type { CanvasElement } from '../../types/element';

interface Props {
  project?: Project;
  onSave: () => Promise<void>;
  onTaskCreated?: (taskId: string) => void;
}

export function Toolbar({ project, onSave, onTaskCreated }: Props) {
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const selectedPage = useEditorStore((state) => state.pages.find((page) => page.id === selectedPageId));
  const addElement = useEditorStore((state) => state.addElement);
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);

  const add = (type: CanvasElement['type']) => {
    if (!selectedPage) return;
    addElement(selectedPage.id, makeElement(type));
  };

  const runTask = async (kind: 'translate' | 'quality' | 'export') => {
    if (!project) return;
    const target = project.target_languages[0] || 'en-US';
    const pageIds = selectedPage ? [selectedPage.id] : undefined;
    const result = kind === 'translate'
      ? await translateProject(project.id, target, pageIds)
      : kind === 'quality'
        ? await qualityCheck(project.id, target, pageIds)
        : await exportPdf(project.id, target, pageIds);
    onTaskCreated?.(result.task_id);
    message.success(`任务已创建：${result.task_id}`);
  };

  return (
    <Space wrap className="toolbar">
      <Button type="primary" onClick={onSave}>保存</Button>
      <Button onClick={() => add('text')}>文本</Button>
      <Button onClick={() => add('image')}>图片</Button>
      <Button onClick={() => add('rect')}>矩形</Button>
      <Button onClick={() => add('line')}>线条</Button>
      <Button onClick={() => add('table')}>表格占位</Button>
      <Select value={project?.target_languages[0] || 'en-US'} style={{ width: 120 }} options={[{ value: 'en-US', label: '英文' }, { value: 'ja-JP', label: '日文' }]} />
      <Button onClick={() => runTask('translate')}>翻译</Button>
      <Button onClick={() => runTask('quality')}>质检</Button>
      <Button onClick={() => runTask('export')}>导出 PDF</Button>
      <span>缩放</span><Slider min={0.4} max={1.4} step={0.1} value={scale} onChange={setScale} style={{ width: 120 }} />
    </Space>
  );
}
