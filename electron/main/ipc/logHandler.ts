import { ipcMain } from 'electron';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

/**
 * 注册日志相关的IPC处理器
 */
export function registerLogHandlers(): void {
  /**
   * 读取文件内容（使用流式读取处理大文件）
   */
  ipcMain.handle('log:read-file', async (_, filePath: string): Promise<string> => {
    try {
      // 检查文件大小
      const stats = await stat(filePath);
      const fileSize = stats.size;
      const fileSizeMB = fileSize / (1024 * 1024);

      // 如果文件超过50MB，给出警告但仍尝试读取
      if (fileSizeMB > 50) {
        console.warn(`文件较大: ${fileSizeMB.toFixed(2)}MB，读取可能需要一些时间...`);
      }

      // 使用流式读取
      return new Promise((resolve, reject) => {
        const stream = createReadStream(filePath, { encoding: 'utf8' });
        let content = '';

        stream.on('data', (chunk) => {
          content += chunk;
        });

        stream.on('end', () => {
          resolve(content);
        });

        stream.on('error', (error) => {
          reject(new Error(`读取文件失败: ${filePath} - ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`无法访问文件: ${filePath} - ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  /**
   * 批量读取多个文件
   */
  ipcMain.handle('log:read-files', async (_, filePaths: string[]): Promise<string[]> => {
    const contents: string[] = [];

    for (const filePath of filePaths) {
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const stream = createReadStream(filePath, { encoding: 'utf8' });
          let content = '';

          stream.on('data', (chunk) => {
            content += chunk;
          });

          stream.on('end', () => {
            resolve(content);
          });

          stream.on('error', (error) => {
            reject(new Error(`读取文件失败: ${filePath} - ${error.message}`));
          });
        });

        contents.push(content);
      } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error);
        contents.push(''); // 空内容表示读取失败
      }
    }

    return contents;
  });
}
