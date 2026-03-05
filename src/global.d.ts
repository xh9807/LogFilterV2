/**
 * 全局类型定义
 */

import type { FileInfo, LogEntry, ExportResult } from './types';

declare global {
  interface Window {
    electronAPI: {
      selectFile: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
      selectMultipleFiles: () => Promise<{ success: boolean; filePaths?: string[]; error?: string }>;
      selectFolder: () => Promise<{ success: boolean; folderPath?: string; error?: string }>;
      readLogFile: (filePath: string) => Promise<{
        success: boolean;
        content?: string;
        error?: string;
      }>;
      exportLogs: (logs: LogEntry[], format: 'txt' | 'json' | 'csv') => Promise<ExportResult>;
      getVersions: () => Promise<{
        electron: string;
        chrome: string;
        node: string;
      }>;
      ping: () => Promise<string>;
    };
  }
}

export {};
