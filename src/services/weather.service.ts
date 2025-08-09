import axios from 'axios'
import { WeatherData, WeatherQueryParams, OpenWeatherResponse, GeocodingResponse } from '../mcp/types'

/**
 * 天气服务类
 * 封装 OpenWeatherMap API 调用逻辑
 */
export class WeatherService {
  private apiKey: string
  private baseUrl: string
  private geoUrl: string

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl || 'https://api.openweathermap.org/data/2.5'
    this.geoUrl = 'https://api.openweathermap.org/geo/1.0'
    
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is required')
    }
  }

  /**
   * 获取当前天气
   */
  async getCurrentWeather(params: WeatherQueryParams): Promise<WeatherData> {
    try {
      const { city, country = 'CN', units = 'metric' } = params
      
      console.log(`🌤️ 查询天气: ${city}, ${country}`)

      const response = await axios.get<OpenWeatherResponse>(`${this.baseUrl}/weather`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: units,
          lang: 'zh_cn',
        },
        timeout: 10000,
      })

      const data = response.data
      
      return this.formatWeatherData(data)
    } catch (error: any) {
      console.error('❌ 天气查询失败:', error.message)
      return this.handleError(error)
    }
  }

  /**
   * 通过坐标获取天气
   */
  async getWeatherByCoordinates(lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> {
    try {
      console.log(`🌍 查询天气: ${lat}, ${lon}`)

      const response = await axios.get<OpenWeatherResponse>(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          lang: 'zh_cn',
        },
        timeout: 10000,
      })

      return this.formatWeatherData(response.data)
    } catch (error: any) {
      console.error('❌ 坐标天气查询失败:', error.message)
      return this.handleError(error)
    }
  }

  /**
   * 地理编码 - 将城市名转换为坐标
   */
  async geocoding(city: string, country?: string, limit: number = 1): Promise<GeocodingResponse[]> {
    try {
      const query = country ? `${city},${country}` : city
      
      const response = await axios.get<GeocodingResponse[]>(`${this.geoUrl}/direct`, {
        params: {
          q: query,
          limit,
          appid: this.apiKey,
        },
        timeout: 5000,
      })

      return response.data
    } catch (error: any) {
      console.error('❌ 地理编码失败:', error.message)
      throw error
    }
  }

  /**
   * 反向地理编码 - 将坐标转换为地名
   */
  async reverseGeocoding(lat: number, lon: number, limit: number = 1): Promise<GeocodingResponse[]> {
    try {
      const response = await axios.get<GeocodingResponse[]>(`${this.geoUrl}/reverse`, {
        params: {
          lat,
          lon,
          limit,
          appid: this.apiKey,
        },
        timeout: 5000,
      })

      return response.data
    } catch (error: any) {
      console.error('❌ 反向地理编码失败:', error.message)
      throw error
    }
  }

  /**
   * 格式化天气数据
   */
  private formatWeatherData(data: OpenWeatherResponse): WeatherData {
    return {
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
  }

  /**
   * 处理错误
   */
  private handleError(error: any): WeatherData {
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
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  /**
   * 检查 API 连接状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 查询一个已知存在的城市来测试 API
      await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: 'London,GB',
          appid: this.apiKey,
        },
        timeout: 5000,
      })
      return true
    } catch (error) {
      console.error('天气服务健康检查失败:', error)
      return false
    }
  }
}

// 导出天气服务实例
export const weatherService = new WeatherService(
  process.env.WEATHER_API_KEY!,
  process.env.WEATHER_API_URL
)
