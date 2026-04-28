import { Button, Space, Select, Slider, message } from 'antd';
import { useState } from 'react';
import { makeElement, useEditorStore } from '../../stores/editorStore';
import { exportPdf, qualityCheck, translateProject } from '../../api/task';
import type { Project } from '../../types/project';
import type { CanvasElement } from '../../types/element';

interface Props {
  project?: Project;
  onSave: () => Promise<void>;
  onTaskCreated?: (taskId: string) => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string }; status?: number } }).response;
    return response?.data?.detail || `请求失败：HTTP ${response?.status}`;
  }
  if (error instanceof Error) return error.message;
  return '请求失败，请稍后重试。';
}

export function Toolbar({ project, onSave, onTaskCreated }: Props) {
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const selectedPage = useEditorStore((state) => state.pages.find((page) => page.id === selectedPageId));
  const addElement = useEditorStore((state) => state.addElement);
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);
  const [saving, setSaving] = useState(false);
  const [runningTask, setRunningTask] = useState<'translate' | 'quality' | 'export'>();

  const add = (type: CanvasElement['type']) => {
    if (!selectedPage) {
      message.warning('请先创建或选择一个页面');
      return;
    }
    addElement(selectedPage.id, makeElement(type));
  };

  const saveWithFeedback = async () => {
    setSaving(true);
    try {
      await onSave();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const runTask = async (kind: 'translate' | 'quality' | 'export') => {
    if (!project) {
      message.warning('项目仍在加载，请稍后再试');
      return;
    }
    setRunningTask(kind);
    try {
      const target = project.target_languages[0] || 'en-US';
      const pageIds = selectedPage ? [selectedPage.id] : undefined;
      const result = kind === 'translate'
        ? await translateProject(project.id, target, pageIds)
        : kind === 'quality'
          ? await qualityCheck(project.id, target, pageIds)
          : await exportPdf(project.id, target, pageIds);
      onTaskCreated?.(result.task_id);
      message.success(`任务已创建：${result.task_id}`);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setRunningTask(undefined);
    }
  };

  return (
    <Space wrap className="toolbar">
      <Button type="primary" loading={saving} onClick={saveWithFeedback}>保存</Button>
      <Button onClick={() => add('text')}>文本</Button>
      <Button onClick={() => add('image')}>图片</Button>
      <Button onClick={() => add('rect')}>矩形</Button>
      <Button onClick={() => add('line')}>线条</Button>
      <Button onClick={() => add('table')}>表格占位</Button>
      <Select value={project?.target_languages[0] || 'en-US'} style={{ width: 120 }} options={[{ value: 'en-US', label: '英文' }, { value: 'ja-JP', label: '日文' }]} />
      <Button loading={runningTask === 'translate'} onClick={() => runTask('translate')}>翻译</Button>
      <Button loading={runningTask === 'quality'} onClick={() => runTask('quality')}>质检</Button>
      <Button loading={runningTask === 'export'} onClick={() => runTask('export')}>导出 PDF</Button>
      <span>缩放</span><Slider min={0.4} max={1.4} step={0.1} value={scale} onChange={setScale} style={{ width: 120 }} />
    </Space>
  );
}
