import { z } from 'zod'

// 天气查询参数类型
export interface WeatherQueryParams {
  city: string
  country?: string
  units?: 'metric' | 'imperial' | 'kelvin'
}

// 坐标信息
export interface Coordinates {
  lat: number
  lon: number
}

// 位置信息
export interface Location {
  city: string
  country: string
  coordinates: Coordinates
}

// 天气详细信息
export interface Weather {
  temperature: number      // 当前温度
  feelsLike: number       // 体感温度
  humidity: number        // 湿度 (%)
  pressure: number        // 气压 (hPa)
  windSpeed: number       // 风速 (m/s)
  windDirection: number   // 风向 (度)
  visibility: number      // 能见度 (米)
  description: string     // 天气描述
  main: string           // 主要天气状况
  icon: string           // 天气图标代码
}

// 完整天气数据
export interface WeatherData {
  success: boolean
  data?: {
    location: Location
    weather: Weather
    timestamp: string
  }
  error?: string
}

// MCP 工具响应类型
export interface MCPResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

// OpenWeatherMap API 响应类型（部分）
export interface OpenWeatherResponse {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

// 地理编码响应类型
export interface GeocodingResponse {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}

// 天气预报数据类型
export interface WeatherForecast {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  pop: number // 降水概率
  dt_txt: string
}

// 5天预报响应类型
export interface ForecastResponse {
  cod: string
  message: number
  cnt: number
  list: WeatherForecast[]
  city: {
    id: number
    name: string
    coord: {
      lat: number
      lon: number
    }
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
  }
}
