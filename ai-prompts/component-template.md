# 组件开发模板

当需要创建新的 React 组件时，请遵循以下模板：

```tsx
import React from 'react';
import { Button, Card } from 'antd';

interface ComponentProps {
  // 定义组件属性类型
  title?: string;
  onAction?: () => void;
}

const ComponentName: React.FC<ComponentProps> = ({
  title = '默认标题',
  onAction
}) => {
  // 组件逻辑

  const handleClick = () => {
    onAction?.();
  };

  return (
    <Card title={title}>
      {/* 使用 Ant Design 组件 */}
      <Button type="primary" onClick={handleClick}>
        按钮
      </Button>
    </Card>
  );
};

export default ComponentName;
```

## 开发规范
- 使用 TypeScript 接口定义 props
- 优先使用 Ant Design 组件
- 使用函数式组件和 Hooks
- 保持组件单一职责
- 事件处理函数使用 "handle" 前缀
- 使用早期返回提高可读性
