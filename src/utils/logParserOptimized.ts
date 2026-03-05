/**
 * 优化版日志解析器
 * 针对大文件和高性能场景优化
 */

import type { LogEntry, LogLevel } from '../types';

// 预编译正则表达式，避免重复创建
const HILOG_REGEX = /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.+?):\s+(.*)$/;
const TIME_REGEX = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
const DATE_REGEX = /^(\d{2})-(\d{2})$/;

// 日志等级映射表（使用常量避免重复创建对象）
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  V: 'V' as LogLevel,
  D: 'D' as LogLevel,
  I: 'I' as LogLevel,
  W: 'W' as LogLevel,
  E: 'E' as LogLevel,
  F: 'F' as LogLevel,
};

// 零对象，用于重置统计
const ZERO_LEVEL_COUNTS: Record<LogLevel, number> = {
  V: 0, D: 0, I: 0, W: 0, E: 0, F: 0,
};

/**
 * 解析统计接口
 */
export interface ParseStats {
  totalLines: number;
  parsedLines: number;
  failedLines: number;
  emptyLines: number;
  levelCounts: Record<LogLevel, number>;
}

/**
 * 快速解析单行日志（优化版）
 * 减少对象创建和函数调用
 */
function parseLogLineFast(line: string, sourceFile: string, lineNumber: number): LogEntry | null {
  const trimmedLine = line.trim();

  // 快速跳过空行
  if (!trimmedLine) {
    return null;
  }

  // 尝试匹配HiLog格式
  const match = trimmedLine.match(HILOG_REGEX);
  if (!match) {
    return null;
  }

  // 解构匹配结果（比数组索引访问更快）
  const [, date, time, pidStr, tidStr, levelChar, tag, content] = match;

  // 快速解析日期
  const dateMatch = date.match(DATE_REGEX);
  if (!dateMatch) {
    return null;
  }
  const month = (dateMatch[1] as unknown as number) - 0; // 快速字符串转数字
  const day = (dateMatch[2] as unknown as number) - 0;

  // 快速解析时间
  const timeMatch = time.match(TIME_REGEX);
  if (!timeMatch) {
    return null;
  }
  const hours = (timeMatch[1] as unknown as number) - 0;
  const minutes = (timeMatch[2] as unknown as number) - 0;
  const seconds = (timeMatch[3] as unknown as number) - 0;
  const milliseconds = (timeMatch[4] as unknown as number) - 0;

  // 快速构建日志条目（直接创建，不使用中间变量）
  return {
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
    pid: (pidStr as unknown as number) - 0,
    tid: (tidStr as unknown as number) - 0,
    level: LOG_LEVEL_MAP[levelChar]!,
    tag: tag.trim(),
    content: content.trim(),
    sourceFile,
  };
}

/**
 * 批量解析日志行（优化版）
 * 使用预分配数组和减少函数调用优化性能
 */
export function parseLogLinesOptimized(
  lines: string[],
  sourceFile: string,
  options?: {
    onProgress?: (progress: number, current: number, total: number) => void;
    chunkSize?: number;
  }
): {
  logs: LogEntry[];
  stats: ParseStats;
} {
  const chunkSize = options?.chunkSize || 10000;
  const totalLines = lines.length;

  // 预估大小并预分配（假设70%成功率）
  const estimatedSize = Math.floor(totalLines * 0.7);
  const logs: LogEntry[] = new Array(estimatedSize);

  // 初始化统计
  const stats: ParseStats = {
    totalLines,
    parsedLines: 0,
    failedLines: 0,
    emptyLines: 0,
    levelCounts: { ...ZERO_LEVEL_COUNTS },
  };

  let logIndex = 0; // 实际日志索引
  let emptyLines = 0;
  let failedLines = 0;
  let parsedLines = 0;

  // 使用 for 循环和本地变量优化性能
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];

    // 快速空行检查
    const trimmedLength = line.length;
    if (trimmedLength === 0 || (trimmedLength > 0 && line.trim().length === 0)) {
      emptyLines++;
      continue;
    }

    // 解析日志行
    const entry = parseLogLineFast(line, sourceFile, i + 1);

    if (entry) {
      // 基本验证（仅验证关键字段）
      if (entry.month >= 1 && entry.month <= 12) {
        logs[logIndex++] = entry;
        parsedLines++;
        stats.levelCounts[entry.level]++;
      } else {
        failedLines++;
      }
    } else {
      failedLines++;
    }

    // 进度回调（每处理 chunkSize 行）
    if (options?.onProgress && (i + 1) % chunkSize === 0) {
      const progress = ((i + 1) / totalLines) * 100;
      options.onProgress(progress, i + 1, totalLines);
    }
  }

  // 截断数组到实际大小
  logs.length = logIndex;

  // 批量更新统计数据
  stats.emptyLines = emptyLines;
  stats.failedLines = failedLines;
  stats.parsedLines = parsedLines;

  return { logs, stats };
}

