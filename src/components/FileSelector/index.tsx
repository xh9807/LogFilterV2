import React, { useCallback, useState } from 'react';
import { Card, Button, Space, List, Tag, Typography, Progress, Tooltip, message } from 'antd';
import { FolderOpenOutlined, FileOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { FileInfo } from '@types';
import { useLogStore } from '@store/logStore';
import './FileSelector.css';

const { Text, Paragraph } = Typography;

/**
 * 文件选择器组件
 */
export const FileSelector: React.FC = () => {
  const {
    selectedFiles,
    setSelectedFiles,
    removeSelectedFile,
    clearSelectedFiles,
    setLoading,
    setError,
  } = useLogStore();

  const [isSelecting, setIsSelecting] = useState(false);

  /**
   * 选择单个文件
   */
  const handleSelectFile = useCallback(async () => {
    if (!window.electronAPI) {
      message.error('Electron API未初始化');
      return;
    }

    try {
      setIsSelecting(true);
      const file = await window.electronAPI.selectFile();
      if (file) {
        if (file.isSkipped) {
          message.warning(`文件 ${file.name} 被跳过: ${file.skipReason}`);
        } else {
          setSelectedFiles([...selectedFiles, file]);
          message.success(`已添加文件: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      setError(error instanceof Error ? error.message : '选择文件失败');
      message.error('选择文件失败');
    } finally {
      setIsSelecting(false);
    }
  }, [selectedFiles, setSelectedFiles, setError]);

  /**
   * 选择多个文件
   */
  const handleSelectMultipleFiles = useCallback(async () => {
    if (!window.electronAPI) {
      message.error('Electron API未初始化');
      return;
    }

    try {
      setIsSelecting(true);
      const files = await window.electronAPI.selectMultipleFiles();
      if (files.length > 0) {
        const skippedFiles = files.filter((f) => f.isSkipped);
        const validFiles = files.filter((f) => !f.isSkipped);

        setSelectedFiles([...selectedFiles, ...files]);

        if (skippedFiles.length > 0) {
          message.warning(
            `已添加 ${validFiles.length} 个文件，跳过 ${skippedFiles.length} 个文件（文件过大）`
          );
        } else {
          message.success(`已添加 ${files.length} 个文件`);
        }
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      setError(error instanceof Error ? error.message : '选择文件失败');
      message.error('选择文件失败');
    } finally {
      setIsSelecting(false);
    }
  }, [selectedFiles, setSelectedFiles, setError]);

  /**
   * 选择文件夹
   */
  const handleSelectFolder = useCallback(async () => {
    if (!window.electronAPI) {
      message.error('Electron API未初始化');
      return;
    }

    try {
      setIsSelecting(true);
      setLoading(true, '正在扫描文件夹...');
      const files = await window.electronAPI.selectFolder();
      setLoading(false);

      if (files.length > 0) {
        const skippedFiles = files.filter((f) => f.isSkipped);
        const validFiles = files.filter((f) => !f.isSkipped);

        setSelectedFiles([...selectedFiles, ...files]);

        if (skippedFiles.length > 0) {
          message.warning(
            `找到 ${files.length} 个文件，添加 ${validFiles.length} 个，跳过 ${skippedFiles.length} 个`
          );
        } else {
          message.success(`已添加 ${files.length} 个文件`);
        }
      } else {
        message.info('未找到支持的日志文件（.txt 或 .json）');
      }
    } catch (error) {
      setLoading(false);
      console.error('选择文件夹失败:', error);
      setError(error instanceof Error ? error.message : '选择文件夹失败');
      message.error('选择文件夹失败');
    } finally {
      setIsSelecting(false);
    }
  }, [selectedFiles, setSelectedFiles, setLoading, setError]);

  /**
   * 删除文件
   */
  const handleRemoveFile = useCallback(
    (filePath: string) => {
      removeSelectedFile(filePath);
      message.success('已移除文件');
    },
    [removeSelectedFile]
  );

  /**
   * 清空所有文件
   */
  const handleClearAll = useCallback(() => {
    clearSelectedFiles();
    message.success('已清空所有文件');
  }, [clearSelectedFiles]);

  // 计算统计信息
  const validFiles = selectedFiles.filter((f) => !f.isSkipped);
  const skippedFiles = selectedFiles.filter((f) => f.isSkipped);
  const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <Card className="file-selector" title="文件选择" extra={<InfoCircleOutlined />}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 操作按钮 */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<FileOutlined />}
            onClick={handleSelectFile}
            loading={isSelecting}
            block
          >
            选择单个文件
          </Button>
          <Button
            icon={<FileOutlined />}
            onClick={handleSelectMultipleFiles}
            loading={isSelecting}
            block
          >
            选择多个文件
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={handleSelectFolder}
            loading={isSelecting}
            block
          >
            选择文件夹
          </Button>
          {selectedFiles.length > 0 && (
            <Button danger onClick={handleClearAll} block>
              清空所有文件
            </Button>
          )}
        </Space>

        {/* 统计信息 */}
        {selectedFiles.length > 0 && (
          <div className="file-statistics">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>
                已选择 {selectedFiles.length} 个文件（共 {totalSizeMB} MB）
              </Text>
              <Space size="middle">
                <Tag color="green">有效: {validFiles.length}</Tag>
                {skippedFiles.length > 0 && <Tag color="orange">跳过: {skippedFiles.length}</Tag>}
              </Space>
            </Space>
          </div>
        )}

        {/* 文件列表 */}
        {selectedFiles.length > 0 && (
          <List
            className="file-list"
            size="small"
            dataSource={selectedFiles}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Tooltip title="移除文件">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(file.path)}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    file.isSkipped ? (
                      <Tag color="orange">跳过</Tag>
                    ) : (
                      <Tag color="green">{file.format.toUpperCase()}</Tag>
                    )
                  }
                  title={
                    <Space>
                      <Text>{file.name}</Text>
                      {file.isSkipped && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ({file.skipReason})
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <Space>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {file.sizeMB} MB
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {file.path}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {/* 提示信息 */}
        {selectedFiles.length === 0 && (
          <div className="empty-state">
            <Paragraph type="secondary">
              请选择日志文件（.txt 或 .json 格式）
            </Paragraph>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              支持最大 100MB 的单个文件
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};
