/**
 * Content Script - 全局响应拦截器
 *
 * 这个脚本负责：
 * 1. 将拦截脚本注入到页面上下文
 * 2. 接收来自注入脚本的消息
 * 3. 与 background script 通信获取配置
 * 4. 从 IndexedDB 读取响应数据并返回给注入脚本
 */

import { GlobalResponse } from "@src/types/index"

console.log("[Global Response] Content script loaded")

// 注入拦截脚本到页面上下文
function injectScript() {
  try {
    const script = document.createElement("script")
    script.src = chrome.runtime.getURL("globalResponseInjector.js")
    script.onload = function () {
      console.log("[Global Response] Injector script loaded into page context")
      // 注入完成后移除 script 标签
      script.remove()
    }
    script.onerror = function (error) {
      console.error("[Global Response] Failed to load injector script:", error)
    }
    // 尽早注入
    ;(document.head || document.documentElement).appendChild(script)
  } catch (error) {
    console.error("[Global Response] Error injecting script:", error)
  }
}

// 从 IndexedDB 读取指定的全局响应
async function getGlobalResponseById(
  responseId: string
): Promise<GlobalResponse | null> {
  try {
    const DB_NAME = "global-response-db"
    const DB_VERSION = 2
    const STORE_NAME = "globalResponses"

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(new Error("Failed to open IndexedDB"))

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction([STORE_NAME], "readonly")
        const objectStore = transaction.objectStore(STORE_NAME)
        const getRequest = objectStore.get(responseId)

        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result || null)
        }

        getRequest.onerror = () =>
          reject(new Error("Failed to get global response"))
      }

      request.onupgradeneeded = () => {
        // 数据库已存在，不需要升级
      }
    })
  } catch (error) {
    console.error("[Global Response] Error getting global response:", error)
    return null
  }
}

// 检查 URL 是否应该被拦截
async function checkApiMatch(url: string): Promise<{
  shouldIntercept: boolean
  globalResponseId?: string
}> {
  try {
    const response = (await chrome.runtime.sendMessage({
      action: "checkApiMatch",
      url,
    })) as {
      success?: boolean
      shouldIntercept?: boolean
      globalResponseId?: string
    }
    return {
      shouldIntercept: response?.shouldIntercept || false,
      globalResponseId: response?.globalResponseId,
    }
  } catch (error) {
    console.error("[Global Response] Error checking API match:", error)
    return { shouldIntercept: false }
  }
}

// 监听来自注入脚本的消息
window.addEventListener("message", async function (event) {
  // 只接受来自同一窗口的消息
  if (event.source !== window) return

  // 处理拦截检查请求
  if (event.data.type === "GLOBAL_RESPONSE_CHECK") {
    const { id, url } = event.data
    console.log(`[Global Response] Received check request for: ${url}`)

    try {
      // 检查 URL 是否匹配
      const matchResult = await checkApiMatch(url)
      console.log(`[Global Response] Match result:`, matchResult)

      let responseData = null
      if (matchResult.shouldIntercept && matchResult.globalResponseId) {
        // 获取响应数据
        responseData = await getGlobalResponseById(matchResult.globalResponseId)
        console.log(`[Global Response] Response data:`, responseData)
      }

      // 发送响应回注入脚本
      window.postMessage(
        {
          type: "GLOBAL_RESPONSE_RESPONSE",
          id,
          shouldIntercept: matchResult.shouldIntercept,
          globalResponseId: matchResult.globalResponseId,
          responseData,
        },
        "*"
      )
    } catch (error) {
      console.error("[Global Response] Error processing check request:", error)
      // 发送失败响应
      window.postMessage(
        {
          type: "GLOBAL_RESPONSE_RESPONSE",
          id,
          shouldIntercept: false,
        },
        "*"
      )
    }
  }
})

// 立即注入脚本
injectScript()

console.log("[Global Response] Content script setup complete")
