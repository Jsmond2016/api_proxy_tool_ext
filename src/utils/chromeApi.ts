import {
  GlobalConfig,
  ModuleConfig,
  ApiConfig,
  BackgroundMessageAction,
} from "../types"

// 与background script通信的工具函数
export class ChromeApiService {
  // 获取配置
  static async getConfig(): Promise<GlobalConfig> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: BackgroundMessageAction.GET_CONFIG },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.config)
          }
        }
      )
    })
  }

  // 更新配置
  static async updateConfig(config: GlobalConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: BackgroundMessageAction.UPDATE_CONFIG, config },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.success)
          }
        }
      )
    })
  }

  // 切换全局开关
  static async toggleGlobal(enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: BackgroundMessageAction.TOGGLE_GLOBAL, enabled },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.success)
          }
        }
      )
    })
  }

  // 切换模块开关
  static async toggleModule(
    moduleId: string,
    enabled: boolean
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: BackgroundMessageAction.TOGGLE_MODULE,
          moduleId,
          enabled,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.success)
          }
        }
      )
    })
  }

  // 切换API开关
  static async toggleApi(apiId: string, enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: BackgroundMessageAction.TOGGLE_API, apiId, enabled },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.success)
          }
        }
      )
    })
  }

  // 更新扩展图标
  static async updateIcon(enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: BackgroundMessageAction.UPDATE_ICON, enabled },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response.success)
          }
        }
      )
    })
  }
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 验证URL格式
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 验证相对路径
export function isValidPath(path: string): boolean {
  return path.startsWith('/') && path.length > 1;
}

// 格式化延迟时间显示
export function formatDelay(delay: number): string {
  if (delay === 0) return '无延迟';
  if (delay < 1000) return `${delay}ms`;
  return `${(delay / 1000).toFixed(1)}s`;
}

// 检查模块标签是否重复
export function isModuleLabelDuplicate(modules: any[], label: string, excludeId?: string): boolean {
  return modules.some(module =>
    module.label === label && module.id !== excludeId
  );
}

// 检查API URL是否重复
export function isApiUrlDuplicate(modules: any[], apiUrl: string, excludeId?: string): boolean {
  return modules.some(module =>
    module.apiArr.some((api: any) =>
      api.apiUrl === apiUrl && api.id !== excludeId
    )
  );
}

// 检查API Key是否重复
export function isApiKeyDuplicate(modules: any[], apiKey: string, excludeId?: string): boolean {
  return modules.some(module =>
    module.apiArr.some((api: any) =>
      api.apiKey === apiKey && api.id !== excludeId
    )
  );
}
