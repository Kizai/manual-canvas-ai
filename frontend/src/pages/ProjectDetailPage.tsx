import { Card, Descriptions, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProject } from '../api/project';
import type { Project } from '../types/project';

export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const [project, setProject] = useState<Project>();
  useEffect(() => { fetchProject(projectId).then(setProject); }, [projectId]);
  if (!project) return <main className="page-container">加载中...</main>;
  return <main className="page-container"><Card title={project.name} extra={<Space><Link to="editor">编辑器</Link><Link to="terms">术语库</Link><Link to="tasks">任务</Link></Space>}><Descriptions column={1} items={[{ key: 'desc', label: '描述', children: project.description }, { key: 'source', label: '源语言', children: project.source_language }, { key: 'target', label: '目标语言', children: project.target_languages.join(', ') }, { key: 'size', label: '默认尺寸', children: project.default_page_size }]} /></Card></main>;
}
