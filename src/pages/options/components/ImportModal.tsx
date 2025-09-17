import React, { useState } from 'react';
import { Modal, Upload, Button, message, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ImportExportFormat } from '../../../types';

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: ImportExportFormat[]) => void;
}

export default function ImportModal({ visible, onCancel, onOk }: ImportModalProps) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [importData, setImportData] = useState<ImportExportFormat[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info: any) => {
    setFileList(info.fileList);
    
    if (info.file.status === 'done' || info.file.status === 'success') {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            
            // 验证数据格式
            if (Array.isArray(data) && data.length > 0) {
              const isValid = data.every(item => 
                item.apiDocKey && 
                item.label && 
                Array.isArray(item.apiArr)
              );
              
              if (isValid) {
                setImportData(data);
                message.success('文件解析成功');
              } else {
                message.error('文件格式不正确');
                setImportData([]);
              }
            } else {
              message.error('文件格式不正确');
              setImportData([]);
            }
          } catch (error) {
            message.error('文件解析失败');
            setImportData([]);
          }
        };
        reader.readAsText(info.file.originFileObj);
      } catch (error) {
        message.error('文件读取失败');
        setImportData([]);
      }
    }
  };

  const handleOk = () => {
    if (importData.length === 0) {
      message.error('请先选择有效的配置文件');
      return;
    }
    
    setLoading(true);
    try {
      onOk(importData);
      message.success('导入成功');
      handleCancel();
    } catch (error) {
      message.error('导入失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setImportData([]);
    onCancel();
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    fileList,
    onChange: handleFileChange,
    beforeUpload: (file: File) => {
      const isJson = file.type === 'application/json' || file.name.endsWith('.json');
      if (!isJson) {
        message.error('只能上传JSON文件');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
        return false;
      }
      return false; // 阻止自动上传
    }
  };

  return (
    <Modal
      title="导入配置"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
      width={600}
    >
      <div className="space-y-4">
        <Alert
          message="导入说明"
          description="请选择符合格式要求的JSON配置文件。文件应包含模块和API配置信息。"
          type="info"
          showIcon
        />
        
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个JSON文件上传，文件大小不超过10MB
          </p>
        </Upload.Dragger>

        {importData.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">预览数据：</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p>模块数量: {importData.length}</p>
              <p>API总数: {importData.reduce((total, module) => total + module.apiArr.length, 0)}</p>
              <div className="mt-2">
                {importData.map((module, index) => (
                  <div key={index} className="text-gray-600">
                    • {module.label}: {module.apiArr.length} 个API
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
