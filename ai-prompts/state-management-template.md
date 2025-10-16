# 状态管理模板

当需要使用 Zustand 进行状态管理时，请遵循以下模板：

```typescript
// src/store/useExampleStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ExampleState {
  // 状态定义
  data: any[];
  loading: boolean;
  error: string | null;

  // 操作方法
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchData: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const useExampleStore = create<ExampleState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setData: (data) => set({ data }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      fetchData: async () => {
        set({ loading: true, error: null });

        try {
          // 执行异步操作
          const result = await someAsyncOperation();
          set({ data: result, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false
          });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'example-store', // DevTools 中显示的名称
    }
  )
);
```

## 状态管理规范
- 使用 TypeScript 定义状态和操作类型
- 使用 devtools 中间件便于调试
- 提供清晰的错误处理机制
- 保持状态的不可变性
- 合理拆分 store，避免单个 store 过于庞大
- 使用 immer 中间件处理复杂状态更新（可选）
