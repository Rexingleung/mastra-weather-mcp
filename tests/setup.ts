// Jest 测试设置文件

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.WEATHER_API_KEY = 'test-weather-key'
process.env.PORT = '3001'

// Mock console 方法以减少测试输出
const originalConsole = global.console

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  } as any
})

afterAll(() => {
  global.console = originalConsole
})

// 全局异常处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
