/**
 * 模型操作相关常量
 * 定义 CRUD 操作类型和映射关系
 */

/**
 * 模型操作类型
 */
export const ModelAction = {
  LIST: "atom-列表",
  CREATE: "atom-新增",
  UPDATE: "atom-修改",
  QUERY_ONE: "atom-获取详情",
  QUERY_ONE_ORIGIN: "atom-获取详情-origin",
  UPDATE_STATUS: "atom-更新状态-单条",
  DELETE_ONE: "atom-删除-单条",
  DELETE_MANY: "atom-删除-多条",
  // REMOVE_ONE: '移除-单条',
  // REMOVE_MANY: '移除-多条',
  CUSTOM: "atom-自定义",
} as const

/**
 * 模型-接口名-映射
 */
export const ModelNamesMap = {
  [ModelAction.LIST]: "queryList",
  [ModelAction.CREATE]: "create",
  [ModelAction.UPDATE]: "updateOne",
  [ModelAction.QUERY_ONE]: "queryOne",
  [ModelAction.QUERY_ONE_ORIGIN]: "queryOneOrigin",
  [ModelAction.UPDATE_STATUS]: "updateStatus",
  [ModelAction.DELETE_ONE]: "deleteOne",
  [ModelAction.DELETE_MANY]: "deleteList",
  // [ModelAction.REMOVE_ONE]: 'removeOne',
  // [ModelAction.REMOVE_MANY]: 'removeMany',
  [ModelAction.CUSTOM]: "custom",
} as const

export type ModelApiActionType = (typeof ModelAction)[keyof typeof ModelAction]
