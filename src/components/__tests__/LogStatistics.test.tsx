import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, theme } from 'antd';
import { LogStatistics } from '@components/LogStatistics';
import { useLogStore } from '@store/logStore';
import type { LogEntry } from '@types';

describe('LogStatistics 组件测试', () => {
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
      content: 'Info message',
      rawLine: '01-16 14:42:52.788 62125 62125 I TestTag: Info message',
      sourceFile: 'test.txt',
      lineNumber: 1,
    },
  ];

  beforeEach(() => {
    const store = useLogStore.getState();
    store.setAllLogs(mockLogs);
    store.setFilteredLogs(mockLogs);
  });

  it('应该渲染统计信息标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('统计信息')).toBeInTheDocument();
  });

  it('应该显示总数统计', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('总数')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('应该显示过滤后统计', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('过滤后')).toBeInTheDocument();
  });

  it('应该显示占比统计', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('占比')).toBeInTheDocument();
  });

  it('应该显示等级分布标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('等级分布')).toBeInTheDocument();
  });

  it('应该显示Info等级', () => {
    render(
      <ConfigProvider theme={theme}>
        <LogStatistics />
      </ConfigProvider>
    );

    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('过滤后无日志时应该显示提示', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.setFilteredLogs([]);

      return (
        <ConfigProvider theme={theme}>
          <LogStatistics />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('当前过滤条件下无匹配日志')).toBeInTheDocument();
  });
});
