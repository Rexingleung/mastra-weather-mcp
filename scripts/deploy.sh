#!/bin/bash

# Mastra Weather MCP 部署脚本

set -e

echo "🚀 开始部署 Mastra Weather MCP..."

# 检查必要的工具
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

echo "✅ 工具检查通过"

# 安装依赖
echo "📦 安装生产依赖..."
npm ci --only=production

# 运行测试
echo "🧪 运行测试..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ 测试失败，停止部署"
    exit 1
fi

echo "✅ 测试通过"

# 类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ TypeScript 类型检查通过"

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"

# 检查部署目标
if command -v mastra &> /dev/null; then
    echo "🌍 部署到 Mastra Cloud..."
    
    # 检查是否已登录
    if ! mastra whoami &> /dev/null; then
        echo "⚠️ 未登录 Mastra，请先登录"
        mastra login
    fi
    
    # 部署到 Mastra
    mastra deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ 成功部署到 Mastra Cloud"
    else
        echo "❌ Mastra 部署失败"
    fi
else
    echo "⚠️ 未找到 Mastra CLI，跳过 Mastra Cloud 部署"
fi

# 检查 Docker 部署
if command -v docker &> /dev/null; then
    echo "🐳 构建 Docker 镜像..."
    
    # 构建镜像
    docker build -t mastra-weather-mcp:latest .
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker 镜像构建成功"
        echo "📝 运行命令: docker run -p 3000:3000 --env-file .env mastra-weather-mcp:latest"
    else
        echo "❌ Docker 镜像构建失败"
    fi
else
    echo "⚠️ 未找到 Docker，跳过 Docker 镜像构建"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 接下来的步骤:"
echo "1. 检查部署状态和日志"
echo "2. 验证 API 端点是否正常工作"
echo "3. 设置监控和告警"
echo ""
echo "📖 详细文档: https://github.com/Rexingleung/mastra-weather-mcp#readme"
