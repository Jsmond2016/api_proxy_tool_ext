import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, message } from 'antd';
import { ApiConfig } from '../../../types';
import { isValidUrl, isValidPath, generateId } from '../../../utils/chromeApi';

interface AddApiFormProps {
  onOk: (apiData: Omit<ApiConfig, 'id'>) => void;
  onCancel: () => void;
}

export default function AddApiForm({ onOk, onCancel }: AddApiFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
        apiKey: values.apiKey || '',
        apiName: values.apiName || '',
        apiUrl: values.apiUrl || '',
        redirectURL: values.redirectURL || '',
        method: values.method || 'GET',
        filterType: values.filterType || 'contains',
        delay: values.delay || 0,
        isOpen: values.isOpen || false,
        mockWay: values.mockWay || 'redirect',
        statusCode: values.statusCode || 200,
        arrDepth: 4,
        arrLength: 3,
        mockResponseData: '',
        requestBody: '',
        requestHeaders: ''
      };

      onOk(apiData);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        method: 'GET',
        filterType: 'contains',
        delay: 0,
        isOpen: false,
        mockWay: 'redirect',
        statusCode: 200
      }}
    >
      <Form.Item
        label="接口名称"
        name="apiName"
        rules={[{ required: true, message: '请输入接口名称' }]}
      >
        <Input placeholder="请输入接口名称" />
      </Form.Item>

      <Form.Item
        label="接口地址"
        name="apiUrl"
        rules={[{ required: true, message: '请输入接口地址' }]}
      >
        <Input placeholder="请输入接口地址，如：/api/users 或 http://localhost:3000/api/users" />
      </Form.Item>

      <Form.Item
        label="重定向URL"
        name="redirectURL"
        rules={[{ required: true, message: '请输入重定向URL' }]}
      >
        <Input placeholder="请输入Mock URL，如：http://127.0.0.1:4523/mock/api/users" />
      </Form.Item>

      <Form.Item
        label="请求方式"
        name="method"
        rules={[{ required: true, message: '请选择请求方式' }]}
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
        rules={[{ required: true, message: '请选择匹配方式' }]}
      >
        <Select>
          <Select.Option value="contains">包含</Select.Option>
          <Select.Option value="exact">精确匹配</Select.Option>
          <Select.Option value="regex">正则表达式</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="延迟时间(毫秒)"
        name="delay"
      >
        <InputNumber min={0} max={10000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="状态码"
        name="statusCode"
      >
        <InputNumber min={100} max={599} style={{ width: '100%' }} />
      </Form.Item>


      <div className="flex justify-end space-x-2 pt-4">
        <Button onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>
      </div>
    </Form>
  );
}
