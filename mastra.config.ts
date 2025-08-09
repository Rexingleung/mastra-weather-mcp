import { MastraConfig } from '@mastra/core'
import { WeatherMCP } from './src/mcp/weather'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 创建天气 MCP 工具实例
const weatherTool = new WeatherMCP({
  apiKey: '7b7ce26e7819851536a07716a7287129',
  baseUrl: process.env.WEATHER_API_URL,
})

const config: MastraConfig = {
  name: 'weather-assistant',
  
  // LLM 配置
  llms: {
    openai: {
      provider: 'OPEN_AI',
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
    },
  },

  // MCP 工具配置
  tools: {
    weather: weatherTool,
  },

  // 工作流配置
  workflows: {
    // 天气查询工作流
    weatherQuery: {
      name: 'weather-query',
      description: '智能天气查询助手',
      steps: [
        {
          id: 'parseLocation',
          type: 'llm',
          llm: 'openai',
          prompt: `从用户输入中提取地理位置信息："{{input}}"
          
请返回JSON格式：
{
  "city": "城市名",
  "country": "国家代码（如CN、US）",
  "confidence": 0.9
}

如果无法确定位置，请设置confidence为0并说明原因。`,
          outputSchema: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              country: { type: 'string' },
              confidence: { type: 'number' }
            },
            required: ['city', 'country', 'confidence']
          }
        },
        {
          id: 'getWeather',
          type: 'tool',
          tool: 'weather',
          condition: '{{parseLocation.confidence}} > 0.5',
          input: {
            city: '{{parseLocation.city}}',
            country: '{{parseLocation.country}}'
          }
        },
        {
          id: 'formatResponse',
          type: 'llm',
          llm: 'openai',
          prompt: `请将以下天气数据格式化为友好的中文回复：

天气数据：{{getWeather}}
原始查询：{{input}}

要求：
1. 使用友好、自然的中文
2. 包含关键天气信息：温度、天气状况、湿度、风速等
3. 如果有有用的建议（如穿衣、出行），请包含
4. 保持简洁但信息完整

如果没有天气数据，请礼貌地说明无法获取该地区的天气信息。`,
        }
      ]
    }
  },

  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
  },

  // MCP 服务器配置
  mcp: {
    server: {
      host: process.env.MCP_SERVER_HOST || 'localhost',
      port: parseInt(process.env.MCP_SERVER_PORT || '8080'),
    }
  }
}

export default config
