import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { logger } from './logger'

/**
 * 请求验证中间件
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        logger.warn('请求验证失败', { errors, body: req.body })
        
        return res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: errors,
          timestamp: new Date().toISOString()
        })
      }
      
      next(error)
    }
  }
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('未处理的错误:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    ip: req.ip
  })

  // 不暴露内部错误细节
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.status(500).json({
    success: false,
    error: '内部服务器错误',
    message: isProduction ? '服务器出现错误，请稍后重试' : error.message,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: error.stack })
  })
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.warn('404 - 路由未找到', {
    url: req.url,
    method: req.method,
    ip: req.ip
  })
  
  res.status(404).json({
    success: false,
    error: '路由未找到',
    message: `无法找到请求的路径: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      weather: '/api/weather',
      health: '/api/health',
      mastra: '/api/mastra'
    }
  })
}

/**
 * 速率限制中间件
 */
export function rateLimit(options: {
  windowMs: number
  max: number
  message?: string
}) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    // 清理过期的记录
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < now) {
        requests.delete(ip)
      }
    }
    
    const clientData = requests.get(clientIP)
    
    if (!clientData) {
      // 首次请求
      requests.set(clientIP, {
        count: 1,
        resetTime: now + options.windowMs
      })
      return next()
    }
    
    if (clientData.resetTime < now) {
      // 重置窗口
      clientData.count = 1
      clientData.resetTime = now + options.windowMs
      return next()
    }
    
    if (clientData.count >= options.max) {
      // 超出限制
      logger.warn('速率限制触发', {
        ip: clientIP,
        count: clientData.count,
        max: options.max,
        resetTime: new Date(clientData.resetTime).toISOString()
      })
      
      return res.status(429).json({
        success: false,
        error: '请求过于频繁',
        message: options.message || '请求次数超限，请稍后重试',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      })
    }
    
    // 增加计数
    clientData.count++
    
    // 添加响应头
    res.set({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': (options.max - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    })
    
    next()
  }
}
