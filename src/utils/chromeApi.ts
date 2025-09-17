import { GlobalConfig, ModuleConfig, ApiConfig } from '../types';

// 与background script通信的工具函数
export class ChromeApiService {
  // 获取配置
  static async getConfig(): Promise<GlobalConfig> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.config);
        }
      });
    });
  }

  // 更新配置
  static async updateConfig(config: GlobalConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'updateConfig', config }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.success);
        }
      });
    });
  }

  // 切换全局开关
  static async toggleGlobal(enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'toggleGlobal', enabled }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.success);
        }
      });
    });
  }

  // 切换模块开关
  static async toggleModule(moduleId: string, enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'toggleModule', moduleId, enabled }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.success);
        }
      });
    });
  }

  // 切换API开关
  static async toggleApi(apiId: string, enabled: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'toggleApi', apiId, enabled }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.success);
        }
      });
    });
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
