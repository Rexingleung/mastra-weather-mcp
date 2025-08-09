import { Router } from 'express'
import { weatherService } from '../services/weather.service'
import { openaiService } from '../services/openai.service'
import { logger } from '../utils/logger'

const router = Router()

/**
 * GET /api/health
 * 健康检查端点
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // 检查各个服务的健康状态
    const [weatherHealthy, openaiHealthy] = await Promise.all([
      weatherService.checkHealth(),
      openaiService.checkHealth()
    ])

    const responseTime = Date.now() - startTime
    const overall = weatherHealthy && openaiHealthy

    const healthData = {
      status: overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      responseTime: `${responseTime}ms`,
      services: {
        weather: {
          status: weatherHealthy ? 'healthy' : 'unhealthy',
          description: 'OpenWeatherMap API 连接状态'
        },
        openai: {
          status: openaiHealthy ? 'healthy' : 'unhealthy',
          description: 'OpenAI API 连接状态'
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        env: process.env.NODE_ENV || 'development',
        uptime: `${Math.floor(process.uptime())}s`
      }
    }

    // 记录健康检查结果
    logger.info('健康检查完成', {
      overall,
      weather: weatherHealthy,
      openai: openaiHealthy,
      responseTime
    })

    // 根据健康状态设置HTTP状态码
    const statusCode = overall ? 200 : 503
    
    res.status(statusCode).json(healthData)
  } catch (error: any) {
    logger.error('健康检查失败:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: '健康检查执行失败',
      message: error.message
    })
  }
})

/**
 * GET /api/health/detailed
 * 详细健康检查
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // 详细的服务检查
    const checks = {
      weather: {
        name: 'Weather Service',
        healthy: false,
        responseTime: 0,
        error: null as string | null
      },
      openai: {
        name: 'OpenAI Service', 
        healthy: false,
        responseTime: 0,
        error: null as string | null
      }
    }

    // 并发检查所有服务
    await Promise.allSettled([
      // 天气服务检查
      (async () => {
        const checkStart = Date.now()
        try {
          checks.weather.healthy = await weatherService.checkHealth()
          checks.weather.responseTime = Date.now() - checkStart
        } catch (error: any) {
          checks.weather.error = error.message
          checks.weather.responseTime = Date.now() - checkStart
        }
      })(),
      
      // OpenAI 服务检查
      (async () => {
        const checkStart = Date.now()
        try {
          checks.openai.healthy = await openaiService.checkHealth()
          checks.openai.responseTime = Date.now() - checkStart
        } catch (error: any) {
          checks.openai.error = error.message
          checks.openai.responseTime = Date.now() - checkStart
        }
      })()
    ])

    const totalResponseTime = Date.now() - startTime
    const overallHealthy = Object.values(checks).every(check => check.healthy)

    const detailedHealth = {
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalResponseTime: `${totalResponseTime}ms`,
      checks,
      summary: {
        total: Object.keys(checks).length,
        healthy: Object.values(checks).filter(c => c.healthy).length,
        unhealthy: Object.values(checks).filter(c => !c.healthy).length
      },
      system: {
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        cpu: {
          loadAverage: process.loadavg(),
          uptime: `${Math.floor(process.uptime())}s`
        }
      }
    }

    const statusCode = overallHealthy ? 200 : 503
    res.status(statusCode).json(detailedHealth)
  } catch (error: any) {
    logger.error('详细健康检查失败:', error)
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: '详细健康检查执行失败',
      message: error.message
    })
  }
})

/**
 * GET /api/health/metrics
 * 系统指标
 */
router.get('/metrics', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage()
    
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      },
      cpu: {
        loadAverage: process.loadavg()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasWeatherAPI: !!process.env.WEATHER_API_KEY
      }
    }

    res.json(metrics)
  } catch (error: any) {
    logger.error('获取系统指标失败:', error)
    
    res.status(500).json({
      error: '获取系统指标失败',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export { router as healthRoutes }
