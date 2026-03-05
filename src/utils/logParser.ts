import type { LogEntry, LogLevel } from '../types';

/**
 * HiLog日志格式正则表达式
 * 格式: MM-dd HH:mm:ss.SSS PID TID Level Tag/Message: Content
 * 示例: 01-16 14:42:52.788 62125 62125 I A03D00/com.jd.hm.mall/JSAPP: [[1,"banneractiveIndex",1.0]]
 */
const HILOG_REGEX =
  /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.+?):\s+(.*)$/;

/**
 * 时间戳解析正则
 */
const TIME_REGEX = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
const DATE_REGEX = /^(\d{2})-(\d{2})$/;

/**
 * 日志等级映射
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  D: 'D' as LogLevel,
  I: 'I' as LogLevel,
  W: 'W' as LogLevel,
  E: 'E' as LogLevel,
  F: 'F' as LogLevel,
};

/**
 * 解析单行HiLog日志
 */
export function parseLogLine(line: string, sourceFile: string, lineNumber: number): LogEntry | null {
  // 去除首尾空白字符
  const trimmedLine = line.trim();

  // 跳过空行
  if (!trimmedLine) {
    return null;
  }

  // 尝试匹配HiLog格式
  const match = trimmedLine.match(HILOG_REGEX);
  if (!match) {
    // 无法解析的行，返回null
    return null;
  }

  const [, date, time, pidStr, tidStr, levelChar, tag, content] = match;

  // 解析日期 (MM-dd)
  const dateMatch = date.match(DATE_REGEX);
  if (!dateMatch) {
    return null;
  }
  const month = parseInt(dateMatch[1], 10);
  const day = parseInt(dateMatch[2], 10);

  // 解析时间 (HH:mm:ss.SSS)
  const timeMatch = time.match(TIME_REGEX);
  if (!timeMatch) {
    return null;
  }
  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = parseInt(timeMatch[3], 10);
  const milliseconds = parseInt(timeMatch[4], 10);

  // 解析PID和TID
  const pid = parseInt(pidStr, 10);
  const tid = parseInt(tidStr, 10);

  // 解析日志等级
  const level = LOG_LEVEL_MAP[levelChar];
  if (!level) {
    return null;
  }

  // 构建日志条目
  const logEntry: LogEntry = {
    rawLine: trimmedLine,
    lineNumber,
    timestamp: `${date} ${time}`,
    date,
    time,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
    pid,
    tid,
    level,
    tag: tag.trim(),
    content: content.trim(),
    sourceFile,
  };

  return logEntry;
}

/**
 * 批量解析日志行
 */
export function parseLogLines(lines: string[], sourceFile: string): LogEntry[] {
  const logEntries: LogEntry[] = [];
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const entry = parseLogLine(line, sourceFile, lineNumber);
    if (entry) {
      logEntries.push(entry);
    }
  }

  return logEntries;
}

/**
 * 验证日志格式是否正确
 */
export function validateLogFormat(line: string): boolean {
  return HILOG_REGEX.test(line.trim());
}

/**
 * 从日志行中提取时间戳
 */
export function extractTimestamp(line: string): string | null {
  const match = line.trim().match(HILOG_REGEX);
  return match ? `${match[1]} ${match[2]}` : null;
}

/**
 * 从日志行中提取日志等级
 */
export function extractLogLevel(line: string): LogLevel | null {
  const match = line.trim().match(HILOG_REGEX);
  return match ? LOG_LEVEL_MAP[match[5]] || null : null;
}

/**
 * 格式化日志条目为可读文本
 */
export function formatLogEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level}] [${entry.tag}] ${entry.content}`;
}

/**
 * 格式化日志条目为JSON
 */
export function logEntryToJSON(entry: LogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    pid: entry.pid,
    tid: entry.tid,
    tag: entry.tag,
    content: entry.content,
  });
}

/**
 * 检查日志条目是否有效
 */
export function isValidLogEntry(entry: LogEntry): boolean {
  // 检查必要字段
  if (
    !entry.timestamp ||
    !entry.level ||
    !entry.tag ||
    entry.pid <= 0 ||
    entry.tid <= 0 ||
    entry.month < 1 ||
    entry.month > 12 ||
    entry.day < 1 ||
    entry.day > 31 ||
    entry.hours < 0 ||
    entry.hours > 23 ||
    entry.minutes < 0 ||
    entry.minutes > 59 ||
    entry.seconds < 0 ||
    entry.seconds > 59 ||
    entry.milliseconds < 0 ||
    entry.milliseconds > 999
  ) {
    return false;
  }

  return true;
}

/**
 * 解析统计信息
 */
export interface ParseStats {
  totalLines: number;
  parsedLines: number;
  failedLines: number;
  emptyLines: number;
  levelCounts: Record<LogLevel, number>;
}

/**
 * 解析日志并返回统计信息
 */
export function parseLogLinesWithStats(lines: string[], sourceFile: string): {
  logs: LogEntry[];
  stats: ParseStats;
} {
  const logs: LogEntry[] = [];
  const stats: ParseStats = {
    totalLines: lines.length,
    parsedLines: 0,
    failedLines: 0,
    emptyLines: 0,
    levelCounts: {
      D: 0,
      I: 0,
      W: 0,
      E: 0,
      F: 0,
    },
  };

  let lineNumber = 0;
  for (const line of lines) {
    lineNumber++;
    const trimmedLine = line.trim();

    // 跳过空行
    if (!trimmedLine) {
      stats.emptyLines++;
      continue;
    }

    const entry = parseLogLine(line, sourceFile, lineNumber);
    if (entry && isValidLogEntry(entry)) {
      logs.push(entry);
      stats.parsedLines++;
      stats.levelCounts[entry.level]++;
    } else {
      stats.failedLines++;
    }
  }

  return { logs, stats };
}
