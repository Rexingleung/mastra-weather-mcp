import { Tool } from '@mastra/core'
import { z } from 'zod'
import axios from 'axios'
import { WeatherData, WeatherQueryParams } from './types'

// 天气查询参数验证模式
const WeatherQuerySchema = z.object({
  city: z.string().min(1, '城市名不能为空'),
  country: z.string().optional().default('CN'),
  units: z.enum(['metric', 'imperial', 'kelvin']).optional().default('metric'),
})

/**
 * 天气查看 MCP 工具
 * 使用 OpenWeatherMap API 获取实时天气数据
 */
export class WeatherMCP extends Tool {
  name = 'weather'
  description = '获取指定城市的实时天气信息，包括温度、湿度、风速等数据'
  
  // 输入参数模式
  inputSchema = WeatherQuerySchema
  
  // 输出数据模式
  outputSchema = z.object({
    success: z.boolean(),
    data: z.object({
      location: z.object({
        city: z.string(),
        country: z.string(),
        coordinates: z.object({
          lat: z.number(),
          lon: z.number(),
        }),
      }),
      weather: z.object({
        temperature: z.number(),
        feelsLike: z.number(),
        humidity: z.number(),
        pressure: z.number(),
        windSpeed: z.number(),
        windDirection: z.number(),
        visibility: z.number(),
        description: z.string(),
        main: z.string(),
        icon: z.string(),
      }),
      timestamp: z.string(),
    }).optional(),
    error: z.string().optional(),
  })

  private apiKey: string
  private baseUrl: string

  constructor(options: { apiKey: string; baseUrl?: string }) {
    super()
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl || 'https://api.openweathermap.org/data/2.5'
    
    if (!this.apiKey) {
      throw new Error('Weather API key is required')
    }
  }

  /**
   * 执行天气查询
   */
  async execute(params: WeatherQueryParams): Promise<any> {
    try {
      // 验证输入参数
      const validatedParams = WeatherQuerySchema.parse(params)
      const { city, country, units } = validatedParams

      console.log(`🌤️ 查询天气: ${city}, ${country}`)

      // 调用 OpenWeatherMap API
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: units,
          lang: 'zh_cn', // 中文描述
        },
        timeout: 10000, // 10秒超时
      })

      const data = response.data

      // 格式化返回数据
      const weatherData: WeatherData = {
        success: true,
        data: {
          location: {
            city: data.name,
            country: data.sys.country,
            coordinates: {
              lat: data.coord.lat,
              lon: data.coord.lon,
            },
          },
          weather: {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind?.speed || 0,
            windDirection: data.wind?.deg || 0,
            visibility: data.visibility || 0,
            description: data.weather[0].description,
            main: data.weather[0].main,
            icon: data.weather[0].icon,
          },
          timestamp: new Date().toISOString(),
        },
      }

      console.log(`✅ 天气查询成功: ${city} ${weatherData.data?.weather.temperature}°C`)
      return weatherData

    } catch (error: any) {
      console.error('❌ 天气查询失败:', error.message)
      
      // 处理不同类型的错误
      let errorMessage = '获取天气信息失败'
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = '未找到指定城市，请检查城市名称是否正确'
        } else if (error.response?.status === 401) {
          errorMessage = 'API 密钥无效或已过期'
        } else if (error.response?.status === 429) {
          errorMessage = 'API 调用次数超限，请稍后重试'
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = '请求超时，请检查网络连接'
        } else {
          errorMessage = `API 错误: ${error.response?.data?.message || error.message}`
        }
      } else if (error instanceof z.ZodError) {
        errorMessage = `参数验证失败: ${error.errors.map(e => e.message).join(', ')}`
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * 获取工具能力描述
   */
  getCapabilities(): string {
    return `
天气查询工具能力：
- 🌍 支持全球主要城市天气查询
- 🌡️ 提供实时温度、体感温度
- 💧 湿度、气压数据
- 💨 风速、风向信息
- 👁️ 能见度数据
- 🔤 中文天气描述
- ⏰ 实时数据更新
    `.trim()
  }
}

// 导出天气 MCP 实例
export const weatherMCP = new WeatherMCP({
  apiKey: process.env.WEATHER_API_KEY!,
  baseUrl: process.env.WEATHER_API_URL,
})
