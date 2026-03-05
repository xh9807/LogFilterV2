import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, theme } from 'antd';
import { FileSelector } from '@components/FileSelector';
import { useLogStore } from '@store/logStore';

// Mock electron API
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

describe('FileSelector 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染文件选择器标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <FileSelector />
      </ConfigProvider>
    );

    expect(screen.getByText('文件选择')).toBeInTheDocument();
  });

  it('应该显示三个操作按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <FileSelector />
      </ConfigProvider>
    );

    expect(screen.getByText('选择单个文件')).toBeInTheDocument();
    expect(screen.getByText('选择多个文件')).toBeInTheDocument();
    expect(screen.getByText('选择文件夹')).toBeInTheDocument();
  });

  it('当没有文件时显示空状态提示', () => {
    render(
      <ConfigProvider theme={theme}>
        <FileSelector />
      </ConfigProvider>
    );

    expect(
      screen.getByText(/请选择日志文件.*.txt.*.json/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText('支持最大 100MB 的单个文件')
    ).toBeInTheDocument();
  });

  it('应该显示已选择的文件列表', async () => {
    const mockFile = {
      path: '/path/to/test.txt',
      name: 'test.txt',
      size: 1024 * 1024,
      sizeMB: 1.0,
      format: 'txt' as const,
      isSkipped: false,
    };

    mockElectronAPI.selectFile.mockResolvedValue(mockFile);

    const { getByText, getByRole } = render(
      <ConfigProvider theme={theme}>
        <FileSelector />
      </ConfigProvider>
    );

    // 点击选择文件按钮
    fireEvent.click(getByText('选择单个文件'));

    // 等待状态更新
    await waitFor(() => {
      expect(getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('应该显示文件统计信息', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.setSelectedFiles([
        {
          path: '/path/to/test1.txt',
          name: 'test1.txt',
          size: 1024 * 1024,
          sizeMB: 1.0,
          format: 'txt' as const,
          isSkipped: false,
        },
        {
          path: '/path/to/test2.json',
          name: 'test2.json',
          size: 2 * 1024 * 1024,
          sizeMB: 2.0,
          format: 'json' as const,
          isSkipped: false,
        },
      ]);

      return (
        <ConfigProvider theme={theme}>
          <FileSelector />
        </ConfigProvider>
      );
    };

    const { getByText } = render(<Wrapper />);

    expect(getByText(/已选择.*2 个文件.*3.00 MB/i)).toBeInTheDocument();
  });
});
