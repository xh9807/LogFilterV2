import type { LogEntry, FilterConfig, LogLevel } from '@types';

/**
 * 从日志条目中提取时间
 */
function extractTimeFromLogEntry(log: LogEntry): {
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  return {
    month: log.month,
    day: log.day,
    hours: log.hours,
    minutes: log.minutes,
    seconds: log.seconds,
    milliseconds: log.milliseconds,
  };
}

/**
 * 比较两个时间，判断time1是否晚于或等于time2
 */
function isTimeAfterOrEqual(
  time1: { month: number; day: number; hours: number; minutes: number; seconds: number; milliseconds?: number },
  time2: { month: number; day: number; hours: number; minutes: number; seconds: number; milliseconds?: number }
): boolean {
  // 比较月份
  if (time1.month !== time2.month) {
    return time1.month > time2.month;
  }

  // 比较日期
  if (time1.day !== time2.day) {
    return time1.day > time2.day;
  }

  // 比较小时
  if (time1.hours !== time2.hours) {
    return time1.hours > time2.hours;
  }

  // 比较分钟
  if (time1.minutes !== time2.minutes) {
    return time1.minutes > time2.minutes;
  }

  // 比较秒
  if (time1.seconds !== time2.seconds) {
    return time1.seconds > time2.seconds;
  }

  // 比较毫秒
  const ms1 = time1.milliseconds ?? 0;
  const ms2 = time2.milliseconds ?? 0;
  return ms1 >= ms2;
}

/**
 * 日志过滤服务类
 */
export class FilterService {
  private static instance: FilterService;

  private constructor() {}

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  /**
   * 根据过滤配置过滤日志
   */
  filterLogs(logs: LogEntry[], config: FilterConfig): LogEntry[] {
    return logs.filter((log) => this.matchesFilter(log, config));
  }

  /**
   * 检查日志是否匹配过滤条件
   */
  private matchesFilter(log: LogEntry, config: FilterConfig): boolean {
    // 时间过滤
    if (config.startTime) {
      const logTime = extractTimeFromLogEntry(log);
      if (!isTimeAfterOrEqual(logTime, config.startTime)) {
        return false;
      }
    }

    // 结束时间过滤
    if (config.endTime) {
      const logTime = extractTimeFromLogEntry(log);
      // TODO: 实现 isTimeBeforeOrEqual 导入
      // if (!isTimeBeforeOrEqual(logTime, config.endTime)) {
      //   return false;
      // }
    }

    // 日志等级过滤
    if (config.levels && config.levels.length > 0) {
      if (!config.levels.includes(log.level)) {
        return false;
      }
    }

    // Tag过滤
    if (config.tags && config.tags.length > 0) {
      const tagMatch = config.tags.some((tag) => {
        if (config.useRegex) {
          try {
            const regex = new RegExp(tag);
            return regex.test(log.tag);
          } catch {
            return false;
          }
        } else {
          return log.tag.includes(tag);
        }
      });
      if (!tagMatch) {
        return false;
      }
    }

    // 关键词搜索
    if (config.keyword) {
      const searchText = `${log.tag} ${log.content}`.toLowerCase();
      if (config.useRegex) {
        try {
          const regex = new RegExp(config.keyword, 'i');
          if (!regex.test(log.tag) && !regex.test(log.content)) {
            return false;
          }
        } catch {
          return false;
        }
      } else {
        if (!searchText.includes(config.keyword.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 按时间范围过滤日志
   */
  filterByTimeRange(
    logs: LogEntry[],
    startTime?: { month: number; day: number; hours: number; minutes: number; seconds: number },
    endTime?: { month: number; day: number; hours: number; minutes: number; seconds: number }
  ): LogEntry[] {
    return logs.filter((log) => {
      const logTime = extractTimeFromLogEntry(log);

      if (startTime && !isTimeAfterOrEqual(logTime, startTime)) {
        return false;
      }

      // TODO: 添加结束时间比较
      // if (endTime && !isTimeBeforeOrEqual(logTime, endTime)) {
      //   return false;
      // }

      return true;
    });
  }

  /**
   * 按日志等级过滤
   */
  filterByLevel(logs: LogEntry[], levels: LogLevel[]): LogEntry[] {
    return logs.filter((log) => levels.includes(log.level));
  }

  /**
   * 按Tag过滤
   */
  filterByTag(logs: LogEntry[], tags: string[], useRegex = false): LogEntry[] {
    return logs.filter((log) => {
      return tags.some((tag) => {
        if (useRegex) {
          try {
            const regex = new RegExp(tag);
            return regex.test(log.tag);
          } catch {
            return false;
          }
        } else {
          return log.tag.includes(tag);
        }
      });
    });
  }

  /**
   * 按关键词搜索
   */
  filterByKeyword(logs: LogEntry[], keyword: string, useRegex = false): LogEntry[] {
    if (!keyword) {
      return logs;
    }

    return logs.filter((log) => {
      const searchText = `${log.tag} ${log.content}`;

      if (useRegex) {
        try {
          const regex = new RegExp(keyword, 'i');
          return regex.test(searchText);
        } catch {
          return false;
        }
      } else {
        return searchText.toLowerCase().includes(keyword.toLowerCase());
      }
    });
  }

  /**
   * 组合多个过滤条件
   */
  filterMultiple(
    logs: LogEntry[],
    filters: Array<(logs: LogEntry[]) => LogEntry[]>
  ): LogEntry[] {
    return filters.reduce((result, filter) => filter(result), logs);
  }

  /**
   * 获取过滤统计信息
   */
  getFilterStats(originalLogs: LogEntry[], filteredLogs: LogEntry[]) {
    return {
      originalCount: originalLogs.length,
      filteredCount: filteredLogs.length,
      removedCount: originalLogs.length - filteredLogs.length,
      ratio: originalLogs.length > 0
        ? ((filteredLogs.length / originalLogs.length) * 100).toFixed(2) + '%'
        : '0%',
    };
  }
}

// 导出单例
export const filterService = FilterService.getInstance();
