import { ipcMain } from 'electron';
import { fileService } from '../services/fileService';
import type { FileInfo } from '@types';

/**
 * 注册文件相关的IPC处理器
 */
export function registerFileHandlers(): void {
  /**
   * 选择单个文件
   */
  ipcMain.handle('file:select', async (): Promise<FileInfo | null> => {
    return await fileService.selectFile();
  });

  /**
   * 选择多个文件
   */
  ipcMain.handle('file:select-multiple', async (): Promise<FileInfo[]> => {
    return await fileService.selectFiles();
  });

  /**
   * 选择文件夹
   */
  ipcMain.handle('file:select-folder', async (): Promise<FileInfo[]> => {
    return await fileService.selectFolder();
  });

  /**
   * 扫描文件夹
   */
  ipcMain.handle('file:scan-folder', async (_, folderPath: string, recursive: boolean = true) => {
    return await fileService.scanFolder(folderPath, recursive);
  });

  /**
   * 获取文件信息
   */
  ipcMain.handle('file:get-info', async (_, filePath: string): Promise<FileInfo | null> => {
    return await fileService.getFileInfo(filePath);
  });

  /**
   * 批量获取文件信息
   */
  ipcMain.handle('file:get-info-batch', async (_, filePaths: string[]): Promise<FileInfo[]> => {
    return await fileService.getFilesInfo(filePaths);
  });

  /**
   * 检查文件是否支持
   */
  ipcMain.handle('file:is-supported', async (_, filePath: string): Promise<boolean> => {
    return fileService.isFileSupported(filePath);
  });

  /**
   * 获取支持的文件扩展名
   */
  ipcMain.handle('file:get-supported-extensions', async (): Promise<string[]> => {
    return fileService.getSupportedExtensions();
  });

  /**
   * 获取最大文件大小
   */
  ipcMain.handle('file:get-max-size', async (): Promise<number> => {
    return fileService.getMaxFileSize();
  });

  /**
   * 格式化文件大小
   */
  ipcMain.handle('file:format-size', async (_, bytes: number): Promise<string> => {
    return fileService.formatFileSize(bytes);
  });
}
