import {
  ApiConfig,
  GlobalConfig,
  BackgroundMessage,
  BackgroundMessageResponse,
  BackgroundMessageAction,
} from "../../types"
import {
  getDefaultGlobalConfig,
  LOG_MESSAGES,
  ERROR_MESSAGES,
} from "../../constant/constant"
import { Logger } from "../../utils/logger"

// ==================== 常量定义 ====================

/** 规则优先级 */
const RULE_PRIORITY = 1

/** 规则ID起始值 */
const RULE_ID_START = 1

/** 图标路径配置 */
const ICON_PATHS = {
  enabled: "icon-32.png",
  disabled: "dev-icon-32.png",
} as const

/** Storage 键名 */
const STORAGE_KEY = "globalConfig"

// ==================== 控制台输出 ====================

// 美化的控制台输出 - 显示扩展信息
Logger.logExtensionInfo()

// ==================== 全局状态 ====================

/** 存储配置 */
let globalConfig: GlobalConfig = getDefaultGlobalConfig()

// ==================== 配置管理 ====================

/**
 * 从 storage 加载配置
 */
async function loadConfig(): Promise<void> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY])
    if (result[STORAGE_KEY]) {
      globalConfig = result[STORAGE_KEY] as GlobalConfig
    }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.LOAD_CONFIG, error)
    // 使用默认配置作为降级方案
    globalConfig = getDefaultGlobalConfig()
  }
}

/**
 * 保存配置到 storage
 */
async function saveConfig(): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: globalConfig })
  } catch (error) {
    Logger.error(ERROR_MESSAGES.SAVE_CONFIG, error)
    throw error
  }
}

// ==================== 规则管理 ====================

/** 缓存上一次的规则签名，用于变更检测 */
let lastRulesSignature: string | null = null

/**
 * 生成规则签名，用于检测变更
 * @param rules 规则列表
 * @returns 规则签名字符串
 */
function generateRulesSignature(
  rules: chrome.declarativeNetRequest.Rule[]
): string {
  return JSON.stringify(
    rules.map((rule) => ({
      condition: rule.condition,
      action: rule.action,
    }))
  )
}

/**
 * 构建规则条件
 * @param apiConfig API配置
 * @returns 规则条件对象
 */
function buildRuleCondition(
  apiConfig: ApiConfig
): chrome.declarativeNetRequest.RuleCondition {
  const condition: chrome.declarativeNetRequest.RuleCondition = {
    resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
  }

  // 根据过滤类型设置匹配条件
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
      throw new Error(`Unknown filter type: ${apiConfig.filterType}`)
  }

  // 添加方法过滤
  if (apiConfig.method) {
    condition.requestMethods = [
      apiConfig.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod,
    ]
  }

  return condition
}

/**
 * 动态更新 declarativeNetRequest 规则
 */
async function updateDeclarativeRules(): Promise<void> {
  try {
    if (!globalConfig.isGlobalEnabled) {
      // 清除所有规则
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
      const ruleIds = existingRules.map((rule) => rule.id)

      if (ruleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIds,
        })
        // 清除规则签名缓存
        lastRulesSignature = null
        Logger.info(LOG_MESSAGES.RULES_REMOVED(ruleIds.length))
      }
      return
    }

    const rules: chrome.declarativeNetRequest.Rule[] = []
    let ruleId = RULE_ID_START

    // 遍历所有模块和API配置，构建规则
    for (const module of globalConfig.modules) {
      for (const apiConfig of module.apiArr) {
        if (!apiConfig.isOpen) continue

        try {
          const condition = buildRuleCondition(apiConfig)

          rules.push({
            id: ruleId++,
            priority: RULE_PRIORITY,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                url: apiConfig.redirectURL,
              },
            },
            condition,
          })
        } catch (error) {
          Logger.error(
            ERROR_MESSAGES.BUILD_RULE(apiConfig.apiName, apiConfig.id),
            error
          )
          // 继续处理其他规则，不因单个规则失败而中断
        }
      }
    }

    // 生成规则签名用于变更检测
    const newRulesSignature = generateRulesSignature(rules)

    // 如果规则没有变化，跳过更新
    if (lastRulesSignature === newRulesSignature) {
      Logger.info(LOG_MESSAGES.RULES_UNCHANGED)
      return
    }

    // 获取现有规则ID
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const existingRuleIds = existingRules.map((rule) => rule.id)

    // 更新规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: rules,
    })

    // 更新规则签名缓存
    lastRulesSignature = newRulesSignature
    Logger.info(LOG_MESSAGES.RULES_UPDATED(rules.length))
  } catch (error) {
    Logger.error(ERROR_MESSAGES.UPDATE_RULES, error)
    throw error
  }
}

// ==================== 图标管理 ====================

/**
 * 更新扩展图标
 * @param enabled 是否启用
 */
async function updateIcon(enabled: boolean): Promise<void> {
  try {
    const iconPath = enabled ? ICON_PATHS.enabled : ICON_PATHS.disabled
    await chrome.action.setIcon({
      path: {
        "32": iconPath,
      },
    })
  } catch (error) {
    Logger.error(ERROR_MESSAGES.UPDATE_ICON, error)
    Logger.errorDetails(LOG_MESSAGES.ERROR_DETAILS, error)
    // 图标更新失败不影响主要功能，只记录错误
  }
}

// ==================== 消息处理 ====================

/**
 * 处理获取配置消息
 */
function handleGetConfig(): BackgroundMessageResponse {
  return { success: true, config: globalConfig }
}

/**
 * 处理更新配置消息
 */
