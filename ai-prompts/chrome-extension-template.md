# Chrome 扩展开发模板

当需要开发 Chrome 扩展相关功能时，请遵循以下模板：

## Background Script 模板

```typescript
// src/pages/background/index.ts
import { ChromeApiService } from '../../utils/chromeApi';

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 初始化默认配置
    await ChromeApiService.initDefaultConfig();
    console.log('Extension installed and initialized');
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_CONFIG':
      ChromeApiService.getConfig().then(sendResponse);
      return true;

    case 'UPDATE_CONFIG':
      ChromeApiService.updateConfig(message.data).then(sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

// 网络请求拦截
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  console.log('Request intercepted:', details);
});
```

## Chrome API 服务模板

```typescript
// src/utils/chromeApi.ts
export class ChromeApiService {
  // 获取配置
  static async getConfig(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        resolve(result.config || this.getDefaultConfig());
      });
    });
  }

  // 更新配置
  static async updateConfig(config: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ config }, () => {
        resolve();
      });
    });
  }

  // 获取默认配置
  private static getDefaultConfig() {
    return {
      modules: [],
      globalEnabled: true,
    };
  }
}
```

## 扩展开发规范
- 使用 Chrome Extension Manifest V3
- 合理使用 declarativeNetRequest API
- 使用 chrome.storage API 进行数据持久化
- 提供清晰的错误处理机制
- 遵循 Chrome 扩展安全最佳实践
- 使用 TypeScript 确保类型安全
