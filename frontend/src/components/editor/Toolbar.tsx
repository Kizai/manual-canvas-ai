import { Button, Dropdown, Space, Select, Slider, message } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import { makeElement, useEditorStore } from '../../stores/editorStore';
import { exportPdf, qualityCheck, translateProject } from '../../api/task';
import type { Project } from '../../types/project';
import type { CanvasElement } from '../../types/element';

interface Props {
  project?: Project;
  onSave: () => Promise<void>;
  onSaveAndExit?: () => Promise<void>;
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

const markdownBlocks: MenuProps['items'] = [
  { key: '# 产品说明书', label: 'H1 标题 / # 产品说明书' },
  { key: '## 安装步骤', label: 'H2 小节 / ## 安装步骤' },
  { key: '### 注意事项', label: 'H3 段落标题 / ### 注意事项' },
  { key: '正文内容', label: '正文 / 普通段落' },
  { key: '**重点内容**', label: '加粗 / **重点内容**' },
  { key: '<u>下划线内容</u>', label: '下划线 / <u>下划线内容</u>' },
  { key: '> 安全提示：请先断电再操作', label: '引用提示 / > 安全提示' },
  { key: '- 第一步操作说明', label: '项目符号 / - 第一步' },
  { key: '1. 第一步操作说明', label: '编号步骤 / 1. 第一步' },
];

export function Toolbar({ project, onSave, onSaveAndExit, onTaskCreated }: Props) {
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const selectedPage = useEditorStore((state) => state.pages.find((page) => page.id === selectedPageId));
  const addElement = useEditorStore((state) => state.addElement);
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [runningTask, setRunningTask] = useState<'translate' | 'quality' | 'export'>();

  const add = (type: CanvasElement['type'], markdown?: string) => {
    if (!selectedPage) {
      message.warning('请先创建或选择一个页面');
      return;
    }
    addElement(selectedPage.id, makeElement(type, { markdown }));
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

  const saveAndExit = async () => {
    setExiting(true);
    try {
      await (onSaveAndExit || onSave)();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setExiting(false);
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
      <Button loading={exiting} onClick={saveAndExit}>保存并退出</Button>
      <Dropdown menu={{ items: markdownBlocks, onClick: ({ key }) => add('text', key) }} trigger={['click']}>
        <Button>MD 快捷块</Button>
      </Dropdown>
      <Button onClick={() => add('text', '正文内容')}>正文</Button>
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
