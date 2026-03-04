import React, { useState, useCallback } from 'react';
import { Modal, Descriptions, Tag, Button, Space, Typography, message } from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import type { LogEntry, LogLevel, LOG_LEVEL_CONFIGS } from '@types';

const { Paragraph, Text } = Typography;

interface LogDetailDialogProps {
  log: LogEntry | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * 日志详情弹窗组件
 */
export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, visible, onClose }) => {
  const [copied, setCopied] = useState(false);

  /**
   * 复制格式化的日志内容
   */
  const handleCopy = useCallback(() => {
    if (!log) return;

    const formatted = `[${log.timestamp}] [${log.level}] [${log.tag}] ${log.content}`;

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [log]);

  /**
   * 复制原始日志
   */
  const handleCopyRaw = useCallback(() => {
    if (!log) return;

    navigator.clipboard.writeText(log.rawLine).then(() => {
      message.success('已复制原始日志');
    });
  }, [log]);

  /**
   * 获取日志等级配置
   */
  const getLevelConfig = (level: LogLevel) => {
    const configs: Record<LogLevel, any> = {
      V: { label: 'Verbose', color: 'default', icon: 'V' },
      D: { label: 'Debug', color: 'success', icon: 'D' },
      I: { label: 'Info', color: 'processing', icon: 'I' },
      W: { label: 'Warn', color: 'warning', icon: 'W' },
      E: { label: 'Error', color: 'error', icon: 'E' },
      F: { label: 'Fatal', color: 'error', icon: 'F' },
    };
    return configs[level];
  };

  if (!log) return null;

  const levelConfig = getLevelConfig(log.level);

  return (
    <Modal
      title="日志详情"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          关闭
        </Button>,
        <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </Button>,
        <Button key="copyRaw" onClick={handleCopyRaw}>
          复制原始日志
        </Button>,
      ]}
    >
      <Descriptions column={1} bordered size="small">
        {/* 时间戳 */}
        <Descriptions.Item label="时间戳">
          <Text code style={{ fontSize: '14px' }}>
            {log.timestamp}
          </Text>
        </Descriptions.Item>

        {/* 日志等级 */}
        <Descriptions.Item label="日志等级">
          <Tag color={levelConfig.color}>{levelConfig.label}</Tag>
        </Descriptions.Item>

        {/* 进程信息 */}
        <Descriptions.Item label="进程/线程">
          <Space>
            <Text>PID: </Text>
            <Text code>{log.pid}</Text>
            <Text>TID: </Text>
            <Text code>{log.tid}</Text>
          </Space>
        </Descriptions.Item>

        {/* Tag */}
        <Descriptions.Item label="标签">
          <Paragraph
            code
            style={{ margin: 0, fontSize: '13px', maxWidth: 600 }}
            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          >
            {log.tag}
          </Paragraph>
        </Descriptions.Item>

        {/* 日志内容 */}
        <Descriptions.Item label="日志内容">
          <Paragraph
            code
            style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}
            copyable
          >
            {log.content}
          </Paragraph>
        </Descriptions.Item>

        {/* 源文件 */}
        <Descriptions.Item label="来源文件">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {log.sourceFile}
          </Text>
        </Descriptions.Item>

        {/* 行号 */}
        <Descriptions.Item label="行号">
          <Text>{log.lineNumber}</Text>
        </Descriptions.Item>

        {/* 原始日志 */}
        <Descriptions.Item label="原始日志">
          <Paragraph
            code
            style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {log.rawLine}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

/**
 * Hook: 使用日志详情弹窗
 */
export const useLogDetailDialog = () => {
  const [visible, setVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const show = useCallback((log: LogEntry) => {
    setSelectedLog(log);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    selectedLog,
    show,
    hide,
  };
};
