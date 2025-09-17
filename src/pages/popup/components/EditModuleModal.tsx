import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

interface EditModuleModalProps {
  visible: boolean;
  moduleName: string;
  onCancel: () => void;
  onOk: (newName: string) => void;
}

export default function EditModuleModal({ 
  visible, 
  moduleName, 
  onCancel, 
  onOk 
}: EditModuleModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ name: moduleName });
    }
  }, [visible, moduleName, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onOk(values.name);
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
      title="编辑模块名称"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: moduleName }}
      >
        <Form.Item
          label="模块名称"
          name="name"
          rules={[
            { required: true, message: '请输入模块名称' },
            { min: 1, max: 50, message: '模块名称长度应在1-50个字符之间' }
          ]}
        >
          <Input placeholder="请输入模块名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
