# Manual Canvas AI

Manual Canvas AI 是一个面向产品说明书制作场景的 AI 在线画板系统，目标是替代传统 Word/WPS 在说明书排版、多语言翻译和版本维护中的低效流程。

## MVP 能力

- React 18 + Vite + TypeScript 在线画板
- A4 / A5 / 自定义尺寸说明书页面
- 文本、图片、矩形、线条、表格占位元素编辑与 JSON 保存
- FastAPI 后端，包含用户、项目、页面、术语库、翻译、质检、导出任务 API
- 项目级术语库，翻译时强制使用术语
- 结构化翻译任务：中文页面生成英文/日文页面版本
- 质检任务：漏译、术语不一致、数字不一致、文本溢出风险
- PDF 导出任务，生成可下载文件
- Docker Compose 一键启动 PostgreSQL、RabbitMQ、后端、Worker、前端

## 本地开发

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload
```

默认使用 SQLite 方便本地快速运行；Docker Compose 中使用 PostgreSQL。

### 前端

```bash
cd frontend
npm install
npm run test
npm run build
npm run dev
```

### Docker Compose

```bash
docker compose up --build
```

访问：

- 前端：http://localhost:5173
- 后端 API：http://localhost:8000/docs
- RabbitMQ 管理台：http://localhost:15672

## API 快速体验

1. `POST /api/auth/register` 注册
2. `POST /api/auth/login` 获取 JWT
3. `POST /api/projects` 创建项目
4. `POST /api/projects/{project_id}/pages` 创建页面
5. `PUT /api/pages/{page_id}/elements` 保存画布 JSON
6. `POST /api/projects/{project_id}/translate` 创建翻译任务
7. `POST /api/projects/{project_id}/quality-check` 创建质检任务
8. `POST /api/projects/{project_id}/export/pdf` 导出 PDF
