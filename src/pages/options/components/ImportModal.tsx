import React, { useState } from 'react';
import { Modal, Upload, Button, message, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ImportModuleData } from '../../../utils/dataProcessor';

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: ImportModuleData[]) => void;
}

export default function ImportModal({ visible, onCancel, onOk }: ImportModalProps) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [importData, setImportData] = useState<ImportModuleData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info: any) => {
    setFileList(info.fileList);
    // 文件处理逻辑已移到 beforeUpload 中
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
      // 直接处理文件，不阻止上传
      handleFileProcessing(file);
      return false; // 阻止实际上传
    }
  };

  const handleFileProcessing = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          console.log('文件内容:', content);
          const data = JSON.parse(content);
          console.log('解析后的数据:', data);
          
          // 验证数据格式
          if (Array.isArray(data) && data.length > 0) {
            const isValid = data.every(item => 
              item.apiDocKey && 
              item.label && 
              Array.isArray(item.apiArr)
            );
            
            console.log('数据验证结果:', isValid);
            
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
          console.error('文件解析失败:', error);
          message.error(`文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
          setImportData([]);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('文件读取失败:', error);
      message.error('文件读取失败');
      setImportData([]);
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
