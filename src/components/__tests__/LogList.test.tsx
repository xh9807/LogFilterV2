import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, theme } from 'antd';
import { LogList } from '@components/LogList';
import { useLogStore } from '@store/logStore';
import type { LogEntry } from '@types';

// Mock electronAPI
const mockElectronAPI = {
  selectFile: vi.fn(),
  selectMultipleFiles: vi.fn(),
  selectFolder: vi.fn(),
  readLogFile: vi.fn(),
  exportLogs: vi.fn(),
  getVersions: vi.fn(() => ({
    electron: '28.0.0',
    chrome: '120.0.6099.109',
    node: '20.10.0',
  })),
  ping: vi.fn(async () => 'pong'),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('LogList 组件测试', () => {
  const mockLogs: LogEntry[] = [
    {
      timestamp: '01-16 14:42:52.788',
      date: '01-16',
      time: '14:42:52.788',
      month: 1,
      day: 16,
      hours: 14,
      minutes: 42,
      seconds: 52,
      milliseconds: 788,
      level: 'I',
      pid: 62125,
      tid: 62125,
      tag: 'TestTag',
      content: 'Test message',
      rawLine: '01-16 14:42:52.788 62125 62125 I TestTag: Test message',
      sourceFile: 'test.txt',
      lineNumber: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const store = useLogStore.getState();
    store.setAllLogs(mockLogs);
    store.setFilteredLogs(mockLogs);
    store.setLoading(false);
  });

  it('无日志时应该显示空状态', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.setFilteredLogs([]);
      store.setLoading(false);

      return (
        <ConfigProvider theme={theme}>
          <LogList />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('暂无日志数据')).toBeInTheDocument();
  });

  it('空状态应该显示提示信息', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.setFilteredLogs([]);
      store.setLoading(false);

      return (
        <ConfigProvider theme={theme}>
          <LogList />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('请先选择日志文件并设置过滤条件')).toBeInTheDocument();
  });

  it('加载时应该显示加载状态', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.setLoading(true, '正在加载日志...');

      return (
        <ConfigProvider theme={theme}>
          <LogList />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('正在加载日志...')).toBeInTheDocument();
  });

  it('有日志时应该显示列表标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogList />
      </ConfigProvider>
    );

    expect(screen.getByText(/过滤结果.*1 条/)).toBeInTheDocument();
  });

  it('应该显示导出按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogList />
      </ConfigProvider>
    );

    expect(screen.getByText('导出')).toBeInTheDocument();
  });

  it('应该显示"更多格式"按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogList />
      </ConfigProvider>
    );

    expect(screen.getByText('更多格式')).toBeInTheDocument();
  });

  it('应该显示底部统计信息', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogList />
      </ConfigProvider>
    );

    expect(screen.getByText(/总计: 1 条/)).toBeInTheDocument();
  });

  it('应该显示虚拟滚动状态', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogList />
      </ConfigProvider>
    );

    expect(screen.getByText('虚拟滚动: 开启')).toBeInTheDocument();
  });
});