/**
 * 异步分块解析日志（用于大文件）
 * 使用 requestIdleCallback 或 setTimeout 分批处理，避免阻塞UI
 */
export async function parseLogLinesAsync(
  lines: string[],
  sourceFile: string,
  options?: {
    onProgress?: (progress: number, current: number, total: number) => void;
    chunkSize?: number;
    yieldInterval?: number; // 每处理多少行让出一次控制权
  }
): Promise<{
  logs: LogEntry[];
  stats: ParseStats;
}> {
  const chunkSize = options?.chunkSize || 5000;
  const yieldInterval = options?.yieldInterval || chunkSize;
  const totalLines = lines.length;
  const totalChunks = Math.ceil(totalLines / chunkSize);

  // 预估总大小
  const estimatedSize = Math.floor(totalLines * 0.7);
  const allLogs: LogEntry[] = [];

  const stats: ParseStats = {
    totalLines,
    parsedLines: 0,
    failedLines: 0,
    emptyLines: 0,
    levelCounts: { ...ZERO_LEVEL_COUNTS },
  };

  let totalLineNumber = 0;

  // 分块处理
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalLines);
    const chunkLines = lines.slice(start, end);

    // 解析当前块
    const { logs, stats: chunkStats } = parseLogLinesOptimized(chunkLines, sourceFile, {
      onProgress: undefined, // 块内不需要进度回调
      chunkSize: yieldInterval,
    });

    // 合并结果
    allLogs.push(...logs);
    stats.parsedLines += chunkStats.parsedLines;
    stats.failedLines += chunkStats.failedLines;
    stats.emptyLines += chunkStats.emptyLines;

    // 合并等级统计
    for (const level in chunkStats.levelCounts) {
      stats.levelCounts[level as LogLevel] += chunkStats.levelCounts[level as LogLevel];
    }

    totalLineNumber = end;

    // 报告进度
    if (options?.onProgress) {
      const progress = ((chunkIndex + 1) / totalChunks) * 100;
      options.onProgress(progress, totalLineNumber, totalLines);
    }

    // 让出控制权（除了最后一块）
    if (chunkIndex < totalChunks - 1) {
      await new Promise<void>(resolve => {
        // 使用 requestIdleCallback 优先处理（如果可用）
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve());
        } else {
          setTimeout(() => resolve(), 0);
        }
      });
    }
  }

  return {
    logs: allLogs,
    stats,
  };
}

/**
 * 流式解析器（用于超大文件）
 * 返回一个迭代器，每次返回一批解析结果
 */
export function* parseLogLinesStream(
  lines: string[],
  sourceFile: string,
  chunkSize: number = 10000
): Generator<{
  logs: LogEntry[];
  stats: ParseStats;
  progress: number;
}> {
  const totalLines = lines.length;
  const totalChunks = Math.ceil(totalLines / chunkSize);

  const accumulatedStats: ParseStats = {
    totalLines,
    parsedLines: 0,
    failedLines: 0,
    emptyLines: 0,
    levelCounts: { ...ZERO_LEVEL_COUNTS },
  };

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalLines);
    const chunkLines = lines.slice(start, end);

    // 解析当前块
    const result = parseLogLinesOptimized(chunkLines, sourceFile);

    // 更新累积统计
    accumulatedStats.parsedLines += result.stats.parsedLines;
    accumulatedStats.failedLines += result.stats.failedLines;
    accumulatedStats.emptyLines += result.stats.emptyLines;

    for (const level in result.stats.levelCounts) {
      accumulatedStats.levelCounts[level as LogLevel] += result.stats.levelCounts[level as LogLevel];
    }

    // 返回当前块的结果
    yield {
      logs: result.logs,
      stats: accumulatedStats,
      progress: ((chunkIndex + 1) / totalChunks) * 100,
    };
  }
}

/**
 * 性能基准测试
 */
export function benchmarkParse(
  lines: string[],
  sourceFile: string,
  iterations: number = 3
): {
  avgTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // 每秒处理行数
} {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    parseLogLinesOptimized(lines, sourceFile);
    const end = performance.now();
    times.push(end - start);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const throughput = (lines.length / avgTime) * 1000; // 行/秒

  return {
    avgTime: Math.round(avgTime),
    minTime: Math.round(minTime),
    maxTime: Math.round(maxTime),
    throughput: Math.round(throughput),
  };
}
