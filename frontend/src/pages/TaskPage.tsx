import { Alert } from 'antd';

export function TaskPage() {
  return <main className="page-container"><h1>任务中心</h1><Alert type="info" message="任务可通过编辑器工具栏创建；输入任务 ID 可调用 /api/tasks/{task_id} 查询详情。" /></main>;
}
