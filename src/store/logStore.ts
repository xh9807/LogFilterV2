import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileInfo, LogEntry, FilterConfig, LogLevel } from '../types';

/**
 * 应用状态
 */
interface AppState {
  // 文件状态
  selectedFiles: FileInfo[];
  processedFiles: string[];

  // 日志数据
  allLogs: LogEntry[];
  filteredLogs: LogEntry[];

  // 过滤配置
  filterConfig: FilterConfig;

  // UI状态
  isLoading: boolean;
  loadingMessage?: string;
  error?: string;

  // 统计信息
  statistics: {
    totalLogs: number;
    filteredLogs: number;
    levelCounts: Record<LogLevel, number>;
  };
}

/**
 * 应用Actions
 */
interface AppActions {
  // 文件操作
  setSelectedFiles: (files: FileInfo[]) => void;
  addSelectedFile: (file: FileInfo) => void;
  removeSelectedFile: (filePath: string) => void;
  clearSelectedFiles: () => void;

  // 日志操作
  setAllLogs: (logs: LogEntry[]) => void;
  addLogs: (logs: LogEntry[]) => void;
  setFilteredLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;

  // 过滤操作
  setFilterConfig: (config: FilterConfig) => void;
  updateFilterConfig: (config: Partial<FilterConfig>) => void;
  clearFilterConfig: () => void;

  // UI操作
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error?: string) => void;
  clearError: () => void;

  // 统计操作
  updateStatistics: () => void;

  // 重置
  reset: () => void;
}

/**
 * 应用Store类型
 */
type LogStore = AppState & AppActions;

/**
 * 初始状态
 */
const initialState: AppState = {
  selectedFiles: [],
  processedFiles: [],
  allLogs: [],
  filteredLogs: [],
  filterConfig: {},
  isLoading: false,
  loadingMessage: undefined,
  error: undefined,
  statistics: {
    totalLogs: 0,
    filteredLogs: 0,
    levelCounts: {
      D: 0,
      I: 0,
      W: 0,
      E: 0,
      F: 0,
    },
  },
};

/**
 * 计算统计信息
 */
function calculateStatistics(logs: LogEntry[]) {
  const levelCounts: Record<LogLevel, number> = {
    D: 0,
    I: 0,
    W: 0,
    E: 0,
    F: 0,
  };

  logs.forEach((log) => {
    levelCounts[log.level]++;
  });

  return {
    totalLogs: logs.length,
    filteredLogs: logs.length,
    levelCounts,
  };
}

/**
 * 创建LogStore
 */
export const useLogStore = create<LogStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 文件操作
      setSelectedFiles: (files) => {
        set({ selectedFiles: files });
      },

      addSelectedFile: (file) => {
        set((state) => ({
          selectedFiles: [...state.selectedFiles, file],
        }));
      },

      removeSelectedFile: (filePath) => {
        set((state) => ({
          selectedFiles: state.selectedFiles.filter((f) => f.path !== filePath),
        }));
      },

      clearSelectedFiles: () => {
        set({ selectedFiles: [] });
      },

      // 日志操作
      setAllLogs: (logs) => {
        set((state) => ({
          allLogs: logs,
          statistics: calculateStatistics(logs),
        }));
      },

      addLogs: (logs) => {
        set((state) => {
          const newLogs = [...state.allLogs, ...logs];
          return {
            allLogs: newLogs,
            statistics: calculateStatistics(newLogs),
          };
        });
      },

      setFilteredLogs: (logs) => {
        set((state) => {
          const levelCounts: Record<LogLevel, number> = {
            D: 0,
            I: 0,
            W: 0,
            E: 0,
            F: 0,
          };

          // 计算过滤后日志的等级分布
          logs.forEach((log) => {
            levelCounts[log.level]++;
          });

          return {
            filteredLogs: logs,
            statistics: {
              ...state.statistics,
              filteredLogs: logs.length,
              levelCounts,
            },
          };
        });
      },

      clearLogs: () => {
        set({
          allLogs: [],
          filteredLogs: [],
          statistics: {
            totalLogs: 0,
            filteredLogs: 0,
            levelCounts: {
              D: 0,
              I: 0,
              W: 0,
              E: 0,
              F: 0,
            },
          },
        });
      },

      // 过滤操作
      setFilterConfig: (config) => {
        set({ filterConfig: config });
      },

      updateFilterConfig: (config) => {
        set((state) => ({
          filterConfig: { ...state.filterConfig, ...config },
        }));
      },

      clearFilterConfig: () => {
        set({ filterConfig: {} });
      },

      // UI操作
      setLoading: (loading, message) => {
        set({ isLoading: loading, loadingMessage: message });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: undefined });
      },

      // 统计操作
      updateStatistics: () => {
        set((state) => ({
          statistics: calculateStatistics(state.allLogs),
        }));
      },

      // 重置
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'log-filter-storage',
      // 只持久化部分状态
      partialize: (state) => ({
        filterConfig: state.filterConfig,
        selectedFiles: state.selectedFiles.map((f) => ({
          path: f.path,
          name: f.name,
          size: f.size,
          sizeMB: f.sizeMB,
          format: f.format,
        })),
      }),
    }
  )
);

/**
 * 选择器：获取选中的且未被跳过的文件
 */
export const useValidFiles = () => {
  return useLogStore((state) => state.selectedFiles.filter((f) => !f.isSkipped));
};

/**
 * 选择器：获取文件统计信息
 */
export const useFilesStatistics = () => {
  const selectedFiles = useLogStore((state) => state.selectedFiles);
  const validFiles = selectedFiles.filter((f) => !f.isSkipped);
  const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return {
    totalCount: selectedFiles.length,
    validCount: validFiles.length,
    skippedCount: selectedFiles.length - validFiles.length,
    totalSize: totalSizeMB + ' MB',
  };
};

/**
 * 选择器：获取是否已选择文件
 */
export const useHasFiles = () => {
  const selectedFiles = useLogStore((state) => state.selectedFiles);
  const validFiles = selectedFiles.filter((f) => !f.isSkipped);
  return validFiles.length > 0;
};

/**
 * 选择器：获取是否有日志
 */
export const useHasLogs = () => {
  const allLogs = useLogStore((state) => state.allLogs);
  return allLogs.length > 0;
};

/**
 * 选择器：获取是否有过滤后的日志
 */
export const useHasFilteredLogs = () => {
  const filteredLogs = useLogStore((state) => state.filteredLogs);
  return filteredLogs.length > 0;
};
