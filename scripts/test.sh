#!/bin/bash

# Mastra Weather MCP 测试脚本

set -e

echo "🧪 运行 Mastra Weather MCP 测试..."

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装测试依赖..."
    npm install
fi

# 运行代码检查
echo "🔍 运行 ESLint 检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查失败"
    exit 1
fi

echo "✅ ESLint 检查通过"

# 运行类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ TypeScript 类型检查通过"

# 运行单元测试
echo "🧪 运行单元测试..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ 单元测试失败"
    exit 1
fi

echo "✅ 单元测试通过"

# 生成覆盖率报告
echo "📊 生成测试覆盖率报告..."
npm test -- --coverage

echo ""
echo "🎉 所有测试通过！"
echo "📊 覆盖率报告已生成在 coverage/ 目录"
