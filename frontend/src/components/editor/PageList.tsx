import { Button, List } from 'antd';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  onCreatePage: () => Promise<void>;
}

export function PageList({ onCreatePage }: Props) {
  const pages = useEditorStore((state) => state.pages);
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const selectPage = useEditorStore((state) => state.selectPage);
  return (
    <div className="side-panel">
      <Button block onClick={onCreatePage}>新增页面</Button>
      <List
        dataSource={pages}
        renderItem={(page) => (
          <List.Item className={selectedPageId === page.id ? 'active-page' : ''} onClick={() => selectPage(page.id)}>
            Page {page.page_no} · {page.width}×{page.height}
          </List.Item>
        )}
      />
    </div>
  );
}
