/**
 * Apifox Swagger Schema 自定义字段常量
 *
 * 这些字段是从 Apifox 导出的 Swagger/OpenAPI 文档中的自定义扩展字段（x- 开头）
 * 用于接口分组、状态管理、权限点生成等功能
 */

/**
 * Apifox 运行链接字段
 * 用于提取接口的唯一标识符（apiId）
 *
 * 示例值: "https://apifox.com/web/project/123456789/apis/api-102913012-run"
 * 提取规则: 从 URL 最后一段中提取 "-" 分隔的第二部分作为 apiId
 */
export const APIFOX_FIELD_RUN_IN_APIFOX = "x-run-in-apifox" as const

/**
 * Apifox 接口状态字段
 * 用于标识接口在 Apifox 平台中的状态，支持按状态筛选接口
 *
 * 可选值:
 * - "developing" - 开发中（默认）
 * - "testing" - 测试中
 * - "released" - 已发布
 * - "deprecated" - 将废弃
 * - "obsolete" - 已废弃
 */
export const APIFOX_FIELD_STATUS = "x-apifox-status" as const

/**
 * Apifox 分组名/命名空间字段
 * 用于模块分组和权限点生成的基础字段
 *
 * 格式要求:
 * - 必须为英文 a.b.c 形式（如: "demo.user.management"）
 * - 只能包含小写字母、大写字母和点号（.）
 * - 不能包含数字、中文和其他特殊字符
 *
 * 用途:
 * 1. 作为模块的 label 和 apiDocKey
 * 2. 作为权限点 key 的前缀部分
 *
 * 如果缺失，会使用 tags[0] 或 "默认分组" 作为备用值
 */
export const APIFOX_FIELD_GROUP_NAME =
  "x-apifox-fe-general-model-base-action-type" as const

/**
 * Apifox API 类型字段
 * 用于标识接口的 CRUD 操作类型，用于生成权限点 key 的后缀部分
 *
 * 可选值（定义在 constant/model.ts）:
 * - "atom-列表" - 列表查询
 * - "atom-新增" - 新增数据
 * - "atom-修改" - 修改数据
 * - "atom-获取详情" - 获取详情
 * - "atom-获取详情-origin" - 获取详情（原始）
 * - "atom-更新状态-单条" - 更新单条状态
 * - "atom-删除-单条" - 删除单条
 * - "atom-删除-多条" - 删除多条
 * - "atom-自定义" - 自定义操作（默认值）
 *
 * 如果缺失，默认使用 "atom-自定义"
 */
export const APIFOX_FIELD_API_TYPE =
  "x-apifox-fe-general-model-api-type" as const

/**
 * 所有 Apifox 自定义字段的集合
 * 用于类型检查和批量处理
 */
export const APIFOX_CUSTOM_FIELDS = {
  RUN_IN_APIFOX: APIFOX_FIELD_RUN_IN_APIFOX,
  STATUS: APIFOX_FIELD_STATUS,
  GROUP_NAME: APIFOX_FIELD_GROUP_NAME,
  API_TYPE: APIFOX_FIELD_API_TYPE,
} as const

/**
 * Apifox 自定义字段类型
 */
export type ApifoxCustomField =
  (typeof APIFOX_CUSTOM_FIELDS)[keyof typeof APIFOX_CUSTOM_FIELDS]
