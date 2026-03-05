import { ipcMain } from 'electron';
import { filterService } from '../services/filterService';
import type { LogEntry, FilterConfig } from '@types';

/**
 * 注册过滤相关的IPC处理器
 */
export function registerFilterHandlers(): void {
  /**
   * 过滤日志
   */
  ipcMain.handle(
    'filter:logs',
    async (_, logs: LogEntry[], config: FilterConfig): Promise<LogEntry[]> => {
      return filterService.filterLogs(logs, config);
    }
  );

  /**
   * 按时间范围过滤
   */
  ipcMain.handle(
    'filter:by-time-range',
    async (
      _,
      logs: LogEntry[],
      startTime?: { month: number; day: number; hours: number; minutes: number; seconds: number },
      endTime?: { month: number; day: number; hours: number; minutes: number; seconds: number }
    ): Promise<LogEntry[]> => {
      return filterService.filterByTimeRange(logs, startTime, endTime);
    }
  );

  /**
   * 按日志等级过滤
   */
  ipcMain.handle(
    'filter:by-level',
    async (_, logs: LogEntry[], levels: string[]): Promise<LogEntry[]> => {
      return filterService.filterByLevel(logs, levels as any);
    }
  );

  /**
   * 按Tag过滤
   */
  ipcMain.handle(
    'filter:by-tag',
    async (_, logs: LogEntry[], tags: string[], useRegex = false): Promise<LogEntry[]> => {
      return filterService.filterByTag(logs, tags, useRegex);
    }
  );

  /**
   * 按关键词搜索
   */
  ipcMain.handle(
    'filter:by-keyword',
    async (_, logs: LogEntry[], keyword: string, useRegex = false): Promise<LogEntry[]> => {
      return filterService.filterByKeyword(logs, keyword, useRegex);
    }
  );

  /**
   * 获取过滤统计
   */
  ipcMain.handle(
    'filter:get-stats',
    async (_, originalLogs: LogEntry[], filteredLogs: LogEntry[]) => {
      return filterService.getFilterStats(originalLogs, filteredLogs);
    }
  );
}
