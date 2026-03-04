import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Space, Typography } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BugOutlined,
} from '@ant-design/icons';
import type { LogLevel } from '@types';
import { LOG_LEVEL_CONFIGS } from '@types';
import { useLogStore } from '@store/logStore';
import './LogStatistics.css';

const { Text } = Typography;

/**
 * 等级统计配置
 */
const LEVEL_STATS = [
  { level: 'V' as LogLevel, label: 'Verbose', color: 'default', icon: <BugOutlined /> },
  { level: 'D' as LogLevel, label: 'Debug', color: 'success', icon: <BugOutlined /> },
  { level: 'I' as LogLevel, label: 'Info', color: 'processing', icon: <InfoCircleOutlined /> },
  { level: 'W' as LogLevel, label: 'Warn', color: 'warning', icon: <ExclamationCircleOutlined /> },
  { level: 'E' as LogLevel, label: 'Error', color: 'error', icon: <CloseCircleOutlined /> },
  { level: 'F' as LogLevel, label: 'Fatal', color: 'error', icon: <CloseCircleOutlined /> },
];

/**
 * 日志统计组件
 */
export const LogStatistics: React.FC = () => {
  const { statistics, allLogs, filteredLogs } = useLogStore();

  /**
   * 计算过滤比例
   */
  const filterRatio = useMemo(() => {
    if (allLogs.length === 0) return 0;
    return ((filteredLogs.length / allLogs.length) * 100).toFixed(1);
  }, [allLogs.length, filteredLogs.length]);

  /**
   * 计算各等级日志占比
   */
  const levelPercentages = useMemo(() => {
    const percentages: Record<LogLevel, number> = {
      V: 0,
      D: 0,
      I: 0,
      W: 0,
      E: 0,
      F: 0,
    };

    if (filteredLogs.length > 0) {
      Object.keys(statistics.levelCounts).forEach((level) => {
        const l = level as LogLevel;
        percentages[l] = (statistics.levelCounts[l] / filteredLogs.length) * 100;
      });
    }

    return percentages;
  }, [statistics.levelCounts, filteredLogs.length]);

  return (
    <Card className="log-statistics" title="统计信息" extra={<FileTextOutlined />} size="small">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* 总览统计 */}
        <Row gutter={8}>
          <Col span={8}>
            <Statistic
              title="总数"
              value={allLogs.length}
              valueStyle={{ fontSize: '18px', color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="过滤后"
              value={filteredLogs.length}
              valueStyle={{ fontSize: '18px', color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="占比"
              value={filterRatio}
              suffix="%"
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
        </Row>

        {/* 等级分布 - 紧凑版 */}
        {filteredLogs.length > 0 && (
          <div className="level-statistics">
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: '13px' }}>
              等级分布
            </Text>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {LEVEL_STATS.map(({ level, label, color, icon }) => {
                const count = statistics.levelCounts[level];
                const percentage = levelPercentages[level];

                if (count === 0) return null;

                return (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={color} icon={icon} style={{ margin: 0, minWidth: 70 }}>
                      {label}
                    </Tag>
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      size="small"
                      style={{ flex: 1, margin: 0 }}
                    />
                    <Text style={{ fontSize: '12px', minWidth: 60, textAlign: 'right' }}>
                      {count} ({percentage.toFixed(1)}%)
                    </Text>
                  </div>
                );
              })}
            </Space>
          </div>
        )}

        {/* 过滤提示 */}
        {allLogs.length > 0 && filteredLogs.length === 0 && (
          <div className="filter-effect">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              当前过滤条件下无匹配日志
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};