async function handleUpdateConfig(
  config: GlobalConfig
): Promise<BackgroundMessageResponse> {
  try {
    globalConfig = config
    await saveConfig()
    await updateDeclarativeRules()
    return { success: true }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.UPDATE_CONFIG, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

/**
 * 处理切换全局开关消息
 */
async function handleToggleGlobal(
  enabled: boolean
): Promise<BackgroundMessageResponse> {
  try {
    globalConfig.isGlobalEnabled = enabled
    await saveConfig()
    await updateDeclarativeRules()
    await updateIcon(enabled)
    return { success: true }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.TOGGLE_GLOBAL, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

/**
 * 处理切换模块开关消息
 */
async function handleToggleModule(
  moduleId: string,
  enabled: boolean
): Promise<BackgroundMessageResponse> {
  try {
    const module = globalConfig.modules.find((m) => m.id === moduleId)
    if (!module) {
      return { success: false, error: ERROR_MESSAGES.MODULE_NOT_FOUND }
    }

    module.apiArr.forEach((api) => {
      api.isOpen = enabled
    })
    await saveConfig()
    await updateDeclarativeRules()
    return { success: true }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.TOGGLE_MODULE, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

/**
 * 处理切换API开关消息
 */
async function handleToggleApi(
  apiId: string,
  enabled: boolean
): Promise<BackgroundMessageResponse> {
  try {
    for (const module of globalConfig.modules) {
      const api = module.apiArr.find((a) => a.id === apiId)
      if (api) {
        api.isOpen = enabled
        await saveConfig()
        await updateDeclarativeRules()
        return { success: true }
      }
    }
    return { success: false, error: ERROR_MESSAGES.API_NOT_FOUND }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.TOGGLE_API, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

/**
 * 处理更新图标消息
 */
async function handleUpdateIcon(
  enabled: boolean
): Promise<BackgroundMessageResponse> {
  try {
    await updateIcon(enabled)
    return { success: true }
  } catch (error) {
    Logger.error(ERROR_MESSAGES.UPDATE_ICON, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

/**
 * 消息处理器
 * 注意：对于异步操作，必须立即返回 true 以保持消息通道开放
 */
function handleMessage(
  request: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: BackgroundMessageResponse) => void
): boolean {
  // 处理同步操作
  if (request.action === BackgroundMessageAction.GET_CONFIG) {
    try {
      const response = handleGetConfig()
      sendResponse(response)
      return false // 同步操作，不需要保持通道开放
    } catch (error) {
      Logger.error(ERROR_MESSAGES.HANDLE_MESSAGE, error)
      sendResponse({
        success: false,
        error:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      })
      return false
    }
  }

  // 处理异步操作 - 立即返回 true 保持通道开放
  ;(async () => {
    try {
      let response: BackgroundMessageResponse

      switch (request.action) {
        case BackgroundMessageAction.UPDATE_CONFIG:
          if (!request.config) {
            response = {
              success: false,
              error: ERROR_MESSAGES.CONFIG_REQUIRED,
            }
            sendResponse(response)
            return
          }
          response = await handleUpdateConfig(request.config)
          sendResponse(response)
          break

        case BackgroundMessageAction.TOGGLE_GLOBAL:
          if (request.enabled === undefined) {
            response = {
              success: false,
              error: ERROR_MESSAGES.ENABLED_STATUS_REQUIRED,
            }
            sendResponse(response)
            return
          }
          response = await handleToggleGlobal(request.enabled)
          sendResponse(response)
          break

        case BackgroundMessageAction.TOGGLE_MODULE:
          if (!request.moduleId || request.enabled === undefined) {
            response = {
              success: false,
              error: ERROR_MESSAGES.MODULE_ID_AND_ENABLED_REQUIRED,
            }
            sendResponse(response)
            return
          }
          response = await handleToggleModule(request.moduleId, request.enabled)
          sendResponse(response)
          break

        case BackgroundMessageAction.TOGGLE_API:
          if (!request.apiId || request.enabled === undefined) {
            response = {
              success: false,
              error: ERROR_MESSAGES.API_ID_AND_ENABLED_REQUIRED,
            }
            sendResponse(response)
            return
          }
          response = await handleToggleApi(request.apiId, request.enabled)
          sendResponse(response)
          break

        case BackgroundMessageAction.UPDATE_ICON:
          if (request.enabled === undefined) {
            response = {
              success: false,
              error: ERROR_MESSAGES.ENABLED_STATUS_REQUIRED,
            }
            sendResponse(response)
            return
          }
          response = await handleUpdateIcon(request.enabled)
          sendResponse(response)
          break

        default:
          response = { success: false, error: ERROR_MESSAGES.UNKNOWN_ACTION }
          sendResponse(response)
      }
    } catch (error) {
      Logger.error(ERROR_MESSAGES.HANDLE_MESSAGE, error)
      sendResponse({
        success: false,
        error:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      })
    }
  })()

  return true // 保持消息通道开放以支持异步响应
}

// ==================== 事件监听 ====================

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(handleMessage)

// 处理扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 使用 activeTab 权限打开新标签页到配置页面
  chrome.tabs.create({
    url: chrome.runtime.getURL("src/pages/options/index.html"),
  })
})

// ==================== 初始化 ====================

/**
 * 初始化扩展
 */
async function initialize(): Promise<void> {
  try {
    await loadConfig()
    await updateDeclarativeRules()
    await updateIcon(globalConfig.isGlobalEnabled)
    Logger.info(LOG_MESSAGES.INIT_EXTENSION_SUCCESS)
  } catch (error) {
    Logger.error(ERROR_MESSAGES.INIT_EXTENSION, error)
    // 即使初始化失败，也尝试设置默认图标
    try {
      await updateIcon(false)
    } catch (iconError) {
      Logger.error(ERROR_MESSAGES.SET_DEFAULT_ICON, iconError)
    }
  }
}

initialize()
