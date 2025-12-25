// 权限点相关类型定义

export interface PermissionPoint {
  parentAuthPointKey: string
  authPointApiUrl: string
  authPointKey: string
  authPointName: string
  type: string
  priority: null
  children: null
  desc: string
  menuPath: string
  prefixPath: string
  systemDomain: string
}

export interface SwaggerPath {
  [method: string]: {
    summary: string
    /**
     * Apifox 分组名/命名空间字段
     * 建议使用常量: APIFOX_FIELD_GROUP_NAME from @src/constant/apifoxFields
     */
    "x-apifox-fe-general-model-base-action-type"?: string
    [key: string]: unknown
  }
}

export interface SwaggerData {
  paths: {
    [path: string]: SwaggerPath
  }
  [key: string]: unknown
}

export interface PermissionGroup {
  groupName: string
  apis: {
    url: string
    method: string
    name: string
    summary: string
  }[]
}
