import { useCallback } from 'react';
import { message } from 'antd';
import { parseLogLinesWithStats } from '@utils/logParser';
import { isTimeAfterOrEqual, isTimeBeforeOrEqual, extractTimeFromLogEntry } from '@utils/timeParser';
import { useLogStore } from '@store/logStore';
import type { LogEntry, LogTime } from '@types';

/**
 * 日志处理Hook
 * 负责读取、解析和过滤日志
 */
export const useLogProcessor = () => {
  const { setAllLogs, setFilteredLogs, setLoading, setError } = useLogStore();

  /**
   * 处理文件读取和日志解析
   */
  const processFiles = useCallback(
    async (filePaths: string[], startTime?: LogTime, endTime?: LogTime) => {
      if (!window.electronAPI) {
        throw new Error('Electron API未初始化');
      }

      try {
        setLoading(true, '正在读取文件...');
        const startTimeStamp = Date.now();

        const allLogs: LogEntry[] = [];
        let totalLines = 0;
        let parsedCount = 0;
        let failedCount = 0;

        // 读取每个文件
        for (let i = 0; i < filePaths.length; i++) {
          const filePath = filePaths[i];
          try {
            setLoading(true, `正在读取文件 ${i + 1}/${filePaths.length}...`);

            // 通过IPC读取文件内容
            const content = await window.electronAPI.readLogFile(filePath);

            // 检查文件大小，如果过大则分块处理
            const CHUNK_SIZE = 10000; // 每次处理10000行
            const lines = content.split('\n');

            totalLines += lines.length;

            // 分块解析日志以避免堆栈溢出
            for (let chunkStart = 0; chunkStart < lines.length; chunkStart += CHUNK_SIZE) {
              const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, lines.length);
              const chunk = lines.slice(chunkStart, chunkEnd);

              // 解析当前块
              const { logs, stats } = parseLogLinesWithStats(chunk, filePath);

              allLogs.push(...logs);
              parsedCount += stats.parsedLines;
              failedCount += stats.failedLines;

              // 更新进度
              const progress = Math.round((chunkEnd / lines.length) * 100);
              setLoading(true, `正在解析文件 ${i + 1}/${filePaths.length}... ${progress}%`);

              // 让UI有机会更新
              await new Promise(resolve => setTimeout(resolve, 0));
            }

            console.log(`文件 ${filePath} 解析完成:`, { parsedCount, failedCount });
          } catch (error) {
            console.error(`处理文件失败: ${filePath}`, error);
            message.error(`文件读取失败: ${filePath}`);
            // 继续处理下一个文件
          }
        }

        const readTime = Date.now() - startTimeStamp;
        setLoading(true, `已解析 ${allLogs.length} 条日志，正在过滤...`);

        // 保存所有日志
        setAllLogs(allLogs);

        // 应用过滤条件
        let filteredLogs = allLogs;

        // 时间过滤
        if (startTime || endTime) {
          filteredLogs = filteredLogs.filter((log) => {
            const logTime = extractTimeFromLogEntry(log);

            // 检查起始时间
            if (startTime && !isTimeAfterOrEqual(logTime, startTime)) {
              return false;
            }

            // 检查结束时间
            if (endTime && !isTimeBeforeOrEqual(logTime, endTime)) {
              return false;
            }

            return true;
          });
        }

        // 更新过滤后的日志
        setFilteredLogs(filteredLogs);

        setLoading(false);

        const totalTime = Date.now() - startTimeStamp;

        message.success(
          `处理完成！读取 ${totalLines} 行，解析 ${parsedCount} 条，过滤后 ${filteredLogs.length} 条 (耗时 ${totalTime}ms)`
        );

        return {
          totalLogs: allLogs.length,
          filteredLogs: filteredLogs.length,
          totalLines,
          parsedCount,
          failedCount,
        };
      } catch (error) {
        setLoading(false);
        const errorMsg = error instanceof Error ? error.message : '处理文件失败';
        setError(errorMsg);
        message.error(errorMsg);
        throw error;
      }
    },
    [setAllLogs, setFilteredLogs, setLoading, setError]
  );

  /**
   * 应用搜索过滤
   */
  const applySearchFilter = useCallback(
    (keyword?: string, tags?: string[], useRegex = false) => {
      const { allLogs } = useLogStore.getState();

      setLoading(true, '正在搜索...');

      try {
        let filteredLogs = allLogs;

        // Tag 过滤
        if (tags && tags.length > 0) {
          filteredLogs = filteredLogs.filter((log) => {
            return tags.some((tag) => {
              if (useRegex) {
                try {
                  const regex = new RegExp(tag, 'i');
                  return regex.test(log.tag);
                } catch {
                  return false;
                }
              } else {
                return log.tag.includes(tag);
              }
            });
          });
        }

        // 关键词搜索
        if (keyword && keyword.trim()) {
          const searchTerm = keyword.trim();

          filteredLogs = filteredLogs.filter((log) => {
            const searchText = `${log.tag} ${log.content}`;

            if (useRegex) {
              try {
                const regex = new RegExp(searchTerm, 'i');
                return regex.test(log.tag) || regex.test(log.content);
              } catch {
                // 正则表达式无效，回退到普通搜索
                return searchText.toLowerCase().includes(searchTerm.toLowerCase());
              }
            } else {
              return searchText.toLowerCase().includes(searchTerm.toLowerCase());
            }
          });
        }

        // 更新过滤后的日志
        setFilteredLogs(filteredLogs);

        setLoading(false);

        if (keyword || (tags && tags.length > 0)) {
          message.success(`找到 ${filteredLogs.length} 条匹配的日志`);
        }

        return filteredLogs.length;
      } catch (error) {
        setLoading(false);
        const errorMsg = error instanceof Error ? error.message : '搜索失败';
        setError(errorMsg);
        message.error(errorMsg);
        return 0;
      }
    },
    [setFilteredLogs, setLoading, setError, setAllLogs]
  );

  return {
    processFiles,
    applySearchFilter,
  };
};
