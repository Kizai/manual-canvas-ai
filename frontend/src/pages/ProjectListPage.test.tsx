import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectListPage } from './ProjectListPage';
import { useProjectStore } from '../stores/projectStore';

vi.mock('../api/project', () => ({
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
}));

const api = await import('../api/project');

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectListPage />
    </MemoryRouter>,
  );
}

describe('ProjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({ projects: [], currentProject: undefined });
  });

  it('does not render repeated project actions when /api accidentally returns index.html', async () => {
    vi.mocked(api.fetchProjects).mockResolvedValue('<!doctype html><html></html>' as never);
    renderPage();
    await waitFor(() => expect(screen.getByText('还没有项目，点击右上角新建一个说明书项目。')).toBeInTheDocument());
    expect(screen.getByText('操作失败')).toBeInTheDocument();
    expect(screen.queryAllByText('编辑器')).toHaveLength(0);
  });

  it('creates a project and navigates only after API succeeds', async () => {
    vi.mocked(api.fetchProjects).mockResolvedValue([]);
    vi.mocked(api.createProject).mockResolvedValue({
      id: 'p1',
      user_id: 'u1',
      name: '智能手表说明书',
      description: null,
      source_language: 'zh-CN',
      target_languages: ['en-US'],
      default_page_size: 'A4',
      created_at: 'now',
      updated_at: 'now',
    });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: '新建项目' }));
    await userEvent.type(screen.getByPlaceholderText('例如：智能手表说明书'), '智能手表说明书');
    await userEvent.click(screen.getByRole('button', { name: '创建并进入编辑器' }));
    await waitFor(() => expect(api.createProject).toHaveBeenCalledTimes(1));
  });
});
