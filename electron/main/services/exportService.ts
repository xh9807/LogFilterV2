import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { dialog } from 'electron';
import type { LogEntry } from '../../src/types';

/**
 * 导出服务类
 */
export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * 导出为TXT格式
   */
  async exportToTxt(logs: LogEntry[], outputPath: string): Promise<void> {
    const lines = logs.map((log) => log.rawLine);
    const content = lines.join('\n');

    // 确保目录存在
    await mkdir(dirname(outputPath), { recursive: true });

    // 写入文件
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * 导出为JSON格式
   */
  async exportToJson(logs: LogEntry[], outputPath: string): Promise<void> {
    const data = logs.map((log) => ({
      timestamp: log.timestamp,
      level: log.level,
      pid: log.pid,
      tid: log.tid,
      tag: log.tag,
      content: log.content,
      sourceFile: log.sourceFile,
      lineNumber: log.lineNumber,
    }));

    const content = JSON.stringify(data, null, 2);

    // 确保目录存在
    await mkdir(dirname(outputPath), { recursive: true });

    // 写入文件
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * 导出为CSV格式
   */
  async exportToCsv(logs: LogEntry[], outputPath: string): Promise<void> {
    const headers = ['Timestamp', 'Level', 'PID', 'TID', 'Tag', 'Content', 'Source'];
    const rows = logs.map((log) => [
      log.timestamp,
      log.level,
      log.pid,
      log.tid,
      `"${log.tag.replace(/"/g, '""')}"`,
      `"${log.content.replace(/"/g, '""')}"`,
      log.sourceFile,
    ]);

    const content = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // 确保目录存在
    await mkdir(dirname(outputPath), { recursive: true });

    // 写入文件
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * 显示保存文件对话框
   */
  async showSaveDialog(defaultName: string, filters?: Array<{ name: string; extensions: string[] }>) {
    const result = await dialog.showSaveDialog({
      title: '导出日志',
      defaultPath: defaultName,
      filters: filters || [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result;
  }

  /**
   * 导出日志（自动选择格式）
   */
  async exportLogs(
    logs: LogEntry[],
    format: 'txt' | 'json' | 'csv' = 'txt'
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // 生成默认文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultName = `hilog-logs-${timestamp}.${format}`;

      // 显示保存对话框
      const result = await this.showSaveDialog(defaultName);

      if (result.canceled || !result.filePath) {
        return { success: false };
      }

      const filePath = result.filePath;

      // 根据格式导出
      switch (format) {
        case 'txt':
          await this.exportToTxt(logs, filePath);
          break;
        case 'json':
          await this.exportToJson(logs, filePath);
          break;
        case 'csv':
          await this.exportToCsv(logs, filePath);
          break;
      }

      return { success: true, filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      };
    }
  }
}

// 导出单例
export const exportService = ExportService.getInstance();
