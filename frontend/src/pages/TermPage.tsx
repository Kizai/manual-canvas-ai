import { Button, Form, Input, Select, Switch, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createTerm, extractTerms, fetchTerms } from '../api/term';
import type { Term } from '../types/term';

export function TermPage() {
  const { projectId = '' } = useParams();
  const [terms, setTerms] = useState<Term[]>([]);
  useEffect(() => { fetchTerms(projectId).then(setTerms); }, [projectId]);
  const submit = async (values: Omit<Term, 'id' | 'project_id'>) => {
    const term = await createTerm(projectId, values);
    setTerms([term, ...terms]);
  };
  const extract = async () => {
    const task = await extractTerms(projectId);
    message.success(`术语提取任务完成：${task.task_id}`);
    setTerms(await fetchTerms(projectId));
  };
  return <main className="page-container"><h1>术语库</h1><Button onClick={extract}>AI 提取候选术语</Button><Form layout="inline" onFinish={submit} className="term-form"><Form.Item name="source_term" rules={[{ required: true }]}><Input placeholder="中文术语" /></Form.Item><Form.Item name="target_language" initialValue="en-US"><Select options={[{ value: 'en-US' }, { value: 'ja-JP' }]} /></Form.Item><Form.Item name="target_term" rules={[{ required: true }]}><Input placeholder="目标译名" /></Form.Item><Form.Item name="term_type"><Input placeholder="类型" /></Form.Item><Form.Item name="confirmed" valuePropName="checked" initialValue><Switch checkedChildren="确认" /></Form.Item><Button type="primary" htmlType="submit">新增</Button></Form><Table rowKey="id" dataSource={terms} columns={[{ title: '源术语', dataIndex: 'source_term' }, { title: '语言', dataIndex: 'target_language' }, { title: '译名', dataIndex: 'target_term' }, { title: '类型', dataIndex: 'term_type' }, { title: '确认', dataIndex: 'confirmed', render: (v) => v ? '是' : '否' }]} /></main>;
}
