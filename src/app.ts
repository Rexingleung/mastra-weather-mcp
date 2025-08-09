import { Mastra } from '@mastra/core'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import config from '../mastra.config'
import { weatherRoutes } from './routes/weather'
import { healthRoutes } from './routes/health'
import { errorHandler, notFoundHandler } from './utils/middleware'
import { logger } from './utils/logger'

// 加载环境变量
dotenv.config()

/**
 * Mastra Weather MCP 应用
 */
class WeatherMCPApp {
  private app: express.Application
  private mastra: Mastra
  private port: number

  constructor() {
    this.app = express()
    this.port = parseInt(process.env.PORT || '3000')
    this.mastra = new Mastra(config)
    
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // CORS 配置
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }))

    // 请求解析
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // 请求日志
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method === 'POST' ? req.body : undefined
      })
      next()
    })
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 根路径
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Mastra Weather MCP',
        version: '1.0.0',
        description: '基于 OpenAI + Mastra + 天气查看 MCP 的 AI 应用',
        endpoints: {
          weather: '/api/weather',
          health: '/api/health',
          mastra: '/api/mastra'
        },
        documentation: 'https://github.com/Rexingleung/mastra-weather-mcp#readme',
        timestamp: new Date().toISOString()
      })
    })

    // API 路由
    this.app.use('/api/health', healthRoutes)
    this.app.use('/api/weather', weatherRoutes(this.mastra))
    
    // Mastra 工作流路由
    this.app.post('/api/mastra/workflow/:workflowName', async (req, res) => {
      try {
        const { workflowName } = req.params
        const { input, ...options } = req.body

        logger.info(`执行工作流: ${workflowName}`, { input, options })

        const result = await this.mastra.runWorkflow(workflowName, {
          input,
          ...options
        })

        res.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        })
      } catch (error: any) {
        logger.error('工作流执行失败:', error)
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    })

    // 获取可用工作流列表
    this.app.get('/api/mastra/workflows', (req, res) => {
      const workflows = Object.keys(config.workflows || {})
      res.json({
        success: true,
        data: {
          workflows,
          count: workflows.length
        },
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 404 处理
    this.app.use(notFoundHandler)
    
    // 错误处理
    this.app.use(errorHandler)
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    try {
      // 初始化 Mastra
      await this.mastra.init()
      logger.info('Mastra 初始化完成')

      // 启动服务器
      this.app.listen(this.port, '0.0.0.0', () => {
        logger.info(`🚀 Mastra Weather MCP 服务启动成功`, {
          port: this.port,
          env: process.env.NODE_ENV || 'development',
          endpoints: {
            api: `http://localhost:${this.port}/api`,
            health: `http://localhost:${this.port}/api/health`,
            weather: `http://localhost:${this.port}/api/weather`
          }
        })
      })
    } catch (error) {
      logger.error('服务启动失败:', error)
      process.exit(1)
    }
  }

  /**
   * 优雅关闭
   */
  public async shutdown(): Promise<void> {
    try {
      logger.info('正在关闭服务...')
      // 这里可以添加清理逻辑
      process.exit(0)
    } catch (error) {
      logger.error('关闭服务时出错:', error)
      process.exit(1)
    }
  }
}

// 创建应用实例
const app = new WeatherMCPApp()

// 处理进程信号
process.on('SIGTERM', () => app.shutdown())
process.on('SIGINT', () => app.shutdown())

// 启动应用
if (require.main === module) {
  app.start().catch((error) => {
    logger.error('应用启动失败:', error)
    process.exit(1)
  })
}

export default app
