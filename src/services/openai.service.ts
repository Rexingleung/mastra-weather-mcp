import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

/**
 * OpenAI 服务类
 * 封装 OpenAI API 调用逻辑
 */
export class OpenAIService {
  private client: OpenAI
  private defaultModel: string
  private defaultTemperature: number
  private defaultMaxTokens: number

  constructor(options: {
    apiKey: string
    model?: string
    temperature?: number
    maxTokens?: number
  }) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
    })
    
    this.defaultModel = options.model || 'gpt-3.5-turbo'
    this.defaultTemperature = options.temperature || 0.7
    this.defaultMaxTokens = options.maxTokens || 1000
  }

  /**
   * 生成聊天回复
   */
  async chat(options: {
    messages: ChatCompletionMessageParam[]
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }) {
    try {
      const {
        messages,
        model = this.defaultModel,
        temperature = this.defaultTemperature,
        maxTokens = this.defaultMaxTokens,
        stream = false
      } = options

      console.log(`🤖 OpenAI Chat: ${model}, messages: ${messages.length}`)

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      })

      if (stream) {
        return response
      } else {
        const completion = response as OpenAI.Chat.Completions.ChatCompletion
        const content = completion.choices[0]?.message?.content || ''
        
        console.log(`✅ OpenAI 响应生成成功, tokens: ${completion.usage?.total_tokens}`)
        
        return {
          content,
          usage: completion.usage,
          model: completion.model,
        }
      }
    } catch (error: any) {
      console.error('❌ OpenAI API 调用失败:', error.message)
      throw new Error(`OpenAI API 错误: ${error.message}`)
    }
  }

  /**
   * 流式生成
   */
  async streamChat(options: {
    messages: ChatCompletionMessageParam[]
    model?: string
    temperature?: number
    maxTokens?: number
    onChunk?: (chunk: string) => void
  }) {
    try {
      const {
        messages,
        model = this.defaultModel,
        temperature = this.defaultTemperature,
        maxTokens = this.defaultMaxTokens,
        onChunk
      } = options

      console.log(`🔄 OpenAI Stream Chat: ${model}`)

      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      })

      let fullContent = ''
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          onChunk?.(content)
        }
      }

      console.log(`✅ OpenAI 流式响应完成, 总长度: ${fullContent.length}`)
      
      return fullContent
    } catch (error: any) {
      console.error('❌ OpenAI 流式调用失败:', error.message)
      throw new Error(`OpenAI 流式 API 错误: ${error.message}`)
    }
  }

  /**
   * 解析位置信息
   */
  async parseLocation(userInput: string): Promise<{
    city: string
    country: string
    confidence: number
  }> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `你是一个地理位置解析专家。从用户输入中提取城市和国家信息，返回JSON格式：
{
  "city": "城市名",
  "country": "国家代码（如CN、US等）",
  "confidence": 0.9
}

如果无法确定位置，请设置confidence为0并说明原因。`
        },
        {
          role: 'user',
          content: `请从以下文本中提取位置信息："${userInput}"`
        }
      ]

      const response = await this.chat({ messages, temperature: 0.3 })
      
      try {
        const parsed = JSON.parse(response.content)
        return {
          city: parsed.city || '',
          country: parsed.country || 'CN',
          confidence: parsed.confidence || 0
        }
      } catch (parseError) {
        console.error('解析位置JSON失败:', parseError)
        return {
          city: '',
          country: 'CN',
          confidence: 0
        }
      }
    } catch (error: any) {
      console.error('位置解析失败:', error.message)
      return {
        city: '',
        country: 'CN',
        confidence: 0
      }
    }
  }

  /**
   * 格式化天气响应
   */
  async formatWeatherResponse(options: {
    weatherData: any
    originalQuery: string
  }): Promise<string> {
    try {
      const { weatherData, originalQuery } = options

      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `你是一个友好的天气助手。请将天气数据格式化为自然、友好的中文回复。

要求：
1. 使用友好、自然的中文
2. 包含关键天气信息：温度、天气状况、湿度、风速等
3. 如果有有用的建议（如穿衣、出行），请包含
4. 保持简洁但信息完整
5. 如果没有天气数据，请礼貌地说明无法获取该地区的天气信息`
        },
        {
          role: 'user',
          content: `请将以下天气数据格式化为友好的中文回复：

天气数据：${JSON.stringify(weatherData, null, 2)}
原始查询：${originalQuery}`
        }
      ]

      const response = await this.chat({
        messages,
        temperature: 0.8,
        maxTokens: 500
      })

      return response.content
    } catch (error: any) {
      console.error('格式化天气响应失败:', error.message)
      return '抱歉，无法生成天气回复，请稍后重试。'
    }
  }

  /**
   * 检查服务健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.chat({
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5
      })
      return true
    } catch (error) {
      console.error('OpenAI 服务健康检查失败:', error)
      return false
    }
  }
}

// 导出 OpenAI 服务实例
export const openaiService = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
})
