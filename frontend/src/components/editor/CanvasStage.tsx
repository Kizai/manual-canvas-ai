import { Empty } from 'antd';
import { useEditorStore } from '../../stores/editorStore';
import { PageCanvas } from './PageCanvas';

export function CanvasStage() {
  const pages = useEditorStore((state) => state.pages);
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const page = pages.find((item) => item.id === selectedPageId) || pages[0];
  if (!page) return <Empty description="暂无页面" />;
  return <PageCanvas page={page} />;
}
