# Manual Canvas AI 设计文档

Manual Canvas AI 是一个面向产品说明书制作场景的 AI 在线画板系统，目标是替代传统 Word、WPS 在产品说明书编辑、排版、多语言翻译和版本管理中的低效流程。

## 1. 项目目标

首版 MVP 实现：

1. 用户创建说明书项目。
2. 创建页面，支持 A4、A5、自定义尺寸。
3. 在线画板编辑：文本、图片、矩形、线条、表格占位。
4. 保存页面 JSON 数据。
5. 支持中文说明书翻译成英文、日文。
6. 支持项目级术语库。
7. 支持 AI 检查漏译、术语不一致、文本溢出。
8. 支持导出 PDF。
9. 支持异步翻译任务和导出任务。

不在 MVP：实时多人协作、复杂 Word 完整导入还原、高级权限系统、企业审批流、支付系统。

## 2. 技术选型

- 前端：React 18 + Vite + TypeScript + React-Konva + Zustand + Ant Design + Tailwind CSS
- 后端：FastAPI + SQLAlchemy 2.x + PostgreSQL + RabbitMQ + Celery
- AI 调用：Mimo API / LLM API；当前 MVP 提供可替换的本地规则实现，保证离线可测试
- 文件存储：本地存储，后续可切换 S3/MinIO
- PDF 导出：MVP 使用轻量内置 PDF 生成器，避免重型浏览器依赖；后续可替换 Playwright 获得更高保真渲染
- 鉴权：JWT

## 3. 系统架构

```txt
React Online Canvas Editor
        │ HTTP API
        ▼
FastAPI API ───► PostgreSQL
        │
        ├──────► File Storage
        ▼
RabbitMQ ─────► Celery Worker ─────► Mimo / LLM API
```

## 4. 核心业务流程

### 创建项目

用户创建项目，设置源语言、目标语言和默认页面尺寸；系统创建默认封面页和内容页。

### 在线画板编辑

前端请求页面 JSON，React-Konva 渲染文本、图片、图形、线条、表格占位等元素；用户编辑后保存到后端 JSONB 字段。

### 结构化翻译

系统提取页面文本元素，加载项目术语库，逐块翻译并生成目标语言 page_versions，同时检查文本长度是否存在版面溢出风险。

### 术语库

用户可以手动维护术语，也可以由 AI/规则扫描页面文本生成候选术语，用于后续翻译一致性约束。

### 质量检查

对比源页面和目标语言页面版本，检查漏译、术语不一致、数字/单位不一致、警告语遗漏、文本溢出等问题。

### PDF 导出

读取指定语言版本页面，将页面元素渲染为 PDF 并写入本地文件存储，任务输出下载地址。

## 5. 数据模型

包含 users、projects、pages、page_versions、terms、tasks、files。页面元素在 MVP 中整体保存在 `pages.elements_json` 与 `page_versions.elements_json`，便于快速迭代。

## 6. API 模块

- `/api/auth/*`：注册、登录、当前用户
- `/api/projects/*`：项目 CRUD
- `/api/projects/{project_id}/pages`：页面列表和创建
- `/api/pages/{page_id}`：页面详情
- `/api/pages/{page_id}/elements`：保存画布元素
- `/api/projects/{project_id}/terms`：术语库 CRUD
- `/api/projects/{project_id}/terms/extract`：术语提取任务
- `/api/projects/{project_id}/translate`：翻译任务
- `/api/projects/{project_id}/quality-check`：质检任务
- `/api/projects/{project_id}/export/pdf`：PDF 导出任务
- `/api/tasks/{task_id}`：任务状态
- `/api/files/{file_id}/download`：文件下载

## 7. Agent 设计

MVP 不引入复杂 Agent 框架，先在后端服务函数中实现术语提取、翻译、排版检查、质检四类 Agent 能力，所有函数保持可替换接口，后续可升级为多 Agent 编排。

## 8. 落地优先级

P0：项目创建、页面创建、画板编辑、页面保存、术语库、AI 翻译、PDF 导出。
P1：AI 术语提取、AI 质检、文本溢出检查、翻译版本管理、图片上传。
P2：Word/PDF 导入、模板市场、多人协作、操作历史、审批流程、企业空间。
