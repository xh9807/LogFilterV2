import { ipcMain } from 'electron';
import { readFile } from 'fs/promises';

/**
 * 注册日志相关的IPC处理器
 */
export function registerLogHandlers(): void {
  /**
   * 读取文件内容
   */
  ipcMain.handle('log:read-file', async (_, filePath: string): Promise<string> => {
    try {
      const content = await readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`读取文件失败: ${error}`);
    }
  });

  /**
   * 批量读取多个文件
   */
  ipcMain.handle('log:read-files', async (_, filePaths: string[]): Promise<string[]> => {
    const contents: string[] = [];

    for (const filePath of filePaths) {
      try {
        const content = await readFile(filePath, 'utf-8');
        contents.push(content);
      } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error);
        contents.push(''); // 空内容表示读取失败
      }
    }

    return contents;
  });
}
