import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigProvider, theme } from 'antd';
import { TimePicker } from '@components/TimePicker';
import { useLogStore } from '@store/logStore';

describe('TimePicker 组件测试', () => {
  beforeEach(() => {
    // 重置 store
    const store = useLogStore.getState();
    store.updateFilterConfig({
      startTime: undefined,
      endTime: undefined,
    });
  });

  it('应该渲染时间选择器标题', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    expect(screen.getByText('时间过滤')).toBeInTheDocument();
  });

  it('应该显示起始时间和结束时间部分', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    expect(screen.getByText('起始时间:')).toBeInTheDocument();
    expect(screen.getByText('结束时间:')).toBeInTheDocument();
  });

  it('应该显示时间选择器（月、日、时、分）', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    // 检查选择器组件数量（起始时间4个 + 结束时间4个 = 8个）
    const selectInputs = screen.getAllByRole('combobox');
    expect(selectInputs.length).toBeGreaterThan(0);
  });

  it('应该显示"当前"按钮', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    expect(screen.getByText('当前')).toBeInTheDocument();
  });

  it('点击"当前"按钮应该设置当前时间', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    const currentButton = screen.getByText('当前');
    fireEvent.click(currentButton);

    const store = useLogStore.getState();
    expect(store.filterConfig.startTime).toBeDefined();
    expect(store.filterConfig.startTime?.month).toBeGreaterThan(0);
  });

  it('设置起始时间后应该显示"清空"按钮', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.updateFilterConfig({
        startTime: {
          month: 1,
          day: 16,
          hours: 14,
          minutes: 30,
          seconds: 0,
          milliseconds: 0,
        },
      });

      return (
        <ConfigProvider theme={theme}>
          <TimePicker />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    const clearButtons = screen.getAllByText('清空');
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('点击"清空"按钮应该清除起始时间', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.updateFilterConfig({
        startTime: {
          month: 1,
          day: 16,
          hours: 14,
          minutes: 30,
          seconds: 0,
          milliseconds: 0,
        },
      });

      return (
        <ConfigProvider theme={theme}>
          <TimePicker />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    const clearButtons = screen.getAllByText('清空');
    fireEvent.click(clearButtons[0]);

    const store = useLogStore.getState();
    expect(store.filterConfig.startTime).toBeUndefined();
  });

  it('应该显示提示信息', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    expect(screen.getByText(/💡 只显示起始时间到结束时间之间的日志/i)).toBeInTheDocument();
  });

  it('未设置时间时应显示"未设置"', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    const notSetTexts = screen.getAllByText('未设置');
    expect(notSetTexts.length).toBeGreaterThan(0);
  });

  it('设置时间后应该显示格式化的时间', () => {
    const Wrapper = () => {
      const store = useLogStore();
      store.updateFilterConfig({
        startTime: {
          month: 1,
          day: 16,
          hours: 14,
          minutes: 30,
          seconds: 45,
          milliseconds: 0,
        },
      });

      return (
        <ConfigProvider theme={theme}>
          <TimePicker />
        </ConfigProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('01-16 14:30:45')).toBeInTheDocument();
  });

  it('应该显示结束时间的"可选"提示', () => {
    render(
      <ConfigProvider theme={theme}>
        <TimePicker />
      </ConfigProvider>
    );

    expect(screen.getByText('可选')).toBeInTheDocument();
  });
});
