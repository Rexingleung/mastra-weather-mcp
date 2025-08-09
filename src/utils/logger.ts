/**
 * 简单的日志工具
 * 在生产环境中可以替换为更复杂的日志库
 */
export class Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta))
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta))
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta))
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, meta))
    }
  }
}

export const logger = new Logger()
