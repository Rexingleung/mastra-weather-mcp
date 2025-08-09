import { WeatherService } from '../../src/services/weather.service'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('WeatherService', () => {
  let weatherService: WeatherService
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    weatherService = new WeatherService(mockApiKey)
    jest.clearAllMocks()
  })

  describe('getCurrentWeather', () => {
    const mockResponse = {
      data: {
        name: '上海',
        sys: { country: 'CN' },
        coord: { lat: 31.2304, lon: 121.4737 },
        main: {
          temp: 28,
          feels_like: 30,
          humidity: 65,
          pressure: 1015
        },
        wind: { speed: 3.2, deg: 90 },
        visibility: 8000,
        weather: [{
          description: '多云',
          main: 'Clouds',
          icon: '03d'
        }]
      }
    }

    it('应该成功获取天气', async () => {
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await weatherService.getCurrentWeather({
        city: '上海',
        country: 'CN'
      })

      expect(result.success).toBe(true)
      expect(result.data?.location.city).toBe('上海')
      expect(result.data?.weather.temperature).toBe(28)
    })

    it('应该使用默认参数', async () => {
      mockedAxios.get.mockResolvedValue(mockResponse)

      await weatherService.getCurrentWeather({
        city: '上海'
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/weather'),
        expect.objectContaining({
          params: expect.objectContaining({
            q: '上海,CN',
            units: 'metric'
          })
        })
      )
    })
  })

  describe('getWeatherByCoordinates', () => {
    it('应该根据坐标获取天气', async () => {
      const mockResponse = {
        data: {
          name: '深圳',
          sys: { country: 'CN' },
          coord: { lat: 22.5431, lon: 114.0579 },
          main: {
            temp: 26,
            feels_like: 29,
            humidity: 70,
            pressure: 1012
          },
          wind: { speed: 4.1, deg: 120 },
          visibility: 9000,
          weather: [{
            description: '小雨',
            main: 'Rain',
            icon: '10d'
          }]
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await weatherService.getWeatherByCoordinates(22.5431, 114.0579)

      expect(result.success).toBe(true)
      expect(result.data?.location.city).toBe('深圳')
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/weather'),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 22.5431,
            lon: 114.0579
          })
        })
      )
    })
  })

  describe('checkHealth', () => {
    it('应该返回健康状态', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} })

      const isHealthy = await weatherService.checkHealth()

      expect(isHealthy).toBe(true)
    })

    it('应该处理健康检查失败', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      const isHealthy = await weatherService.checkHealth()

      expect(isHealthy).toBe(false)
    })
  })
})
