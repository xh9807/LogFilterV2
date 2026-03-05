import { contextBridge, ipcRenderer } from 'electron';
import type { FileInfo, LogEntry, FilterConfig } from '@types';

// 暴露受保护的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统信息
  getVersions: () => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  }),

  // IPC通信测试
  ping: () => ipcRenderer.invoke('ping'),

  // 文件选择
  selectFile: () => ipcRenderer.invoke('file:select'),
  selectMultipleFiles: () => ipcRenderer.invoke('file:select-multiple'),
  selectFolder: () => ipcRenderer.invoke('file:select-folder'),

  // 文件操作
  scanFolder: (folderPath: string, recursive?: boolean) =>
    ipcRenderer.invoke('file:scan-folder', folderPath, recursive),
  getFileInfo: (filePath: string) => ipcRenderer.invoke('file:get-info', filePath),
  getFilesInfo: (filePaths: string[]) => ipcRenderer.invoke('file:get-info-batch', filePaths),

  // 文件工具
  isFileSupported: (filePath: string) => ipcRenderer.invoke('file:is-supported', filePath),
  getSupportedExtensions: () => ipcRenderer.invoke('file:get-supported-extensions'),
  getMaxFileSize: () => ipcRenderer.invoke('file:get-max-size'),
  formatFileSize: (bytes: number) => ipcRenderer.invoke('file:format-size', bytes),

  // 日志过滤
  filterLogs: (logs: LogEntry[], config: FilterConfig) =>
    ipcRenderer.invoke('filter:logs', logs, config),
  filterByTimeRange: (
    logs: LogEntry[],
    startTime?: FilterConfig['startTime'],
    endTime?: FilterConfig['endTime']
  ) => ipcRenderer.invoke('filter:by-time-range', logs, startTime, endTime),
  filterByLevel: (logs: LogEntry[], levels: string[]) =>
    ipcRenderer.invoke('filter:by-level', logs, levels),
  filterByTag: (logs: LogEntry[], tags: string[], useRegex?: boolean) =>
    ipcRenderer.invoke('filter:by-tag', logs, tags, useRegex),
  filterByKeyword: (logs: LogEntry[], keyword: string, useRegex?: boolean) =>
    ipcRenderer.invoke('filter:by-keyword', logs, keyword, useRegex),
  getFilterStats: (originalLogs: LogEntry[], filteredLogs: LogEntry[]) =>
    ipcRenderer.invoke('filter:get-stats', originalLogs, filteredLogs),

  // 日志读取
  readLogFile: (filePath: string) => ipcRenderer.invoke('log:read-file', filePath),
  readLogFiles: (filePaths: string[]) => ipcRenderer.invoke('log:read-files', filePaths),

  // 日志导出
  exportLogs: (logs: LogEntry[], format: 'txt' | 'json' | 'csv') =>
    ipcRenderer.invoke('export:logs', logs, format),
  exportToTxt: (logs: LogEntry[], outputPath: string) =>
    ipcRenderer.invoke('export:txt', logs, outputPath),
  exportToJson: (logs: LogEntry[], outputPath: string) =>
    ipcRenderer.invoke('export:json', logs, outputPath),
  exportToCsv: (logs: LogEntry[], outputPath: string) =>
    ipcRenderer.invoke('export:csv', logs, outputPath),
  showSaveDialog: (defaultName: string, filters?: any) =>
    ipcRenderer.invoke('export:show-save-dialog', defaultName, filters),
});

// TypeScript类型声明
export interface ElectronAPI {
  getVersions: () => {
    electron: string;
    chrome: string;
    node: string;
  };
  ping: () => Promise<string>;

  // 文件选择
  selectFile: () => Promise<FileInfo | null>;
  selectMultipleFiles: () => Promise<FileInfo[]>;
  selectFolder: () => Promise<FileInfo[]>;

  // 文件操作
  scanFolder: (folderPath: string, recursive?: boolean) => Promise<FileInfo[]>;
  getFileInfo: (filePath: string) => Promise<FileInfo | null>;
  getFilesInfo: (filePaths: string[]) => Promise<FileInfo[]>;

  // 文件工具
  isFileSupported: (filePath: string) => Promise<boolean>;
  getSupportedExtensions: () => Promise<string[]>;
  getMaxFileSize: () => Promise<number>;
  formatFileSize: (bytes: number) => Promise<string>;

  // 日志过滤
  filterLogs: (logs: LogEntry[], config: FilterConfig) => Promise<LogEntry[]>;
  filterByTimeRange: (
    logs: LogEntry[],
    startTime?: FilterConfig['startTime'],
    endTime?: FilterConfig['endTime']
  ) => Promise<LogEntry[]>;
  filterByLevel: (logs: LogEntry[], levels: string[]) => Promise<LogEntry[]>;
  filterByTag: (logs: LogEntry[], tags: string[], useRegex?: boolean) => Promise<LogEntry[]>;
  filterByKeyword: (logs: LogEntry[], keyword: string, useRegex?: boolean) => Promise<LogEntry[]>;
  getFilterStats: (originalLogs: LogEntry[], filteredLogs: LogEntry[]) => Promise<{
    originalCount: number;
    filteredCount: number;
    removedCount: number;
    ratio: string;
  }>;

  // 日志读取
  readLogFile: (filePath: string) => Promise<string>;
  readLogFiles: (filePaths: string[]) => Promise<string[]>;

  // 日志导出
  exportLogs: (logs: LogEntry[], format: 'txt' | 'json' | 'csv') => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  exportToTxt: (logs: LogEntry[], outputPath: string) => Promise<{ success: boolean }>;
  exportToJson: (logs: LogEntry[], outputPath: string) => Promise<{ success: boolean }>;
  exportToCsv: (logs: LogEntry[], outputPath: string) => Promise<{ success: boolean }>;
  showSaveDialog: (defaultName: string, filters?: any) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
