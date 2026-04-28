import { App as AntApp, Layout, message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPage, fetchPages, savePageElements } from '../api/page';
import { fetchProject } from '../api/project';
import { CanvasStage } from '../components/editor/CanvasStage';
import { PageList } from '../components/editor/PageList';
import { PropertyPanel } from '../components/editor/PropertyPanel';
import { Toolbar } from '../components/editor/Toolbar';
import { useEditorStore } from '../stores/editorStore';
import { useProjectStore } from '../stores/projectStore';

export function EditorPage() {
  const { projectId = '' } = useParams();
  const setPages = useEditorStore((state) => state.setPages);
  const pages = useEditorStore((state) => state.pages);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const [lastTaskId, setLastTaskId] = useState<string>();

  useEffect(() => {
    Promise.all([fetchProject(projectId), fetchPages(projectId)]).then(([project, loadedPages]) => {
      setCurrentProject(project);
      setPages(loadedPages);
    });
  }, [projectId, setCurrentProject, setPages]);

  const save = async () => {
    await Promise.all(pages.map((page) => savePageElements(page.id, page.elements_json)));
    message.success('页面已保存');
  };
  const addPage = async () => {
    const page = await createPage(projectId, currentProject?.default_page_size || 'A4');
    setPages([...pages, page]);
  };

  return (
    <AntApp>
      <Layout className="editor-layout">
        <Layout.Header className="editor-header"><Toolbar project={currentProject} onSave={save} onTaskCreated={setLastTaskId} />{lastTaskId && <span className="task-hint">最近任务：{lastTaskId}</span>}</Layout.Header>
        <Layout>
          <Layout.Sider width={220} theme="light"><PageList onCreatePage={addPage} /></Layout.Sider>
          <Layout.Content className="editor-content"><CanvasStage /></Layout.Content>
          <Layout.Sider width={280} theme="light"><PropertyPanel /></Layout.Sider>
        </Layout>
      </Layout>
    </AntApp>
  );
}
