import { Alert, Button, Card, Empty, Form, Input, Modal, Select, Space, Spin, Table, Tag, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProject, fetchProjects } from '../api/project';
import { useProjectStore } from '../stores/projectStore';
import type { Project } from '../types/project';

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string }; status?: number } }).response;
    return response?.data?.detail || `请求失败：HTTP ${response?.status}`;
  }
  if (error instanceof Error) return error.message;
  return '请求失败，请确认后端服务是否启动。';
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((item): item is Project => {
    if (!item || typeof item !== 'object') return false;
    const project = item as Partial<Project>;
    if (!project.id || !project.name || seen.has(project.id)) return false;
    seen.add(project.id);
    return true;
  });
}

export function ProjectListPage() {
  const projects = useProjectStore((state) => state.projects);
  const setProjects = useProjectStore((state) => state.setProjects);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await fetchProjects();
      const normalized = normalizeProjects(data);
      if (!Array.isArray(data)) {
        throw new Error('项目接口返回格式错误：请检查 /api 代理是否指向后端服务。');
      }
      setProjects(normalized);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setProjects([]);
      if (msg.includes('401') || msg.includes('Missing bearer token') || msg.includes('Invalid token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, setProjects]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const onCreate = async (values: { name: string; description?: string; default_page_size: string }) => {
    setCreating(true);
    setError(undefined);
    try {
      const project = await createProject({
        ...values,
        source_language: 'zh-CN',
        target_languages: ['en-US', 'ja-JP'],
      });
      setProjects([project, ...projects.filter((item) => item.id !== project.id)]);
      setOpen(false);
      form.resetFields();
      message.success('项目已创建，正在进入编辑器');
      navigate(`/projects/${project.id}/editor`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      message.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const columns = useMemo(() => [
    {
      title: '项目名称',
      dataIndex: 'name',
      render: (name: string, project: Project) => <Link to={`/projects/${project.id}/editor`}>{name}</Link>,
    },
    {
      title: '源语言',
      dataIndex: 'source_language',
      width: 120,
    },
    {
      title: '目标语言',
      dataIndex: 'target_languages',
      render: (languages: string[]) => <Space>{languages.map((lang) => <Tag key={lang}>{lang}</Tag>)}</Space>,
    },
    {
      title: '页面尺寸',
      dataIndex: 'default_page_size',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_: unknown, project: Project) => (
        <Space>
          <Link to={`/projects/${project.id}/editor`}>编辑器</Link>
          <Link to={`/projects/${project.id}/terms`}>术语库</Link>
          <Link to={`/projects/${project.id}/tasks`}>任务</Link>
        </Space>
      ),
    },
  ], []);

  return (
    <main className="page-container">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Manual Canvas AI</p>
          <h1>多语言产品说明书在线画板</h1>
          <p className="hero-desc">创建说明书项目后，进入编辑器排版页面、维护术语库，并执行翻译、质检和 PDF 导出。</p>
        </div>
        <Space>
          <Button onClick={loadProjects}>刷新</Button>
          <Button type="primary" size="large" onClick={() => setOpen(true)}>新建项目</Button>
        </Space>
      </section>

      {error && <Alert className="page-alert" type="error" showIcon message="操作失败" description={error} />}

      <Card title="项目列表" className="content-card">
        <Spin spinning={loading}>
          {projects.length === 0 && !loading ? (
            <Empty description="还没有项目，点击右上角新建一个说明书项目。" />
          ) : (
            <Table rowKey="id" columns={columns} dataSource={projects} pagination={{ pageSize: 8 }} />
          )}
        </Spin>
      </Card>

      <Modal title="新建说明书项目" open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ default_page_size: 'A4' }}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="例如：智能手表说明书" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="项目用途、产品型号、版本说明等" />
          </Form.Item>
          <Form.Item name="default_page_size" label="页面尺寸">
            <Select options={[{ value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creating} block>创建并进入编辑器</Button>
        </Form>
      </Modal>
    </main>
  );
}
