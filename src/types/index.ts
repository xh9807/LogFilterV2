/**
 * 日志等级枚举
 */
export enum LogLevel {
  VERBOSE = 'V',
  DEBUG = 'D',
  INFO = 'I',
  WARN = 'W',
  ERROR = 'E',
  FATAL = 'F',
}

/**
 * 日志等级配置
 */
export interface LogLevelConfig {
  level: LogLevel;
  label: string;
  color: string; // 前景色
  backgroundColor: string; // 背景色
  icon?: string; // 图标
}

/**
 * 日志等级颜色映射
 */
export const LOG_LEVEL_CONFIGS: Record<LogLevel, LogLevelConfig> = {
  [LogLevel.VERBOSE]: {
    level: LogLevel.VERBOSE,
    label: 'Verbose',
    color: '#8c8c8c',
    backgroundColor: '#f5f5f5',
    icon: 'V',
  },
  [LogLevel.DEBUG]: {
    level: LogLevel.DEBUG,
    label: 'Debug',
    color: '#52c41a',
    backgroundColor: '#f6ffed',
    icon: 'D',
  },
  [LogLevel.INFO]: {
    level: LogLevel.INFO,
    label: 'Info',
    color: '#1890ff',
    backgroundColor: '#e6f7ff',
    icon: 'I',
  },
  [LogLevel.WARN]: {
    level: LogLevel.WARN,
    label: 'Warn',
    color: '#faad14',
    backgroundColor: '#fffbe6',
    icon: 'W',
  },
  [LogLevel.ERROR]: {
    level: LogLevel.ERROR,
    label: 'Error',
    color: '#ff4d4f',
    backgroundColor: '#fff1f0',
    icon: 'E',
  },
  [LogLevel.FATAL]: {
    level: LogLevel.FATAL,
    label: 'Fatal',
    color: '#cf1322',
    backgroundColor: '#fff1f0',
    icon: 'F',
  },
};

/**
 * 日志条目模型
 */
export interface LogEntry {
  // 原始数据
  rawLine: string; // 原始日志行
  lineNumber: number; // 行号（在文件中的位置）

  // 时间信息
  timestamp: string; // "01-16 14:42:52.788"
  date: string; // "01-16"
  time: string; // "14:42:52.788"
  month: number; // 1-12
  day: number; // 1-31
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  milliseconds: number; // 0-999

  // 进程信息
  pid: number; // 进程ID
  tid: number; // 线程ID

  // 日志信息
  level: LogLevel; // 日志等级
  tag: string; // 标签
  content: string; // 日志内容

  // 元数据
  sourceFile: string; // 来源文件路径
  parseError?: string; // 解析错误信息（如果有）
}

/**
 * 日志时间对象（用于过滤和比较）
 */
export interface LogTime {
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
}

/**
 * 文件信息模型
 */
export interface FileInfo {
  path: string; // 文件完整路径
  name: string; // 文件名
  size: number; // 文件大小（字节）
  sizeMB: number; // 文件大小（MB）
  lineCount?: number; // 行数（读取后统计）
  format: 'txt' | 'json'; // 文件格式
  isSkipped: boolean; // 是否被跳过（如过大）
  skipReason?: string; // 跳过原因
  readProgress?: number; // 读取进度 0-1
}

/**
 * 过滤配置模型
 */
export interface FilterConfig {
  // 时间过滤
  startTime?: LogTime; // 起始时间
  endTime?: LogTime; // 结束时间（可选）

  // 等级过滤（可选）
  levels?: LogLevel[]; // 选中的日志等级

  // Tag过滤（可选）
  tags?: string[]; // 选中的Tags

  // 关键词搜索（可选）
  keyword?: string; // 搜索关键词
  useRegex?: boolean; // 是否使用正则
}

/**
 * 应用状态模型
 */
export interface AppState {
  // 文件状态
  selectedFiles: FileInfo[]; // 已选择的文件
  processedFiles: string[]; // 已处理的文件路径

  // 日志数据
  allLogs: LogEntry[]; // 所有日志
  filteredLogs: LogEntry[]; // 过滤后的日志

  // 过滤配置
  filterConfig: FilterConfig;

  // UI状态
  isLoading: boolean;
  loadingMessage?: string;
  error?: string;

  // 统计信息
  statistics: {
    totalLogs: number;
    filteredLogs: number;
    levelCounts: Record<LogLevel, number>;
  };
}

/**
 * IPC通信类型定义
 */
export interface IPCRequest {
  type: string;
  payload?: any;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
