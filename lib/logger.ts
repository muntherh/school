export class Logger {
  static info(message: string, meta?: any) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }))
  }

  static error(message: string, error?: any, meta?: any) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    }))
  }

  static warn(message: string, meta?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }))
  }

  static debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }))
    }
  }
}
