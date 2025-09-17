import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, message } from 'antd';
import { ApiConfig } from '../../../types';
import { isValidUrl, isValidPath, generateId } from '../../../utils/chromeApi';

interface AddApiModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (apiData: Omit<ApiConfig, 'id'>) => void;
}

export default function AddApiModal({ visible, onCancel, onOk }: AddApiModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 验证URL格式
      if (values.apiUrl && !isValidUrl(values.apiUrl) && !isValidPath(values.apiUrl)) {
        message.error('请输入有效的URL或路径');
        return;
      }
      
      if (values.redirectURL && !isValidUrl(values.redirectURL)) {
        message.error('请输入有效的重定向URL');
        return;
      }

      const apiData: Omit<ApiConfig, 'id'> = {
        apiKey: values.apiUrl || '',
        apiName: values.apiName || '',
        apiUrl: values.apiUrl || '',
        redirectURL: values.redirectURL || '',
        method: values.method || 'GET',
        filterType: values.filterType || 'contains',
        delay: values.delay || 0,
        isOpen: true,
        mockWay: 'redirect',
        statusCode: 200,
        arrDepth: 4,
        arrLength: 3
      };

      onOk(apiData);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="添加-Redirect Request"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          method: 'GET',
          filterType: 'contains',
          delay: 0
        }}
      >
        <Form.Item
          label="接口地址"
          name="apiUrl"
          rules={[
            { required: true, message: '请输入接口地址' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (isValidUrl(value) || isValidPath(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请输入有效的URL或路径'));
              }
            }
          ]}
        >
          <Input placeholder="请输入接口地址" />
        </Form.Item>

        <Form.Item
          label="redirect地址"
          name="redirectURL"
          rules={[
            { required: true, message: '请输入重定向地址' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (isValidUrl(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请输入有效的URL'));
              }
            }
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item
          label="接口名称"
          name="apiName"
          rules={[{ required: true, message: '请输入接口名称' }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>

        <Space.Compact className="w-full">
          <Form.Item
            label="请求方式"
            name="method"
            className="w-1/3"
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="匹配方式"
            name="filterType"
            className="w-1/3"
          >
            <Select>
              <Select.Option value="contains">contains</Select.Option>
              <Select.Option value="exact">exact</Select.Option>
              <Select.Option value="regex">regex</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="延迟时间(ms)"
            name="delay"
            className="w-1/3"
          >
            <InputNumber
              min={0}
              max={30000}
              step={100}
              className="w-full"
            />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  );
}
