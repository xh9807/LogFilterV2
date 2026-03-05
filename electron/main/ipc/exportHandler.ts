import { ipcMain } from 'electron';
import { exportService } from '../services/exportService';
import type { LogEntry } from '@types';

/**
 * 注册导出相关的IPC处理器
 */
export function registerExportHandlers(): void {
  /**
   * 导出日志为TXT
   */
  ipcMain.handle('export:txt', async (_, logs: LogEntry[], outputPath: string) => {
    await exportService.exportToTxt(logs, outputPath);
    return { success: true };
  });

  /**
   * 导出日志为JSON
   */
  ipcMain.handle('export:json', async (_, logs: LogEntry[], outputPath: string) => {
    await exportService.exportToJson(logs, outputPath);
    return { success: true };
  });

  /**
   * 导出日志为CSV
   */
  ipcMain.handle('export:csv', async (_, logs: LogEntry[], outputPath: string) => {
    await exportService.exportToCsv(logs, outputPath);
    return { success: true };
  });

  /**
   * 导出日志（自动选择格式）
   */
  ipcMain.handle('export:logs', async (_, logs: LogEntry[], format: 'txt' | 'json' | 'csv') => {
    return await exportService.exportLogs(logs, format);
  });

  /**
   * 显示保存对话框
   */
  ipcMain.handle('export:show-save-dialog', async (_, defaultName: string, filters?: any) => {
    return await exportService.showSaveDialog(defaultName, filters);
  });
}
