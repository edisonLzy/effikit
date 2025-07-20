/**
 * 通用日志工具
 * 提供统一的日志输出格式和级别控制
 */

// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// 日志配置接口
export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
}

// 默认配置
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  timestamp: true,
  colors: true
};

// 颜色样式映射
const LOG_COLORS = {
  [LogLevel.DEBUG]: 'color: #888; font-weight: normal;',
  [LogLevel.INFO]: 'color: #2196F3; font-weight: normal;',
  [LogLevel.WARN]: 'color: #FF9800; font-weight: bold;',
  [LogLevel.ERROR]: 'color: #F44336; font-weight: bold;'
};

// 级别标签映射
const LOG_LABELS = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR'
};

/**
 * Logger 类
 */
export class Logger {
  private config: LoggerConfig;
  private module: string;

  constructor(module: string, config: Partial<LoggerConfig> = {}) {
    this.module = module;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];
    
    // 添加时间戳
    if (this.config.timestamp) {
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, -5);
      parts.push(`[${timestamp}]`);
    }
    
    // 添加级别标签
    parts.push(`[${LOG_LABELS[level]}]`);
    
    // 添加模块名
    parts.push(`[${this.module}]`);
    
    // 添加前缀（如果有）
    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }
    
    // 添加消息内容
    parts.push(message);
    
    return parts.join(' ');
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // 检查日志级别
    if (level < this.config.level) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    
    // 根据级别选择输出方法
    if (this.config.colors && typeof window !== 'undefined') {
      // 浏览器环境，使用颜色样式
      const style = LOG_COLORS[level];
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(`%c${formattedMessage}`, style, ...args);
          break;
        case LogLevel.WARN:
          console.warn(`%c${formattedMessage}`, style, ...args);
          break;
        case LogLevel.ERROR:
          console.error(`%c${formattedMessage}`, style, ...args);
          break;
      }
    } else {
      // Node.js 环境或不使用颜色
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    }
  }

  /**
   * 调试级别日志
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * 信息级别日志
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * 警告级别日志
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * 错误级别日志
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * 创建 Logger 实例的工厂函数
 * @param module 模块名称
 * @param config 可选的配置参数
 * @returns Logger 实例
 */
export function createLogger(module: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(module, config);
}

// LoggerConfig 接口已在上面导出，无需重复导出