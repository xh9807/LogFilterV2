import React, { useState, useMemo, useCallback } from 'react';
import { Card, Input, Select, Switch, Space, Button, Tag, Typography, Divider } from 'antd';
import { SearchOutlined, ClearOutlined, TagOutlined } from '@ant-design/icons';
import { useLogStore } from '@store/logStore';
import { useLogProcessor } from '@hooks/useLogProcessor';
import './SearchBar.css';

const { Text } = Typography;

/**
 * 搜索栏组件
 * 支持关键词搜索、Tag过滤和正则表达式
 */
export const SearchBar: React.FC = () => {
  const { allLogs, filterConfig, updateFilterConfig, filteredLogs } = useLogStore();
  const { applySearchFilter } = useLogProcessor();

  const [keyword, setKeyword] = useState(filterConfig.keyword || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(filterConfig.tags || []);
  const [useRegex, setUseRegex] = useState(filterConfig.useRegex || false);

  /**
   * 提取所有唯一的 Tag
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allLogs.forEach((log) => {
      tagSet.add(log.tag);
    });
    return Array.from(tagSet).sort();
  }, [allLogs]);

  /**
   * Tag 选项
   */
  const tagOptions = useMemo(() => {
    return allTags.map((tag) => ({
      label: tag,
      value: tag,
    }));
  }, [allTags]);

  /**
   * 应用搜索
   */
  const handleApplySearch = useCallback(() => {
    // 更新 filterConfig
    updateFilterConfig({
      keyword: keyword.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      useRegex,
    });

    // 应用搜索过滤
    applySearchFilter(keyword.trim() || undefined, selectedTags.length > 0 ? selectedTags : undefined, useRegex);
  }, [keyword, selectedTags, useRegex, updateFilterConfig, applySearchFilter]);

  /**
   * 清空搜索
   */
  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setSelectedTags([]);
    setUseRegex(false);
    updateFilterConfig({
      keyword: undefined,
      tags: undefined,
      useRegex: undefined,
    });

    // 重新加载所有日志
    const { setFilteredLogs } = useLogStore.getState();
    setFilteredLogs(allLogs);
  }, [updateFilterConfig, allLogs]);

  /**
   * 获取搜索结果统计
   */
  const searchStats = useMemo(() => {
    const hasKeyword = !!(keyword?.trim());
    const hasTags = selectedTags.length > 0;

    return {
      hasKeyword,
      hasTags,
      filterActive: hasKeyword || hasTags,
      matchCount: filteredLogs.length,
      totalCount: allLogs.length,
    };
  }, [keyword, selectedTags, filteredLogs.length, allLogs.length]);

  return (
    <Card className="search-bar" title="搜索过滤" extra={<SearchOutlined />} size="small">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 关键词搜索 */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <Text strong>关键词搜索:</Text>
          </div>
          <Input
            placeholder="搜索日志内容或Tag"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleApplySearch}
            allowClear
            size="small"
          />
        </div>

        {/* Tag 过滤 */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Tag过滤:</Text>
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
              ({allTags.length} 个可用)
            </Text>
          </div>
          <Select
            mode="multiple"
            placeholder="选择Tag"
            value={selectedTags}
            onChange={setSelectedTags}
            options={tagOptions}
            style={{ width: '100%' }}
            size="small"
            maxTagCount="responsive"
            allowClear
          />
        </div>

        {/* 正则表达式开关 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>正则表达式:</Text>
          <Switch
            size="small"
            checked={useRegex}
            onChange={setUseRegex}
            disabled={!keyword?.trim()}
          />
        </div>

        {/* 提示信息 */}
        <div className="search-hint" style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 可单独或组合使用关键词与Tag过滤
          </Text>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* 操作按钮 */}
        <Space style={{ width: '100%' }} direction="vertical">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleApplySearch}
            block
          >
            应用搜索
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearSearch}
            block
            disabled={!searchStats.filterActive}
          >
            清空搜索
          </Button>
        </Space>

        {/* 搜索结果统计 */}
        {searchStats.filterActive && (
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '13px' }}>
                搜索结果: {searchStats.matchCount} / {searchStats.totalCount} 条
              </Text>
              {searchStats.hasKeyword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>关键词:</Text>
                  <Tag color="blue" style={{ fontSize: '12px' }}>
                    "{keyword}"
                  </Tag>
                </div>
              )}
              {searchStats.hasTags && (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tag:</Text>
                  {selectedTags.slice(0, 3).map((tag) => (
                    <Tag key={tag} color="green" style={{ fontSize: '12px' }}>
                      {tag}
                    </Tag>
                  ))}
                  {selectedTags.length > 3 && (
                    <Tag color="green" style={{ fontSize: '12px' }}>
                      +{selectedTags.length - 3}
                    </Tag>
                  )}
                </div>
              )}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};
