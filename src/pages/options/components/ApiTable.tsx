import React from 'react';
import { Table, Switch, Button, Space, Tag, Tooltip } from 'antd';
import { 
  EditOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  DragOutlined,
  CopyOutlined as CopyIcon
} from '@ant-design/icons';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { ApiConfig } from '../../../types';
import { formatDelay } from '../../../utils/chromeApi';
import '../../../assets/styles/tailwind.css';

interface ApiTableProps {
  apis: ApiConfig[];
  searchKeyword: string;
  onToggleApi: (apiId: string, enabled: boolean) => void;
  onToggleAllApis: (enabled: boolean) => void;
  onDeleteApi: (apiId: string) => void;
  onEditApi: (apiId: string) => void;
  onCloneApi: (apiId: string) => void;
  onSortEnd: (oldIndex: number, newIndex: number) => void;
}

export default function ApiTable({
  apis,
  searchKeyword,
  onToggleApi,
  onToggleAllApis,
  onDeleteApi,
  onEditApi,
  onCloneApi,
  onSortEnd
}: ApiTableProps) {
  // 过滤API数据
  const filteredApis = apis.filter(api => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      api.apiName.toLowerCase().includes(keyword) ||
      api.apiUrl.toLowerCase().includes(keyword) ||
      api.redirectURL.toLowerCase().includes(keyword)
    );
  });

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 检查是否所有API都已开启
  const allApisEnabled = filteredApis.length > 0 && filteredApis.every(api => api.isOpen);
  const someApisEnabled = filteredApis.some(api => api.isOpen);

  // 拖拽手柄组件
  const DragHandle = SortableHandle(() => (
    <DragOutlined className="text-gray-400 cursor-move" />
  ));

  // 可排序的表格行组件
  const SortableItem = SortableElement((props: any) => <tr {...props} />);

  // 可排序的表格容器组件
  const SortableBody = SortableContainer((props: any) => <tbody {...props} />);

  const columns = [
    {
      title: (
        <Switch
          checked={allApisEnabled}
          indeterminate={someApisEnabled && !allApisEnabled}
          onChange={onToggleAllApis}
          size="small"
        />
      ),
      key: 'toggleAll',
      width: 60,
      align: 'center' as const,
      render: () => null
    },
    {
      title: '',
      key: 'drag',
      width: 30,
      render: () => <DragHandle />
    },
    {
      title: 'Mock 方式',
      key: 'mock',
      width: 120,
      render: (_, record: ApiConfig) => (
        <div className="flex flex-col space-y-2">
          <Switch
            checked={record.isOpen}
            onChange={(checked) => onToggleApi(record.id, checked)}
            size="small"
          />
          <Button
            type="primary"
            size="small"
            className="text-xs px-2 h-6"
            style={{ 
              backgroundColor: record.mockWay === 'redirect' ? '#722ed1' : '#1890ff',
              borderColor: record.mockWay === 'redirect' ? '#722ed1' : '#1890ff'
            }}
          >
            Redirect Request
          </Button>
        </div>
      )
    },
    {
      title: '请求方式',
      key: 'method',
      width: 80,
      render: (_, record: ApiConfig) => (
        <Tag color={getMethodColor(record.method)}>
          {record.method.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '接口名称',
      key: 'apiName',
      render: (_, record: ApiConfig) => (
        <div className="font-medium">{record.apiName}</div>
      )
    },
    {
      title: '接口地址',
      key: 'apiUrl',
      render: (_, record: ApiConfig) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <span className="text-blue-600 text-sm font-mono">{record.apiUrl}</span>
            <CopyIcon
              className="text-gray-400 cursor-pointer hover:text-blue-500 text-xs"
              onClick={() => copyToClipboard(record.apiUrl)}
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-red-600 text-sm font-mono">{record.redirectURL}</span>
            <CopyIcon
              className="text-gray-400 cursor-pointer hover:text-red-500 text-xs"
              onClick={() => copyToClipboard(record.redirectURL)}
            />
            <span className="text-green-500 text-xs ml-1">▼</span>
          </div>
        </div>
      )
    },
    {
      title: '匹配方式',
      key: 'filterType',
      width: 100,
      render: (_, record: ApiConfig) => (
        <Tag color="blue">{record.filterType}</Tag>
      )
    },
    {
      title: '延迟时间',
      key: 'delay',
      width: 100,
      render: (_, record: ApiConfig) => (
        <span className="text-sm">{formatDelay(record.delay)}</span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record: ApiConfig) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditApi(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => onCloneApi(record.id)}
          >
            克隆
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeleteApi(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Table
      dataSource={filteredApis}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={false}
      scroll={{ y: 400 }}
      className="api-table"
      components={{
        body: {
          wrapper: (props: any) => (
            <SortableBody
              useDragHandle
              disableAutoscroll
              helperClass="row-dragging"
              onSortEnd={({ oldIndex, newIndex }) => onSortEnd(oldIndex, newIndex)}
              {...props}
            />
          ),
          row: (props: any) => {
            const index = filteredApis.findIndex((item) => item.id === props['data-row-key']);
            return <SortableItem index={index} {...props} />;
          },
        },
      }}
    />
  );
}

// 获取请求方法对应的颜色
function getMethodColor(method: string): string {
  const colors: { [key: string]: string } = {
    'GET': 'green',
    'POST': 'blue',
    'PUT': 'orange',
    'DELETE': 'red',
    'PATCH': 'purple'
  };
  return colors[method.toUpperCase()] || 'default';
}
