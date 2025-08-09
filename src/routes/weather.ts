import { Router } from 'express'
import { Mastra } from '@mastra/core'
import { z } from 'zod'
import { weatherService } from '../services/weather.service'
import { openaiService } from '../services/openai.service'
import { logger } from '../utils/logger'
import { validateRequest } from '../utils/middleware'

// 天气查询请求验证模式
const WeatherQuerySchema = z.object({
  query: z.string().min(1, '查询内容不能为空').max(500, '查询内容过长'),
  useWorkflow: z.boolean().optional().default(true),
})

/**
 * 创建天气路由
 */
export function weatherRoutes(mastra: Mastra): Router {
  const router = Router()

  /**
   * POST /api/weather
   * 智能天气查询
   */
  router.post('/', validateRequest(WeatherQuerySchema), async (req, res) => {
    try {
      const { query, useWorkflow } = req.body
      
      logger.info('收到天气查询请求', { query, useWorkflow })

      if (useWorkflow) {
        // 使用 Mastra 工作流处理
        const result = await mastra.runWorkflow('weatherQuery', {
          input: query
        })

        res.json({
          success: true,
          data: {
            response: result.formatResponse || '抱歉，无法生成天气回复。',
            workflow: result,
            method: 'workflow'
          },
          timestamp: new Date().toISOString()
        })
      } else {
        // 直接使用服务处理
        const locationResult = await openaiService.parseLocation(query)
        
        if (locationResult.confidence < 0.5) {
          return res.status(400).json({
            success: false,
            error: '无法识别查询中的位置信息，请提供具体的城市名称。',
            timestamp: new Date().toISOString()
          })
        }

        const weatherData = await weatherService.getCurrentWeather({
          city: locationResult.city,
          country: locationResult.country
        })

        if (!weatherData.success) {
          return res.status(404).json({
            success: false,
            error: weatherData.error,
            timestamp: new Date().toISOString()
          })
        }

        const formattedResponse = await openaiService.formatWeatherResponse({
          weatherData: weatherData.data,
          originalQuery: query
        })

        res.json({
          success: true,
          data: {
            response: formattedResponse,
            location: locationResult,
            weather: weatherData.data,
            method: 'direct'
          },
          timestamp: new Date().toISOString()
        })
      }
    } catch (error: any) {
      logger.error('天气查询处理失败:', error)
      res.status(500).json({
        success: false,
        error: '处理天气查询时出现错误，请稍后重试。',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * GET /api/weather/city/:city
   * 直接城市天气查询
   */
  router.get('/city/:city', async (req, res) => {
    try {
      const { city } = req.params
      const { country = 'CN', units = 'metric' } = req.query

      logger.info('直接城市天气查询', { city, country, units })

      const weatherData = await weatherService.getCurrentWeather({
        city,
        country: country as string,
        units: units as 'metric' | 'imperial' | 'kelvin'
      })

      if (!weatherData.success) {
        return res.status(404).json({
          success: false,
          error: weatherData.error,
          timestamp: new Date().toISOString()
        })
      }

      res.json({
        success: true,
        data: weatherData.data,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      logger.error('直接天气查询失败:', error)
      res.status(500).json({
        success: false,
        error: '获取天气信息失败，请稍后重试。',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * GET /api/weather/coordinates/:lat/:lon
   * 坐标天气查询
   */
  router.get('/coordinates/:lat/:lon', async (req, res) => {
    try {
      const { lat, lon } = req.params
      const { units = 'metric' } = req.query

      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          error: '无效的坐标格式',
          timestamp: new Date().toISOString()
        })
      }

      logger.info('坐标天气查询', { latitude, longitude, units })

      const weatherData = await weatherService.getWeatherByCoordinates(
        latitude,
        longitude,
        units as string
      )

      if (!weatherData.success) {
        return res.status(404).json({
          success: false,
          error: weatherData.error,
          timestamp: new Date().toISOString()
        })
      }

      res.json({
        success: true,
        data: weatherData.data,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      logger.error('坐标天气查询失败:', error)
      res.status(500).json({
        success: false,
        error: '获取坐标天气信息失败，请稍后重试。',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * POST /api/weather/batch
   * 批量城市天气查询
   */
  router.post('/batch', async (req, res) => {
    try {
      const { cities, units = 'metric' } = req.body

      if (!Array.isArray(cities) || cities.length === 0) {
        return res.status(400).json({
          success: false,
          error: '请提供有效的城市列表',
          timestamp: new Date().toISOString()
        })
      }

      if (cities.length > 10) {
        return res.status(400).json({
          success: false,
          error: '批量查询最多支持10个城市',
          timestamp: new Date().toISOString()
        })
      }

      logger.info('批量天气查询', { cities, units })

      const results = await Promise.allSettled(
        cities.map(async (cityInfo: any) => {
          const city = typeof cityInfo === 'string' ? cityInfo : cityInfo.city
          const country = typeof cityInfo === 'object' ? cityInfo.country : 'CN'
          
          return weatherService.getCurrentWeather({
            city,
            country,
            units: units as 'metric' | 'imperial' | 'kelvin'
          })
        })
      )

      const weatherResults = results.map((result, index) => ({
        city: cities[index],
        result: result.status === 'fulfilled' ? result.value : {
          success: false,
          error: result.reason?.message || '查询失败'
        }
      }))

      res.json({
        success: true,
        data: {
          results: weatherResults,
          total: cities.length,
          successful: weatherResults.filter(r => r.result.success).length
        },
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      logger.error('批量天气查询失败:', error)
      res.status(500).json({
        success: false,
        error: '批量天气查询失败，请稍后重试。',
        timestamp: new Date().toISOString()
      })
    }
  })

  return router
}
