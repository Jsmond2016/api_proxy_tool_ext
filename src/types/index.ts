// API接口配置类型
export interface ApiConfig {
  id: string;
  apiKey: string;
  apiName: string;
  apiUrl: string;
  redirectURL: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  filterType: 'contains' | 'exact' | 'regex';
  delay: number;
  isOpen: boolean;
  mockWay: 'redirect' | 'mock';
  mockResponseData?: string;
  requestBody?: string;
  requestHeaders?: string;
  statusCode: number;
  arrDepth?: number;
  arrLength?: number;
}

// 模块配置类型
export interface ModuleConfig {
  id: string;
  apiDocKey: string;
  label: string;
  apiDocUrl?: string;
  dataWrapper?: string;
  pageDomain?: string;
  requestHeaders?: string;
  apiArr: ApiConfig[];
}

// 全局配置类型
export interface GlobalConfig {
  isGlobalEnabled: boolean;
  modules: ModuleConfig[];
}

// 搜索和筛选类型
export interface SearchFilter {
  keyword: string;
  status: 'all' | 'enabled' | 'disabled';
  moduleId?: string;
}

// 导入导出格式类型（基于format.json）
export interface ImportExportFormat {
  apiDocKey: string;
  apiDocUrl: string;
  dataWrapper: string;
  label: string;
  pageDomain: string;
  requestHeaders: string;
  apiArr: {
    apiKey: string;
    apiName: string;
    apiUrl: string;
    arrDepth: number;
    arrLength: number;
    delay: number;
    filterType: 'contains' | 'exact' | 'regex';
    isOpen: boolean;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    mockResponseData: string;
    mockWay: 'redirect' | 'mock';
    redirectURL: string;
    requestBody: string;
    statusCode: number;
  }[];
}
