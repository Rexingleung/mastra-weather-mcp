#!/bin/bash

# Mastra Weather MCP 开发环境启动脚本

set -e

echo "🚀 启动 Mastra Weather MCP 开发环境..."

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

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 检测到缺少依赖，正在安装..."
    npm install
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️ 未找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "请编辑 .env 文件并填入必要的 API 密钥"
fi

# 检查 API 密钥
source .env

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your-openai-api-key-here" ]; then
    echo "⚠️ 警告: OpenAI API 密钥未设置或使用默认值"
    echo "请在 .env 文件中设置 OPENAI_API_KEY"
fi

if [ -z "$WEATHER_API_KEY" ] || [ "$WEATHER_API_KEY" = "7b7ce26e7819851536a07716a7287129" ]; then
    echo "⚠️ 警告: Weather API 密钥未设置或使用默认值"
    echo "请在 .env 文件中设置 WEATHER_API_KEY"
fi

# 运行类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ TypeScript 类型检查通过"

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo ""
echo "📍 服务地址:"
echo "  API: http://localhost:${PORT:-3000}"
echo "  健康检查: http://localhost:${PORT:-3000}/api/health"
echo "  天气查询: http://localhost:${PORT:-3000}/api/weather"
echo ""
echo "💡 提示:"
echo "  - 按 Ctrl+C 停止服务"
echo "  - 修改代码后服务会自动重启"
echo ""

npm run dev
