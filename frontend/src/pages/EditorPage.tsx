import { App as AntApp, Layout, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPage, deletePage, fetchPages, reorderPages, savePageElements } from '../api/page';
import { fetchProject } from '../api/project';
import { CanvasStage } from '../components/editor/CanvasStage';
import { PageList } from '../components/editor/PageList';
import { PropertyPanel } from '../components/editor/PropertyPanel';
import { Toolbar } from '../components/editor/Toolbar';
import { useEditorStore } from '../stores/editorStore';
import { useProjectStore } from '../stores/projectStore';

export function EditorPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const setPages = useEditorStore((state) => state.setPages);
  const pages = useEditorStore((state) => state.pages);
  const removePage = useEditorStore((state) => state.removePage);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const [lastTaskId, setLastTaskId] = useState<string>();

  useEffect(() => {
    Promise.all([fetchProject(projectId), fetchPages(projectId)]).then(([project, loadedPages]) => {
      setCurrentProject(project);
      setPages(loadedPages);
    });
  }, [projectId, setCurrentProject, setPages]);

  const save = useCallback(async () => {
    await Promise.all(pages.map((page) => savePageElements(page.id, page.elements_json)));
    if (pages.length > 0) {
      await reorderPages(projectId, pages.map((page) => page.id));
    }
    message.success('页面已保存');
  }, [pages, projectId]);

  const saveAndExit = useCallback(async () => {
    await save();
    navigate('/projects');
  }, [navigate, save]);

  const addPage = async () => {
    const page = await createPage(projectId, currentProject?.default_page_size || 'A4');
    setPages([...pages, page]);
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    removePage(pageId);
    message.success('页面已删除');
  };

  return (
    <AntApp>
      <Layout className="editor-layout">
        <Layout.Header className="editor-header">
          <Toolbar project={currentProject} onSave={save} onSaveAndExit={saveAndExit} onTaskCreated={setLastTaskId} />
          {lastTaskId && <span className="task-hint">最近任务：{lastTaskId}</span>}
        </Layout.Header>
        <Layout>
          <Layout.Sider width={240} theme="light"><PageList onCreatePage={addPage} onDeletePage={handleDeletePage} /></Layout.Sider>
          <Layout.Content className="editor-content"><CanvasStage /></Layout.Content>
          <Layout.Sider width={320} theme="light"><PropertyPanel /></Layout.Sider>
        </Layout>
      </Layout>
    </AntApp>
  );
}
