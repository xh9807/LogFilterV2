import { dialog } from 'electron';
import { stat, readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import type { FileInfo } from '../../src/types';

/**
 * 文件大小限制：100MB
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * 支持的文件格式
 */
const SUPPORTED_EXTENSIONS = ['.txt', '.json'];

/**
 * 文件服务类
 */
export class FileService {
  /**
   * 选择单个文件
   */
  async selectFile(): Promise<FileInfo | null> {
    const result = await dialog.showOpenDialog({
      title: '选择日志文件',
      properties: ['openFile'],
      filters: [
        { name: '日志文件', extensions: ['txt', 'json'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    return this.getFileInfo(filePath);
  }

  /**
   * 选择多个文件
   */
  async selectFiles(): Promise<FileInfo[]> {
    const result = await dialog.showOpenDialog({
      title: '选择日志文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '日志文件', extensions: ['txt', 'json'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    const fileInfos: FileInfo[] = [];
    for (const filePath of result.filePaths) {
      const info = await this.getFileInfo(filePath);
      if (info) {
        fileInfos.push(info);
      }
    }

    return fileInfos;
  }

  /**
   * 选择文件夹
   */
  async selectFolder(): Promise<FileInfo[]> {
    const result = await dialog.showOpenDialog({
      title: '选择日志文件夹',
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    const folderPath = result.filePaths[0];
    return this.scanFolder(folderPath);
  }

  /**
   * 扫描文件夹，获取所有支持的文件
   */
  async scanFolder(folderPath: string, recursive: boolean = true): Promise<FileInfo[]> {
    const fileInfos: FileInfo[] = [];

    try {
      const entries = await readdir(folderPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(folderPath, entry.name);

        if (entry.isDirectory() && recursive) {
          // 递归扫描子目录
          const subFiles = await this.scanFolder(fullPath, recursive);
          fileInfos.push(...subFiles);
        } else if (entry.isFile()) {
          const info = await this.getFileInfo(fullPath);
          if (info) {
            fileInfos.push(info);
          }
        }
      }
    } catch (error) {
      console.error(`扫描文件夹失败: ${folderPath}`, error);
    }

    return fileInfos;
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await stat(filePath);
      const ext = extname(filePath).toLowerCase();
      const name = basename(filePath);
      const size = stats.size;
      const sizeMB = size / (1024 * 1024);

      // 检查文件格式
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        return null;
      }

      // 检查文件大小
      const isSkipped = size > MAX_FILE_SIZE;
      const skipReason = isSkipped ? `文件过大 (${sizeMB.toFixed(2)}MB > 100MB)` : undefined;

      const fileInfo: FileInfo = {
        path: filePath,
        name,
        size,
        sizeMB: parseFloat(sizeMB.toFixed(2)),
        format: ext === '.json' ? 'json' : 'txt',
        isSkipped,
        skipReason,
      };

      return fileInfo;
    } catch (error) {
      console.error(`获取文件信息失败: ${filePath}`, error);
      return null;
    }
  }

  /**
   * 批量获取文件信息
   */
  async getFilesInfo(filePaths: string[]): Promise<FileInfo[]> {
    const fileInfos: FileInfo[] = [];

    for (const filePath of filePaths) {
      const info = await this.getFileInfo(filePath);
      if (info) {
        fileInfos.push(info);
      }
    }

    return fileInfos;
  }

  /**
   * 检查文件是否支持
   */
  isFileSupported(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  }

  /**
   * 获取支持的文件扩展名
   */
  getSupportedExtensions(): string[] {
    return [...SUPPORTED_EXTENSIONS];
  }

  /**
   * 获取最大文件大小
   */
  getMaxFileSize(): number {
    return MAX_FILE_SIZE;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// 导出单例
export const fileService = new FileService();
