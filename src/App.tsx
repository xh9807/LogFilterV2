import { useState, useCallback } from 'react';
import { Card, Typography, Space, Button, Spin, message } from 'antd';
import { PlayCircleOutlined, ClearOutlined, LoadingOutlined } from '@ant-design/icons';
import { FileSelector } from './components/FileSelector';
import { TimePicker } from './components/TimePicker';
import { SearchBar } from './components/SearchBar';
import { LogList } from './components/LogList';
import { LogDetailDialog, useLogDetailDialog } from './components/LogDetailDialog';
import { LogStatistics } from './components/LogStatistics';
import { useLogStore } from './store/logStore';
import { useLogProcessor } from './hooks/useLogProcessor';
import type { LogEntry } from './types';
import './App.css';

const { Text } = Typography;

function App() {
  const { selectedFiles, allLogs, filteredLogs, filterConfig, isLoading, loadingMessage, setLoading, setError, clearLogs } =
    useLogStore();

  const { visible, selectedLog, show: showDetail, hide: hideDetail } = useLogDetailDialog();
  const { processFiles } = useLogProcessor();

  /**
   * 处理开始过滤
   */
  const handleStartFilter = useCallback(async () => {
    // 检查是否选择了文件
    const validFiles = selectedFiles.filter((f) => !f.isSkipped);
    if (validFiles.length === 0) {
      message.warning('请先选择日志文件');
      return;
    }

    // 检查是否设置了时间（至少需要起始时间）
    if (!filterConfig.startTime) {
      message.warning('请设置起始时间');
      return;
    }

    try {
      const filePaths = validFiles.map((f) => f.path);

      // 使用真实的日志处理流程，支持结束时间过滤
      await processFiles(filePaths, filterConfig.startTime, filterConfig.endTime);
    } catch (error) {
      // 错误已在useLogProcessor中处理
      console.error('过滤失败:', error);
    }
  }, [selectedFiles, filterConfig, processFiles]);

  /**
   * 处理清空
   */
  const handleClear = useCallback(() => {
    clearLogs();
    message.success('已清空日志');
  }, [clearLogs]);

  /**
   * 处理日志点击
   */
  const handleLogClick = useCallback(
    (log: LogEntry) => {
      showDetail(log);
    },
    [showDetail]
  );

  /**
   * 是否可以开始过滤
   */
  const canStartFilter = selectedFiles.some((f) => !f.isSkipped) && filterConfig.startTime;

  return (
    <div className="app">
      {/* 顶部标题栏 */}
      <div className="app-header">
        <h1>HiLog 日志过滤器</h1>
        <div className="subtitle">鸿蒙HiLog日志过滤系统 - 跨平台桌面应用</div>
      </div>

      {/* 主要内容区域 */}
      <div className="app-content">
        {/* 左侧边栏 */}
        <div className="app-sidebar">
          <div className="sidebar-section">
            <FileSelector />
          </div>

          <div className="sidebar-section">
            <TimePicker />
          </div>

          {/* 搜索栏 */}
          {allLogs.length > 0 && (
            <div className="sidebar-section">
              <SearchBar />
            </div>
          )}

          {/* 统计信息 */}
          <div className="sidebar-section">
            <LogStatistics />
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="sidebar-section">
              <Card className="loading-card">
                <Space direction="vertical" align="center">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  <Text type="secondary">{loadingMessage || '正在处理...'}</Text>
                </Space>
              </Card>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="sidebar-actions">
            <div className="action-buttons">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartFilter}
                disabled={!canStartFilter}
                size="large"
              >
                开始过滤
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear}
                disabled={allLogs.length === 0}
                size="large"
              >
                清空
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧主内容区域 */}
        <div className="app-main">
          <LogList onLogClick={handleLogClick} />
        </div>
      </div>

      {/* 日志详情弹窗 */}
      <LogDetailDialog log={selectedLog} visible={visible} onClose={hideDetail} />
    </div>
  );
}

export default App;
