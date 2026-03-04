import React from 'react';
import { Card, Space, Row, Col, Select, Button, Typography } from 'antd';
import { ClockCircleOutlined, ClearOutlined } from '@ant-design/icons';
import type { LogTime } from '@types';
import { useLogStore } from '@store/logStore';
import './TimePicker.css';

const { Text } = Typography;

/**
 * 生成月份选项
 */
const generateMonths = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${String(i + 1).padStart(2, '0')}月`,
    value: i + 1,
  }));
};

/**
 * 生成日期选项
 */
const generateDays = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    label: `${String(i + 1).padStart(2, '0')}日`,
    value: i + 1,
  }));
};

/**
 * 生成小时选项
 */
const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}时`,
    value: i,
  }));
};

/**
 * 生成分钟选项
 */
const generateMinutes = () => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}分`,
    value: i,
  }));
};

/**
 * 生成秒选项
 */
const generateSeconds = () => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}秒`,
    value: i,
  }));
};

const months = generateMonths();
const days = generateDays();
const hours = generateHours();
const minutes = generateMinutes();
const seconds = generateSeconds();

/**
 * 时间选择器组件
 */
export const TimePicker: React.FC = () => {
  const { filterConfig, updateFilterConfig } = useLogStore();

  const startTime = filterConfig.startTime;
  const endTime = filterConfig.endTime;

  /**
   * 更新起始时间
   */
  const handleUpdateStartTime = (field: keyof LogTime, value: number) => {
    const newTime: LogTime = {
      month: startTime?.month || 1,
      day: startTime?.day || 1,
      hours: startTime?.hours || 0,
      minutes: startTime?.minutes || 0,
      seconds: startTime?.seconds || 0,
      milliseconds: startTime?.milliseconds || 0,
      [field]: value,
    };

    updateFilterConfig({ startTime: newTime });
  };

  /**
   * 更新结束时间
   */
  const handleUpdateEndTime = (field: keyof LogTime, value: number) => {
    const newTime: LogTime = {
      month: endTime?.month || 1,
      day: endTime?.day || 1,
      hours: endTime?.hours || 23,
      minutes: endTime?.minutes || 59,
      seconds: endTime?.seconds || 59,
      milliseconds: endTime?.milliseconds || 999,
      [field]: value,
    };

    updateFilterConfig({ endTime: newTime });
  };

  /**
   * 清空起始时间
   */
  const handleClearStartTime = () => {
    updateFilterConfig({ startTime: undefined });
  };

  /**
   * 清空结束时间
   */
  const handleClearEndTime = () => {
    updateFilterConfig({ endTime: undefined });
  };

  /**
   * 设置为当前时间
   */
  const handleSetCurrentTime = () => {
    const now = new Date();
    const currentTime: LogTime = {
      month: now.getMonth() + 1,
      day: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
    };

    updateFilterConfig({ startTime: currentTime });
  };

  /**
   * 格式化时间显示
   */
  const formatTimeDisplay = (time?: LogTime): string => {
    if (!time) return '未设置';

    const month = String(time.month).padStart(2, '0');
    const day = String(time.day).padStart(2, '0');
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = String(time.seconds).padStart(2, '0');

    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <Card className="time-picker" title="时间过滤" extra={<ClockCircleOutlined />}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 起始时间 */}
        <div className="time-section">
          <div style={{ marginBottom: 8 }}>
            <Text strong>起始时间:</Text>
            {startTime && (
              <Button size="small" type="link" danger onClick={handleClearStartTime} style={{ padding: 0, marginLeft: 8 }}>
                清空
              </Button>
            )}
          </div>
          <Row gutter={[8, 8]} align="middle">
            <Col span={5}>
              <Select
                placeholder="月"
                value={startTime?.month}
                onChange={(value) => handleUpdateStartTime('month', value)}
                options={months}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="日"
                value={startTime?.day}
                onChange={(value) => handleUpdateStartTime('day', value)}
                options={days}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={1}>
              <Text type="secondary">-</Text>
            </Col>
            <Col span={5}>
              <Select
                placeholder="时"
                value={startTime?.hours}
                onChange={(value) => handleUpdateStartTime('hours', value)}
                options={hours}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="分"
                value={startTime?.minutes}
                onChange={(value) => handleUpdateStartTime('minutes', value)}
                options={minutes}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={3}>
              <Button size="small" type="link" onClick={handleSetCurrentTime} style={{ padding: 0 }}>
                当前
              </Button>
            </Col>
          </Row>

          {/* 时间预览 */}
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTimeDisplay(startTime)}
            </Text>
          </div>
        </div>

        {/* 结束时间 */}
        <div className="time-section">
          <div style={{ marginBottom: 8 }}>
            <Text strong>结束时间:</Text>
            {endTime && (
              <Button size="small" type="link" danger onClick={handleClearEndTime} style={{ padding: 0, marginLeft: 8 }}>
                清空
              </Button>
            )}
          </div>
          <Row gutter={[8, 8]} align="middle">
            <Col span={5}>
              <Select
                placeholder="月"
                value={endTime?.month}
                onChange={(value) => handleUpdateEndTime('month', value)}
                options={months}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="日"
                value={endTime?.day}
                onChange={(value) => handleUpdateEndTime('day', value)}
                options={days}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={1}>
              <Text type="secondary">-</Text>
            </Col>
            <Col span={5}>
              <Select
                placeholder="时"
                value={endTime?.hours}
                onChange={(value) => handleUpdateEndTime('hours', value)}
                options={hours}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="分"
                value={endTime?.minutes}
                onChange={(value) => handleUpdateEndTime('minutes', value)}
                options={minutes}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col span={3}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                可选
              </Text>
            </Col>
          </Row>

          {/* 时间预览 */}
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTimeDisplay(endTime)}
            </Text>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="time-hint">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 只显示起始时间到结束时间之间的日志
          </Text>
        </div>
      </Space>
    </Card>
  );
};
