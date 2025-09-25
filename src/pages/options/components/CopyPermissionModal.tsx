import React, { useState } from 'react';
import { Modal, Input, Button, message, Space } from 'antd';
import { PermissionPoint } from '@src/types/permission';
import { copyToClipboard } from '@src/utils/permissionUtils';

interface CopyPermissionModalProps {
  visible: boolean;
  onCancel: () => void;
  permissionPoints: PermissionPoint[];
  title?: string;
}

const CopyPermissionModal: React.FC<CopyPermissionModalProps> = ({
  visible,
  onCancel,
  permissionPoints,
  title = '复制权限点'
}) => {
  const [parentAuthPointKey, setParentAuthPointKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!parentAuthPointKey.trim()) {
      message.warning('请输入父级模块名字');
      return;
    }

    setLoading(true);
    try {
      // 更新权限点的父级模块名字
      const updatedPermissionPoints = permissionPoints.map(point => ({
        ...point,
        parentAuthPointKey: parentAuthPointKey.trim()
      }));

      // 生成JSON字符串
      const jsonString = JSON.stringify(updatedPermissionPoints, null, 2);
      
      // 复制到剪贴板
      const success = await copyToClipboard(jsonString);
      
      if (success) {
        message.success(`成功复制 ${permissionPoints.length} 个权限点`);
        onCancel();
        setParentAuthPointKey('');
      } else {
        message.error('复制失败，请重试');
      }
    } catch (error) {
      console.error('复制权限点失败:', error);
      message.error('复制失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setParentAuthPointKey('');
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="copy"
          type="primary"
          loading={loading}
          onClick={handleCopy}
        >
          复制权限点
        </Button>
      ]}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            父级模块名字：
          </label>
          <Input
            placeholder="请输入父级模块名字，如：GEN_PAGE_TODO_请填写父节点-authPointKey"
            value={parentAuthPointKey}
            onChange={(e) => setParentAuthPointKey(e.target.value)}
            onPressEnter={handleCopy}
          />
        </div>
        
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            将生成 {permissionPoints.length} 个权限点：
          </div>
          <div style={{ 
            maxHeight: 200, 
            overflowY: 'auto', 
            padding: 12, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 6,
            fontSize: 12
          }}>
            {permissionPoints.map((point, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <span style={{ color: '#666' }}>{point.authPointKey}:</span>
                <span style={{ marginLeft: 8 }}>{point.authPointName}</span>
              </div>
            ))}
          </div>
        </div>
      </Space>
    </Modal>
  );
};

export default CopyPermissionModal;
