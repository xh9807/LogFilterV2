import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, theme } from 'antd';
import { SearchBar } from '@components/SearchBar';
import { useLogStore } from '@store/logStore';
import type { LogEntry } from '@types';

// Mock useLogProcessor
vi.mock('@hooks/useLogProcessor', () => ({
  useLogProcessor: () => ({
    applySearchFilter: vi.fn(),
  }),
}));

describe('SearchBar 组件测试', () => {
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
      tag: 'TestTag1',
      content: 'Test message 1',
      rawLine: '01-16 14:42:52.788 62125 62125 I TestTag1: Test message 1',
      sourceFile: 'test.txt',
      lineNumber: 1,
    },
  ];

  beforeEach(() => {
    const store = useLogStore.getState();
    store.setAllLogs(mockLogs);
    store.setFilteredLogs(mockLogs);
    store.updateFilterConfig({
      keyword: undefined,
      tags: undefined,
      useRegex: undefined,
    });
  });

  it('应该渲染搜索栏标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText('搜索过滤')).toBeInTheDocument();
  });

  it('应该显示关键词搜索输入框', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByPlaceholderText('搜索日志内容或Tag')).toBeInTheDocument();
  });

  it('应该显示Tag过滤选择器', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText('Tag过滤:')).toBeInTheDocument();
  });

  it('应该显示可用Tag数量', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText(/\(1 个可用\)/)).toBeInTheDocument();
  });

  it('应该显示正则表达式开关', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText('正则表达式:')).toBeInTheDocument();
  });

  it('应该显示"应用搜索"按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText('应用搜索')).toBeInTheDocument();
  });

  it('应该显示"清空搜索"按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText('清空搜索')).toBeInTheDocument();
  });

  it('应该显示提示信息', () => {
    render(
      <ConfigProvider theme={theme}>
        <SearchBar />
      </ConfigProvider>
    );

    expect(screen.getByText(/💡 可单独或组合使用关键词与Tag过滤/i)).toBeInTheDocument();
  });
});
