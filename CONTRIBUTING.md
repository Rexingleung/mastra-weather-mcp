# 贡献指南

感谢您对 Mastra Weather MCP 项目的关注！我们欢迎各种形式的贡献。

## 🚀 快速开始

### 开发环境设置

1. **克隆仓库**
```bash
git clone https://github.com/Rexingleung/mastra-weather-mcp.git
cd mastra-weather-mcp
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的 API 密钥
```

4. **启动开发服务器**
```bash
npm run dev
# 或使用脚本
./scripts/dev.sh
```

## 📋 贡献类型

我们欢迎以下类型的贡献：

- 🐛 **Bug 修复**
- ✨ **新功能**
- 📚 **文档改进**
- 🧪 **测试增强**
- 🔧 **代码优化**
- 🌐 **国际化**
- 🎨 **UI/UX 改进**

## 🔄 开发流程

### 1. 创建 Issue

在开始工作之前，请先创建一个 Issue 来描述您要解决的问题或添加的功能。

### 2. Fork 和分支

```bash
# Fork 仓库后克隆
git clone https://github.com/YOUR-USERNAME/mastra-weather-mcp.git
cd mastra-weather-mcp

# 创建功能分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 3. 开发和测试

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 构建检查
npm run build
```

### 4. 提交代码

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 提交格式
git commit -m "type(scope): description"

# 示例
git commit -m "feat(mcp): add weather forecast support"
git commit -m "fix(api): handle invalid city names"
git commit -m "docs(readme): update installation guide"
```

#### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI/CD 相关

### 5. 创建 Pull Request

1. 推送您的分支到 GitHub
2. 创建 Pull Request
3. 填写 PR 模板
4. 等待代码审查

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- weather

# 生成覆盖率报告
npm test -- --coverage

# 监听模式
npm test -- --watch
```

### 编写测试

1. **单元测试**: 测试独立的函数和类
2. **集成测试**: 测试组件间的交互
3. **端到端测试**: 测试完整的用户流程

### 测试结构

```
tests/
├── mcp/
│   └── weather.test.ts
├── services/
│   └── weather.test.ts
├── utils/
│   └── helpers.test.ts
└── setup.ts
```

## 📝 代码规范

### TypeScript

- 使用严格的 TypeScript 配置
- 为所有函数和变量添加适当的类型注解
- 避免使用 `any` 类型，如果必须使用请添加注释说明
- 使用接口和类型定义来确保类型安全

### 代码风格

- 使用 ESLint 和 Prettier 保持代码一致性
- 遵循 2 空格缩进
- 使用有意义的变量和函数名
- 添加必要的注释，特别是复杂的业务逻辑

### 文件组织

- 按功能模块组织文件
- 使用相对路径导入项目内部模块
- 导出/导入使用命名导出而非默认导出（除非有特殊需要）

## 🐛 Bug 报告

报告 Bug 时，请包含以下信息：

1. **环境信息**
   - Node.js 版本
   - npm 版本
   - 操作系统

2. **重现步骤**
   - 详细的操作步骤
   - 预期行为
   - 实际行为

3. **错误信息**
   - 控制台错误
   - 日志文件
   - 截图（如果适用）

4. **最小重现示例**
   - 提供能重现问题的最小代码示例

## ✨ 功能请求

提交功能请求时，请说明：

1. **用例**: 为什么需要这个功能
2. **描述**: 功能的详细描述
3. **备选方案**: 是否考虑过其他解决方案
4. **实现建议**: 如果有的话

## 📚 文档贡献

文档改进同样重要：

- 修复错别字和语法错误
- 添加缺失的文档
- 改进代码示例
- 翻译文档到其他语言
- 添加使用案例和教程

## 🔍 代码审查

所有 PR 都需要经过代码审查：

1. **自我审查**: 提交前先自己审查一遍
2. **描述清楚**: PR 描述要清楚说明更改内容
3. **测试**: 确保更改经过测试
4. **文档**: 更新相关文档
5. **响应反馈**: 及时响应审查者的反馈

### 审查关注点

- 代码质量和可读性
- 性能影响
- 安全性考虑
- 测试覆盖率
- 文档完整性
- 向后兼容性

## 🚀 发布流程

1. 更新版本号 (`package.json`)
2. 更新 `CHANGELOG.md`
3. 创建发布标签
4. GitHub Actions 自动构建和部署

## 📞 获得帮助

如果您需要帮助：

- 📧 发送邮件至：rexingleung@126.com
- 💬 创建 [Discussion](https://github.com/Rexingleung/mastra-weather-mcp/discussions)
- 🐛 创建 [Issue](https://github.com/Rexingleung/mastra-weather-mcp/issues)

## 📄 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

---

再次感谢您的贡献！🎉
