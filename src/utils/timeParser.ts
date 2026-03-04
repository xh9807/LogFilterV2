import type { LogTime, LogEntry } from '../types';

/**
 * HiLog时间格式: MM-dd HH:mm:ss.SSS
 */

/**
 * 解析HiLog时间字符串为LogTime对象
 */
export function parseHiLogTime(timeString: string): LogTime | null {
  // 支持两种格式：
  // 1. "MM-dd HH:mm:ss.SSS" - 完整格式
  // 2. "HH:mm:ss.SSS" - 只有时间

  const fullMatch = timeString.match(/^(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (fullMatch) {
    return {
      month: parseInt(fullMatch[1], 10),
      day: parseInt(fullMatch[2], 10),
      hours: parseInt(fullMatch[3], 10),
      minutes: parseInt(fullMatch[4], 10),
      seconds: parseInt(fullMatch[5], 10),
      milliseconds: parseInt(fullMatch[6], 10),
    };
  }

  const timeOnlyMatch = timeString.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (timeOnlyMatch) {
    return {
      month: 1, // 默认值
      day: 1, // 默认值
      hours: parseInt(timeOnlyMatch[1], 10),
      minutes: parseInt(timeOnlyMatch[2], 10),
      seconds: parseInt(timeOnlyMatch[3], 10),
      milliseconds: parseInt(timeOnlyMatch[4], 10),
    };
  }

  return null;
}

/**
 * 将LogTime对象转换为HiLog时间字符串
 */
export function formatHiLogTime(time: LogTime, includeDate: boolean = true): string {
  const dateStr = includeDate ? `${String(time.month).padStart(2, '0')}-${String(time.day).padStart(2, '0')} ` : '';
  const timeStr = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}.${String(time.milliseconds || 0).padStart(3, '0')}`;
  return dateStr + timeStr;
}

/**
 * 将时间转换为毫秒数（用于比较）
 * 注意：这里假设年份相同，只比较月、日、时、分、秒、毫秒
 */
export function timeToMilliseconds(time: LogTime): number {
  const daysInMonth = (month: number) => {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthDays[month - 1];
  };

  // 计算从1月1日0:00:00.000开始的总毫秒数
  let totalDays = 0;
  for (let m = 1; m < time.month; m++) {
    totalDays += daysInMonth(m);
  }
  totalDays += time.day - 1;

  const totalHours = totalDays * 24 + time.hours;
  const totalMinutes = totalHours * 60 + time.minutes;
  const totalSeconds = totalMinutes * 60 + time.seconds;
  const totalMilliseconds = totalSeconds * 1000 + (time.milliseconds || 0);

  return totalMilliseconds;
}

/**
 * 比较两个时间
 * 返回值:
 *   -1: time1 < time2
 *   0: time1 == time2
 *   1: time1 > time2
 */
export function compareTime(time1: LogTime, time2: LogTime): number {
  const ms1 = timeToMilliseconds(time1);
  const ms2 = timeToMilliseconds(time2);

  if (ms1 < ms2) return -1;
  if (ms1 > ms2) return 1;
  return 0;
}

/**
 * 检查 time1 是否在 time2 之后
 */
export function isTimeAfter(time1: LogTime, time2: LogTime): boolean {
  return compareTime(time1, time2) > 0;
}

/**
 * 检查 time1 是否在 time2 之前
 */
export function isTimeBefore(time1: LogTime, time2: LogTime): boolean {
  return compareTime(time1, time2) < 0;
}

/**
 * 检查 time1 是否等于 time2
 */
export function isTimeEqual(time1: LogTime, time2: LogTime): boolean {
  return compareTime(time1, time2) === 0;
}

/**
 * 检查 time1 是否在 time2 之后或等于
 */
export function isTimeAfterOrEqual(time1: LogTime, time2: LogTime): boolean {
  return compareTime(time1, time2) >= 0;
}

/**
 * 检查 time1 是否在 time2 之前或等于
 */
export function isTimeBeforeOrEqual(time1: LogTime, time2: LogTime): boolean {
  return compareTime(time1, time2) <= 0;
}

/**
 * 从LogEntry中提取LogTime
 */
export function extractTimeFromLogEntry(entry: LogEntry): LogTime {
  return {
    month: entry.month,
    day: entry.day,
    hours: entry.hours,
    minutes: entry.minutes,
    seconds: entry.seconds,
    milliseconds: entry.milliseconds,
  };
}

/**
 * 检查日志时间是否在指定时间范围内
 */
export function isLogInTimeRange(
  log: LogEntry,
  startTime?: LogTime,
  endTime?: LogTime
): boolean {
  const logTime = extractTimeFromLogEntry(log);

  if (startTime && !isTimeAfterOrEqual(logTime, startTime)) {
    return false;
  }

  if (endTime && !isTimeBeforeOrEqual(logTime, endTime)) {
    return false;
  }

  return true;
}

/**
 * 计算两个时间之间的差值（毫秒）
 */
export function timeDifference(time1: LogTime, time2: LogTime): number {
  const ms1 = timeToMilliseconds(time1);
  const ms2 = timeToMilliseconds(time2);
  return Math.abs(ms1 - ms2);
}

/**
 * 格式化时间差为可读字符串
 */
export function formatTimeDifference(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟 ${seconds % 60}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  } else {
    return `${seconds}.${milliseconds % 1000}秒`;
  }
}

/**
 * 获取当前时间的LogTime对象
 */
export function getCurrentTime(): LogTime {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds(),
  };
}

/**
 * 验证LogTime对象是否有效
 */
export function isValidTime(time: LogTime): boolean {
  if (time.month < 1 || time.month > 12) return false;
  if (time.day < 1 || time.day > 31) return false;
  if (time.hours < 0 || time.hours > 23) return false;
  if (time.minutes < 0 || time.minutes > 59) return false;
  if (time.seconds < 0 || time.seconds > 59) return false;
  if (time.milliseconds !== undefined && (time.milliseconds < 0 || time.milliseconds > 999)) {
    return false;
  }
  return true;
}
