#!/bin/bash

# Mastra Weather MCP 项目初始化脚本

set -e

echo "🛠️ 初始化 Mastra Weather MCP 项目..."

# 检查必要的工具
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 检查通过"

# 检查 Node.js 版本
NODE_VERSION=$(node --version | sed 's/v//')
MIN_NODE_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$MIN_NODE_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "⚠️ 警告: Node.js 版本过低 ($NODE_VERSION)"
    echo "推荐使用 Node.js 18.0.0 或更高版本"
fi

# 安装前端依赖
echo "📦 安装项目依赖..."
npm install
echo "✅ 项目依赖安装完成"

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo "⚠️ 请编辑 .env 文件并填入必要的 API 密钥:"
    echo "   - OPENAI_API_KEY: https://platform.openai.com/api-keys"
    echo "   - WEATHER_API_KEY: https://openweathermap.org/api"
else
    echo "✅ .env 文件已存在"
fi

# 运行类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ TypeScript 类型检查通过"

# 运行代码检查
echo "🔍 运行 ESLint 代码检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查失败"
    exit 1
fi

echo "✅ ESLint 检查通过"

# 运行测试
echo "🧪 运行测试..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ 测试失败"
    exit 1
fi

echo "✅ 测试通过"

# 检查 Docker（可选）
if command -v docker &> /dev/null; then
    echo "🐳 检测到 Docker，测试容器构建..."
    docker build -t mastra-weather-mcp:test .
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker 镜像构建成功"
        # 清理测试镜像
        docker rmi mastra-weather-mcp:test
    else
        echo "⚠️ Docker 镜像构建失败，但不影响项目运行"
    fi
else
    echo "⚠️ 未检测到 Docker，跳过容器测试"
fi

# 给脚本添加执行权限
chmod +x scripts/*.sh

echo ""
echo "🎉 项目初始化完成！"
echo ""
echo "📋 接下来的步骤:"
echo "1. 编辑 .env 文件，填入 API 密钥"
echo "2. 启动开发服务器: npm run dev 或 ./scripts/dev.sh"
echo "3. 访问 http://localhost:3000 测试应用"
echo "4. 查看 API 文档: http://localhost:3000/api/health"
echo ""
echo "🔗 有用的命令:"
echo "  - npm run dev        # 启动开发服务器"
echo "  - npm test           # 运行测试"
echo "  - npm run build      # 构建生产版本"
echo "  - npm run lint       # 代码检查"
echo "  - ./scripts/deploy.sh # 部署应用"
echo ""
echo "📖 详细文档: https://github.com/Rexingleung/mastra-weather-mcp#readme"
