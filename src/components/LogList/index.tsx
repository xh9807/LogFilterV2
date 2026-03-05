import React, { useCallback, useMemo } from 'react';
import { areEqual, FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Card, Tag, Typography, Empty, Space, Button, Dropdown, message } from 'antd';
import { FileTextOutlined, DownloadOutlined, FileTextOutlined as FileIcon } from '@ant-design/icons';
import type { LogEntry, LogLevel } from '@types';
import { LOG_LEVEL_CONFIGS } from '@constants/logLevelConfigs';
import { useLogStore } from '@store/logStore';
import './LogList.css';

const { Text } = Typography;

interface LogListProps {
  onLogClick?: (log: LogEntry) => void;
}

/**
 * 日志行组件
 */
const LogRow: React.FC<ListChildComponentProps<Array<LogEntry>>> = ({ data, index, style }) => {
  const log = data[index];
  const levelConfig = LOG_LEVEL_CONFIGS[log.level];

  const handleClick = () => {
    // 触发日志点击事件（可以通过回调或状态管理处理）
    console.log('点击日志:', log);
  };

  return (
    <div className="log-row" style={style} onClick={handleClick}>
      <div className="log-row-content">
        {/* 日志等级 */}
        <Tag
          color={levelConfig.color}
          className="log-level-tag"
          style={{
            margin: 0,
            backgroundColor: levelConfig.backgroundColor,
          }}
        >
          {levelConfig.icon}
        </Tag>

        {/* 时间戳 */}
        <Text className="log-time" style={{ fontSize: '12px' }}>
          {log.timestamp}
        </Text>

        {/* PID/TID */}
        <Text type="secondary" className="log-pid-tid" style={{ fontSize: '11px' }}>
          {log.pid}/{log.tid}
        </Text>

        {/* Tag */}
        <Text className="log-tag" style={{ fontSize: '12px' }} ellipsis>
          {log.tag}
        </Text>

        {/* 内容 */}
        <Text className="log-content" style={{ fontSize: '12px' }} ellipsis>
          {log.content}
        </Text>
      </div>
    </div>
  );
};

/**
 * 优化比较函数，避免不必要的重新渲染
 */
const areEqualLogRow = (prev: ListChildComponentProps, next: ListChildComponentProps) => {
  const prevData = prev.data as Array<LogEntry>;
  const nextData = next.data as Array<LogEntry>;

  return (
    prev.index === next.index &&
    prevData[prev.index]?.rawLine === nextData[next.index]?.rawLine
  );
};

const MemoizedLogRow = React.memo(LogRow, areEqualLogRow);

/**
 * 日志列表组件
 * 使用react-window实现虚拟滚动，支持大量日志流畅展示
 */
export const LogList: React.FC<LogListProps> = ({ onLogClick }) => {
  const { filteredLogs, isLoading } = useLogStore();

  /**
   * 计算列表高度
   */
  const getItemHeight = useCallback(() => {
    return 40; // 每行高度40px
  }, []);

  /**
   * 处理日志点击
   */
  const handleLogClick = useCallback(
    (log: LogEntry) => {
      if (onLogClick) {
        onLogClick(log);
      }
    },
    [onLogClick]
  );

  /**
   * 处理导出
   */
  const handleExport = useCallback(async (format: 'txt' | 'json' | 'csv') => {
    if (!window.electronAPI) {
      message.error('Electron API未初始化');
      return;
    }

    try {
      const result = await window.electronAPI.exportLogs(filteredLogs, format);

      if (result.success && result.filePath) {
        message.success(`导出成功: ${result.filePath}`);
      } else if (result.canceled) {
        message.info('已取消导出');
      } else {
        message.error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  }, [filteredLogs]);

  /**
   * 导出菜单项
   */
  const exportMenuItems = [
    {
      key: 'txt',
      label: '导出为TXT',
      onClick: () => handleExport('txt'),
    },
    {
      key: 'json',
      label: '导出为JSON',
      onClick: () => handleExport('json'),
    },
    {
      key: 'csv',
      label: '导出为CSV',
      onClick: () => handleExport('csv'),
    },
  ];

  /**
   * 渲染空状态
   */
  if (filteredLogs.length === 0 && !isLoading) {
    return (
      <Card className="log-list">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <Text type="secondary">暂无日志数据</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                请先选择日志文件并设置过滤条件
              </Text>
            </Space>
          }
        />
      </Card>
    );
  }

  /**
   * 渲染加载状态
   */
  if (isLoading) {
    return (
      <Card className="log-list">
        <Empty description="正在加载日志..." />
      </Card>
    );
  }

  return (
    <Card
      className="log-list"
      title={`过滤结果 (${filteredLogs.length} 条)`}
      extra={
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExport('txt')}
            disabled={filteredLogs.length === 0}
          >
            导出
          </Button>
          <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
            <Button icon={<FileTextOutlined />} disabled={filteredLogs.length === 0}>
              更多格式
            </Button>
          </Dropdown>
        </Space>
      }
    >
      {/* 虚拟滚动列表 */}
      <List
        className="log-list-container"
        height={500} // 列表高度500px
        itemCount={filteredLogs.length}
        itemSize={getItemHeight()}
        itemData={filteredLogs}
        width="100%"
      >
        {MemoizedLogRow}
      </List>

      {/* 底部统计 */}
      <div className="log-list-footer">
        <Space split={<span>|</span>}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            总计: {filteredLogs.length} 条
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            虚拟滚动: 开启
          </Text>
        </Space>
      </div>
    </Card>
  );
};
