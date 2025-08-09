# Changelog

所有重要的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 添加
- 初始项目结构
- Mastra Weather MCP 核心功能
- OpenAI + 天气查看 MCP 集成
- GraphQL-like 工作流系统
- 完整的 TypeScript 支持
- Docker 容器化支持
- CI/CD 管道配置

### 功能特性
- 🤖 **智能天气查询**: 使用 OpenAI 理解自然语言查询
- 🌍 **全球天气数据**: 集成 OpenWeatherMap API
- 🔧 **MCP 工具系统**: 实现 Model Context Protocol
- 📊 **工作流编排**: Mastra 框架驱动的智能流程
- 🚀 **生产就绪**: 完整的错误处理、日志、监控
- 🧪 **全面测试**: 单元测试和集成测试覆盖

### 技术栈
- **前端**: TypeScript + Express.js
- **AI框架**: Mastra + OpenAI GPT-3.5-turbo
- **天气服务**: OpenWeatherMap API
- **工具协议**: Model Context Protocol (MCP)
- **容器化**: Docker + Docker Compose
- **部署**: Vercel + Docker Hub
- **CI/CD**: GitHub Actions

### API 端点
- `GET /` - 应用信息
- `GET /api/health` - 健康检查
- `POST /api/weather` - 智能天气查询
- `GET /api/weather/city/:city` - 直接城市查询
- `GET /api/weather/coordinates/:lat/:lon` - 坐标查询
- `POST /api/weather/batch` - 批量查询
- `POST /api/mastra/workflow/:workflowName` - 执行工作流
- `GET /api/mastra/workflows` - 获取工作流列表

### 开发工具
- ESLint + TypeScript 严格类型检查
- Jest 测试框架
- Docker 开发环境
- 热重载开发服务器
- 自动化部署脚本

### 安全特性
- 输入验证和清理
- 错误处理和日志记录
- 健康检查端点
- 环境变量管理
- CORS 配置

## [1.0.0] - 2025-08-09

### 添加
- 项目初始版本
- 基础的 Mastra Weather MCP 实现
- OpenAI 集成用于自然语言处理
- OpenWeatherMap API 集成
- RESTful API 接口
- Docker 容器化
- 自动化测试套件
- CI/CD 管道
- 完整的项目文档

### 已知问题
- 暂无

### 计划功能
- 天气预报支持（5天预报）
- 多语言支持
- 天气历史数据查询
- 天气告警功能
- 用户偏好设置
- 缓存优化
- 性能监控
- 更多AI模型支持
