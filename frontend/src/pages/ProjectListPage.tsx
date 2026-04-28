import { Button, Card, Form, Input, List, Modal, Select, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProject, fetchProjects } from '../api/project';
import { useProjectStore } from '../stores/projectStore';

export function ProjectListPage() {
  const projects = useProjectStore((state) => state.projects);
  const setProjects = useProjectStore((state) => state.setProjects);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { fetchProjects().then(setProjects).catch(() => navigate('/login')); }, [setProjects, navigate]);
  const onCreate = async (values: { name: string; description?: string; default_page_size: string }) => {
    const project = await createProject({ ...values, source_language: 'zh-CN', target_languages: ['en-US', 'ja-JP'] });
    setProjects([project, ...projects]);
    setOpen(false);
    message.success('项目已创建');
    navigate(`/projects/${project.id}/editor`);
  };
  return (
    <main className="page-container">
      <Space className="page-header"><h1>说明书项目</h1><Button type="primary" onClick={() => setOpen(true)}>新建项目</Button></Space>
      <List grid={{ gutter: 16, column: 3 }} dataSource={projects} renderItem={(project) => <List.Item><Card title={project.name}><p>{project.description || '暂无描述'}</p><Space><Link to={`/projects/${project.id}`}>详情</Link><Link to={`/projects/${project.id}/editor`}>编辑器</Link><Link to={`/projects/${project.id}/terms`}>术语库</Link></Space></Card></List.Item>} />
      <Modal title="新建说明书项目" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={onCreate} initialValues={{ default_page_size: 'A4' }}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea /></Form.Item>
          <Form.Item name="default_page_size" label="页面尺寸"><Select options={[{ value: 'A4' }, { value: 'A5' }]} /></Form.Item>
          <Button type="primary" htmlType="submit" block>创建</Button>
        </Form>
      </Modal>
    </main>
  );
}
