import { Button, Popconfirm, Space } from 'antd';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  onCreatePage: () => Promise<void>;
  onDeletePage: (pageId: string) => Promise<void>;
}

export function PageList({ onCreatePage, onDeletePage }: Props) {
  const pages = useEditorStore((state) => state.pages);
  const selectedPageId = useEditorStore((state) => state.selectedPageId);
  const selectPage = useEditorStore((state) => state.selectPage);
  const movePage = useEditorStore((state) => state.movePage);
  return (
    <div className="side-panel page-manager">
      <Button block type="primary" onClick={onCreatePage}>新增页面</Button>
      <div className="page-stack">
        {pages.map((page, index) => (
          <div key={page.id} className={`page-card ${selectedPageId === page.id ? 'active-page' : ''}`} onClick={() => selectPage(page.id)}>
            <div className="page-card-title">Page {page.page_no}</div>
            <div className="page-card-meta">{page.width}×{page.height} · {page.elements_json.length} 个元素</div>
            <Space size={4} onClick={(event) => event.stopPropagation()}>
              <Button size="small" disabled={index === 0} onClick={() => movePage(page.id, 'up')}>上移</Button>
              <Button size="small" disabled={index === pages.length - 1} onClick={() => movePage(page.id, 'down')}>下移</Button>
              <Popconfirm title="删除这个页面？" description="当前页面的元素也会一起删除。" okText="删除" cancelText="取消" onConfirm={() => onDeletePage(page.id)}>
                <Button size="small" danger disabled={pages.length <= 1}>删除</Button>
              </Popconfirm>
            </Space>
          </div>
        ))}
      </div>
    </div>
  );
}
