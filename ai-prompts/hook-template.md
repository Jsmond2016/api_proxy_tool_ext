# Hook 开发模板

当需要创建自定义 Hook 时，请遵循以下模板：

```tsx
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

interface UseCustomHookOptions {
  // 定义 Hook 选项类型
  initialValue?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const useCustomHook = (options: UseCustomHookOptions = {}) => {
  const { initialValue = '', onSuccess, onError } = options;

  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 执行异步操作
      const result = await someAsyncOperation();

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useCustomHook;
```

## Hook 开发规范
- 使用 TypeScript 定义参数和返回值类型
- 合理使用 useCallback 和 useMemo 优化性能
- 提供清晰的错误处理机制
- 使用 Ant Design 的 message 组件显示提示
- 保持 Hook 的单一职责
- 提供 refetch 等重置方法
