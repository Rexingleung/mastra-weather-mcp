# 使用 Node.js 18 Alpine 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# 复制 package 文件
COPY package*.json ./

# 安装 Node.js 依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mastra -u 1001

# 更改文件所有权
RUN chown -R mastra:nodejs /app
USER mastra

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
