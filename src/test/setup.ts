import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// Mock electron API
global.window.electronAPI = {
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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
