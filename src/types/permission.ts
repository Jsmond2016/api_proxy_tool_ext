// 权限点相关类型定义

export interface PermissionPoint {
  parentAuthPointKey: string;
  authPointApiUrl: string;
  authPointKey: string;
  authPointName: string;
  type: string;
  priority: null;
  children: null;
  desc: string;
  menuPath: string;
  prefixPath: string;
  systemDomain: string;
}

export interface SwaggerPath {
  [method: string]: {
    summary: string;
    'x-apifox-fe-general-model-base-action-type'?: string;
    [key: string]: any;
  };
}

export interface SwaggerData {
  paths: {
    [path: string]: SwaggerPath;
  };
  [key: string]: any;
}

export interface PermissionGroup {
  groupName: string;
  apis: {
    url: string;
    method: string;
    name: string;
    summary: string;
  }[];
}
