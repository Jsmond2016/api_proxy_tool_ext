import { ColumnType } from "antd/es/table"

// 单个列的类型定义，K 是具体的 key
export type TableColumnX<
  T extends Record<string, any>,
  K extends keyof T
> = Omit<ColumnType<T>, "dataIndex" | "render"> & {
  dataIndex?: K
  render?: (text: T[K], record: T, index: number) => React.ReactNode
}

/**
 * 没有 dataIndex 的列（如操作列）
 */
type ColumnWithoutDataIndex<T> = Omit<ColumnType<T>, "dataIndex" | "render"> & {
  dataIndex?: undefined
  render?: (value: unknown, record: T, index: number) => React.ReactNode
}

/**
 * 增强的 Table Columns 类型
 * - 校验 dataIndex 必须是 T 的有效 key
 * - 根据 dataIndex 自动推导 render 第一个参数的类型
 * - 支持没有 dataIndex 的操作列
 *
 * 使用示例：
 * const columns: TableColumnsX<MyType> = [
 *   { dataIndex: 'name', render: (value) => value },  // value 自动推导为 string
 *   { dataIndex: 'age', render: (value) => value },   // value 自动推导为 number
 *   { render: (_, record) => record.name }            // 操作列，无 dataIndex
 * ]
 */
export type TableColumnsX<T extends Record<string, any>> = Array<
  | {
      [K in keyof T]: TableColumnX<T, K>
    }[keyof T]
  | ColumnWithoutDataIndex<T>
>

type AA = {
  a: string
  b: number
  c: boolean
}

const bb: TableColumnsX<AA> = [
  {
    title: "a",
    dataIndex: "a",
    render: (v, r) => v, // v 的类型会被推导为 string
  },
  {
    title: "b",
    dataIndex: "b",
    render: (v, r) => v.toFixed(2), // v 的类型会被推导为 number
  },
  {
    title: "c",
    dataIndex: "c",
    render: (v, r) => (v ? "是" : "否"), // v 的类型会被推导为 boolean
  },
  {
    title: "操作",
    render: (_: unknown, record: AA) => "操作",
  },
]
