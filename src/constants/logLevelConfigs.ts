import type { LogLevel, LogLevelConfig } from './types';

/**
 * 日志等级配置
 */
export const LOG_LEVEL_CONFIGS: Record<LogLevel, LogLevelConfig> = {
  V: {
    level: 'V' as LogLevel,
    label: 'Verbose',
    color: '#8c8c8c',
    backgroundColor: '#f5f5f5',
    icon: 'V',
  },
  D: {
    level: 'D' as LogLevel,
    label: 'Debug',
    color: '#52c41a',
    backgroundColor: '#f6ffed',
    icon: 'D',
  },
  I: {
    level: 'I' as LogLevel,
    label: 'Info',
    color: '#1890ff',
    backgroundColor: '#e6f7ff',
    icon: 'I',
  },
  W: {
    level: 'W' as LogLevel,
    label: 'Warn',
    color: '#faad14',
    backgroundColor: '#fffbe6',
    icon: 'W',
  },
  E: {
    level: 'E' as LogLevel,
    label: 'Error',
    color: '#ff4d4f',
    backgroundColor: '#fff1f0',
    icon: 'E',
  },
  F: {
    level: 'F' as LogLevel,
    label: 'Fatal',
    color: '#cf1322',
    backgroundColor: '#fff1f0',
    icon: 'F',
  },
};
