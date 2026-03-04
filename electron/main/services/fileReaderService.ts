import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { EventEmitter } from 'events';
import type { LogEntry } from '../../src/types';

/**
 * 文件读取进度信息
 */
export interface ReadProgress {
  filePath: string;
  totalBytes: number;
  readBytes: number;
  progress: number; // 0-1
  totalLines: number;
  parsedLines: number;
  isCompleted: boolean;
}

/**
 * 文件读取结果
 */
export interface ReadResult {
  filePath: string;
  logs: LogEntry[];
  totalLines: number;
  parsedLines: number;
  failedLines: number;
  emptyLines: number;
}

/**
 * 文件读取选项
 */
export interface ReadOptions {
  chunkSize?: number; // 每次读取的行数
  onProgress?: (progress: ReadProgress) => void;
  onComplete?: (result: ReadResult) => void;
  onError?: (error: Error) => void;
}

/**
 * 文件读取服务类
 * 使用流式读取处理大文件
 */
export class FileReaderService extends EventEmitter {
  private static instance: FileReaderService;

  private constructor() {
    super();
  }

  static getInstance(): FileReaderService {
    if (!FileReaderService.instance) {
      FileReaderService.instance = new FileReaderService();
    }
    return FileReaderService.instance;
  }

  /**
   * 流式读取文件并解析日志
   */
  async readFile(filePath: string, options: ReadOptions = {}): Promise<ReadResult> {
    return new Promise((resolve, reject) => {
      const logs: LogEntry[] = [];
      let totalLines = 0;
      let parsedLines = 0;
      let failedLines = 0;
      let emptyLines = 0;
      let readBytes = 0;
      let totalBytes = 0;

      try {
        // 创建文件流
        const fileStream = createReadStream(filePath, {
          encoding: 'utf8',
          highWaterMark: 64 * 1024, // 64KB buffer
        });

        // 获取文件大小
        fileStream.on('data', (chunk) => {
          if (totalBytes === 0) {
            // 第一次读取时获取文件总大小（通过stat获取更准确，这里简化处理）
          }
        });

        // 创建逐行读取接口
        const rl = createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let lineNumber = 0;

        rl.on('line', (line) => {
          lineNumber++;
          totalLines++;

          // 解析日志行（这里需要在主进程中实现解析逻辑或调用Renderer进程的解析）
          // 为了简化，这里先收集原始行，实际应该调用解析器
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            emptyLines++;
          } else {
            // TODO: 调用日志解析器
            // const entry = parseLogLine(trimmedLine, filePath, lineNumber);
            // if (entry) {
            //   logs.push(entry);
            //   parsedLines++;
            // } else {
            //   failedLines++;
            // }
            parsedLines++; // 临时计数
          }

          // 定期发送进度更新
          if (options.onProgress && lineNumber % 1000 === 0) {
            options.onProgress({
              filePath,
              totalBytes,
              readBytes,
              progress: 0, // TODO: 计算实际进度
              totalLines,
              parsedLines,
              isCompleted: false,
            });
          }
        });

        rl.on('close', () => {
          const result: ReadResult = {
            filePath,
            logs,
            totalLines,
            parsedLines,
            failedLines,
            emptyLines,
          };

          if (options.onComplete) {
            options.onComplete(result);
          }

          this.emit('complete', result);
          resolve(result);
        });

        rl.on('error', (error) => {
          const err = new Error(`读取文件失败: ${error.message}`);
          if (options.onError) {
            options.onError(err);
          }
          this.emit('error', err);
          reject(err);
        });

        fileStream.on('data', (chunk) => {
          readBytes += chunk.length;
          totalBytes = Math.max(totalBytes, readBytes);
        });

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (options.onError) {
          options.onError(err);
        }
        this.emit('error', err);
        reject(err);
      }
    });
  }

  /**
   * 批量读取多个文件
   */
  async readFiles(filePaths: string[], options: ReadOptions = {}): Promise<ReadResult[]> {
    const results: ReadResult[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.readFile(filePath, options);
        results.push(result);
      } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error);
        // 继续读取下一个文件
      }
    }

    return results;
  }

  /**
   * 取消读取操作
   */
  cancel(): void {
    this.emit('cancel');
  }
}

// 导出单例
export const fileReaderService = FileReaderService.getInstance();
