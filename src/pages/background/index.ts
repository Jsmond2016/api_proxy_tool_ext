import { ApiConfig, ModuleConfig, GlobalConfig } from '../../types';

console.log('API Proxy Tool background script loaded');

// 存储配置
let globalConfig: GlobalConfig = {
  isGlobalEnabled: false,
  modules: []
};

// 从storage加载配置
async function loadConfig() {
  try {
    const result = await chrome.storage.local.get(['globalConfig']);
    if (result.globalConfig) {
      globalConfig = result.globalConfig;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

// 保存配置到storage
async function saveConfig() {
  try {
    await chrome.storage.local.set({ globalConfig });
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

// 检查URL是否匹配规则
function matchesRule(url: string, apiConfig: ApiConfig): boolean {
  if (!apiConfig.isOpen) return false;
  
  const targetUrl = apiConfig.apiUrl.toLowerCase();
  const requestUrl = url.toLowerCase();
  
  switch (apiConfig.filterType) {
    case 'exact':
      return requestUrl === targetUrl;
    case 'contains':
      return requestUrl.includes(targetUrl);
    case 'regex':
      try {
        const regex = new RegExp(targetUrl);
        return regex.test(requestUrl);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

// 查找匹配的API配置
function findMatchingApiConfig(url: string): ApiConfig | null {
  for (const module of globalConfig.modules) {
    for (const apiConfig of module.apiArr) {
      if (matchesRule(url, apiConfig)) {
        return apiConfig;
      }
    }
  }
  return null;
}

// 处理请求拦截
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    // 检查全局开关
    if (!globalConfig.isGlobalEnabled) {
      return;
    }

    // 查找匹配的API配置
    const apiConfig = findMatchingApiConfig(details.url);
    if (!apiConfig) {
      return;
    }

    console.log(`Intercepting request: ${details.url} -> ${apiConfig.redirectURL}`);

    // 如果配置了延迟，等待指定时间
    if (apiConfig.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, apiConfig.delay));
    }

    // 重定向到mock URL
    return {
      redirectUrl: apiConfig.redirectURL
    };
  },
  {
    urls: ["<all_urls>"]
  },
  ["blocking"]
);

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getConfig':
      sendResponse({ config: globalConfig });
      break;
      
    case 'updateConfig':
      globalConfig = request.config;
      saveConfig();
      sendResponse({ success: true });
      break;
      
    case 'toggleGlobal':
      globalConfig.isGlobalEnabled = request.enabled;
      saveConfig();
      sendResponse({ success: true });
      break;
      
    case 'toggleModule':
      const module = globalConfig.modules.find(m => m.id === request.moduleId);
      if (module) {
        module.apiArr.forEach(api => {
          api.isOpen = request.enabled;
        });
        saveConfig();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Module not found' });
      }
      break;
      
    case 'toggleApi':
      for (const module of globalConfig.modules) {
        const api = module.apiArr.find(a => a.id === request.apiId);
        if (api) {
          api.isOpen = request.enabled;
          saveConfig();
          sendResponse({ success: true });
          return;
        }
      }
      sendResponse({ success: false, error: 'API not found' });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // 保持消息通道开放以支持异步响应
});

// 初始化
loadConfig();
