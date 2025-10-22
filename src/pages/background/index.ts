import { ApiConfig, GlobalConfig } from "../../types"
import packageJson from "../../../package.json"

// 美化的控制台输出 - 显示扩展信息
console.log(
  `%c🚀 API Proxy Tool %c| %cVersion: v${packageJson.version} %c| %cAuthor: Jsmond2016`,
  "color: #1890ff; font-weight: bold; font-size: 14px;",
  "color: #666;",
  "color: #52c41a; font-weight: bold;",
  "color: #666;",
  "color: #722ed1; font-weight: bold;"
)
console.log(
  `%c📦 GitHub: %chttps://github.com/Jsmond2016/api_proxy_tool_ext`,
  "color: #666;",
  "color: #1890ff; text-decoration: underline;"
)
// 安装地址：
// chrome-https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak
// edge-'https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN'

console.log(
  `%c🔗 Chrome Web Store: %chttps://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak`,
  "color: #666;",
  "color: #1890ff; text-decoration: underline;"
)
console.log(
  `%c🔗 Edge Add-ons: %chttps://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN`,
  "color: #666;",
  "color: #1890ff; text-decoration: underline;"
)
console.log(
  `%c🎯 Background script loaded successfully!`,
  "color: #52c41a; font-weight: bold;"
)

// 存储配置
let globalConfig: GlobalConfig = {
  isGlobalEnabled: false,
  modules: [
    {
      id: "default-module",
      apiDocKey: "default.module",
      label: "demo.default",
      apiDocUrl: "",
      dataWrapper: "",
      pageDomain: "",
      requestHeaders: "",
      apiArr: [
        {
          id: "example-api-1",
          apiKey: "/api/example",
          apiName: "示例接口",
          apiUrl: "http://localhost:3000/api/example",
          redirectURL: "http://127.0.0.1:4523/mock/api/example",
          method: "GET",
          filterType: "contains",
          delay: 0,
          isOpen: false,
          mockWay: "redirect",
          statusCode: 200,
          arrDepth: 4,
          arrLength: 3,
          mockResponseData: "",
          requestBody: "",
          requestHeaders: "",
        },
      ],
    },
  ],
}

// 从storage加载配置
async function loadConfig() {
  try {
    const result = await chrome.storage.local.get(["globalConfig"])
    if (result.globalConfig) {
      globalConfig = result.globalConfig
    }
  } catch (error) {
    console.error("Failed to load config:", error)
  }
}

// 保存配置到storage
async function saveConfig() {
  try {
    await chrome.storage.local.set({ globalConfig })
  } catch (error) {
    console.error("Failed to save config:", error)
  }
}

// 检查URL是否匹配规则
function matchesRule(url: string, apiConfig: ApiConfig): boolean {
  if (!apiConfig.isOpen) return false

  const targetUrl = apiConfig.apiUrl.toLowerCase()
  const requestUrl = url.toLowerCase()

  switch (apiConfig.filterType) {
    case "exact":
      return requestUrl === targetUrl
    case "contains":
      return requestUrl.includes(targetUrl)
    case "regex":
      try {
        const regex = new RegExp(targetUrl)
        return regex.test(requestUrl)
      } catch {
        return false
      }
    default:
      return false
  }
}

// 查找匹配的API配置
function findMatchingApiConfig(url: string): ApiConfig | null {
  for (const module of globalConfig.modules) {
    for (const apiConfig of module.apiArr) {
      if (matchesRule(url, apiConfig)) {
        return apiConfig
      }
    }
  }
  return null
}

// 动态更新 declarativeNetRequest 规则
async function updateDeclarativeRules() {
  if (!globalConfig.isGlobalEnabled) {
    // 清除所有规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await chrome.declarativeNetRequest
        .getDynamicRules()
        .then((rules) => rules.map((rule) => rule.id)),
    })
    return
  }

  const rules: chrome.declarativeNetRequest.Rule[] = []
  let ruleId = 1

  for (const module of globalConfig.modules) {
    for (const apiConfig of module.apiArr) {
      if (!apiConfig.isOpen) continue

      // 构建匹配条件
      let condition: any = {}

      switch (apiConfig.filterType) {
        case "exact":
          condition.urlFilter = apiConfig.apiUrl
          break
        case "contains":
          condition.urlFilter = `*${apiConfig.apiUrl}*`
          break
        case "regex":
          condition.regexFilter = apiConfig.apiUrl
          break
        default:
          continue
      }

      // 添加方法过滤
      if (apiConfig.method) {
        condition.requestMethods = [
          apiConfig.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod,
        ]
      }

      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: apiConfig.redirectURL,
          },
        },
        condition: {
          ...condition,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      })
    }
  }

  // 更新规则
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: await chrome.declarativeNetRequest
      .getDynamicRules()
      .then((rules) => rules.map((rule) => rule.id)),
    addRules: rules,
  })

  console.log(`Updated ${rules.length} declarative rules`)
}

// 更新扩展图标
async function updateIcon(enabled: boolean) {
  try {
    // 使用正确的32x32像素图标文件
    const iconPath = enabled ? "icon-128.png" : "dev-icon-128.png"
    await chrome.action.setIcon({
      path: {
        "32": iconPath,
      },
    })
  } catch (error) {
    console.error("Failed to update icon:", error)
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    )
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getConfig":
      sendResponse({ config: globalConfig })
      break

    case "updateConfig":
      globalConfig = request.config
      saveConfig()
      updateDeclarativeRules()
      sendResponse({ success: true })
      break

    case "toggleGlobal":
      globalConfig.isGlobalEnabled = request.enabled
      saveConfig()
      updateDeclarativeRules()
      updateIcon(request.enabled)
      sendResponse({ success: true })
      break

    case "toggleModule":
      const module = globalConfig.modules.find((m) => m.id === request.moduleId)
      if (module) {
        module.apiArr.forEach((api) => {
          api.isOpen = request.enabled
        })
        saveConfig()
        updateDeclarativeRules()
        sendResponse({ success: true })
      } else {
        sendResponse({ success: false, error: "Module not found" })
      }
      break

    case "toggleApi":
      for (const module of globalConfig.modules) {
        const api = module.apiArr.find((a) => a.id === request.apiId)
        if (api) {
          api.isOpen = request.enabled
          saveConfig()
          updateDeclarativeRules()
          sendResponse({ success: true })
          return
        }
      }
      sendResponse({ success: false, error: "API not found" })
      break

    case "updateIcon":
      updateIcon(request.enabled)
      sendResponse({ success: true })
      break

    default:
      sendResponse({ success: false, error: "Unknown action" })
  }

  return true // 保持消息通道开放以支持异步响应
})

// 处理扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 使用 activeTab 权限打开新标签页到配置页面
  chrome.tabs.create({
    url: chrome.runtime.getURL("src/pages/options/index.html"),
  })
})

// 初始化
async function initialize() {
  await loadConfig()
  await updateDeclarativeRules()
  await updateIcon(globalConfig.isGlobalEnabled)
}

initialize()
