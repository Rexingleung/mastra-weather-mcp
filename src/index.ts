/**
 * Mastra Weather MCP 应用入口
 */
import dotenv from 'dotenv'
import { validateEnvVars } from './utils/helpers'
import { logger } from './utils/logger'

// 加载环境变量
dotenv.config()

// 验证必需的环境变量
try {
  validateEnvVars([
    'OPENAI_API_KEY',
    'WEATHER_API_KEY'
  ])
} catch (error) {
  logger.error('环境变量验证失败:', error)
  process.exit(1)
}

// 动态导入应用以确保环境变量已加载
const startApp = async () => {
  try {
    const app = await import('./app')
    // 应用已在 app.ts 中自动启动
  } catch (error) {
    logger.error('应用启动失败:', error)
    process.exit(1)
  }
}

// 启动应用
startApp()
