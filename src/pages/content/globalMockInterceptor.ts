/**
 * Content Script - 全局 Mock 响应拦截器
 * 拦截页面中的 fetch 和 XMLHttpRequest 请求，返回全局 Mock 响应
 */

import { GlobalMockResponse } from "@src/types/index"

// 扩展 XMLHttpRequest 类型，添加自定义属性
interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _url?: string
  _method?: string
}

// 从 IndexedDB 读取指定的全局 Mock 响应
async function getGlobalMockById(
  mockId: string
): Promise<GlobalMockResponse | null> {
  try {
    const DB_NAME = "global-mock-db"
    const DB_VERSION = 2
    const STORE_NAME = "globalMocks"

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(new Error("Failed to open IndexedDB"))

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction([STORE_NAME], "readonly")
        const objectStore = transaction.objectStore(STORE_NAME)
        const getRequest = objectStore.get(mockId)

        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result || null)
        }

        getRequest.onerror = () =>
          reject(new Error("Failed to get global mock"))
      }

      request.onupgradeneeded = () => {
        // 数据库已存在，不需要升级
      }
    })
  } catch (error) {
    console.error("[Global Mock] Error getting global mock:", error)
    return null
  }
}

// 检查请求是否应该被拦截，并获取对应的全局 Mock ID
async function checkInterceptRequest(url: string): Promise<{
  shouldIntercept: boolean
  globalMockId?: string
}> {
  try {
    // 从 background 获取配置，检查是否有启用的 API 匹配这个 URL
    const response = (await chrome.runtime.sendMessage({
      action: "checkApiMatch",
      url,
    })) as {
      success?: boolean
      shouldIntercept?: boolean
      globalMockId?: string
    }
    return {
      shouldIntercept: response?.shouldIntercept || false,
      globalMockId: response?.globalMockId,
    }
  } catch (error) {
    console.error("[Global Mock] Error checking API match:", error)
    return { shouldIntercept: false }
  }
}

// 拦截 fetch 请求
const originalFetch = window.fetch
window.fetch = async function (
  input: string | Request | URL,
  init?: Parameters<typeof originalFetch>[1]
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input instanceof Request
          ? input.url
          : ""

  // 检查请求是否应该被拦截，并获取对应的全局 Mock ID
  const interceptResult = await checkInterceptRequest(url)
  if (!interceptResult.shouldIntercept || !interceptResult.globalMockId) {
    return originalFetch.call(this, input, init)
  }

  // 根据 Mock ID 获取对应的全局 Mock 响应
  const globalMock = await getGlobalMockById(interceptResult.globalMockId)
  if (!globalMock) {
    console.warn(
      `[Global Mock] Mock not found: ${interceptResult.globalMockId}`
    )
    return originalFetch.call(this, input, init)
  }

  // 处理延迟
  if (globalMock.delay > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, globalMock.delay))
  }

  // 解析响应 JSON
  let responseData: unknown
  try {
    responseData = JSON.parse(globalMock.responseJson)
  } catch (error) {
    console.error("[Global Mock] Failed to parse response JSON:", error)
    responseData = { error: "Invalid JSON in global mock response" }
  }

  // 返回 Mock 响应
  return new Response(JSON.stringify(responseData), {
    status: globalMock.statusCode || 200,
    statusText: getStatusText(globalMock.statusCode || 200),
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// 拦截 XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open
const originalXHRSend = XMLHttpRequest.prototype.send

XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null
): void {
  const extendedXhr = this as ExtendedXMLHttpRequest
  extendedXhr._url = typeof url === "string" ? url : url.href
  extendedXhr._method = method
  originalXHROpen.call(
    this,
    method,
    url,
    async ?? true,
    username ?? null,
    password ?? null
  )
}

XMLHttpRequest.prototype.send = function (
  body?: Parameters<typeof originalXHRSend>[0]
): void {
  const xhr = this as ExtendedXMLHttpRequest
  const url = xhr._url || ""

  // 异步检查并拦截
  ;(async () => {
    // 检查请求是否应该被拦截，并获取对应的全局 Mock ID
    const interceptResult = await checkInterceptRequest(url)
    if (!interceptResult.shouldIntercept || !interceptResult.globalMockId) {
      return
    }

    // 根据 Mock ID 获取对应的全局 Mock 响应
    const globalMock = await getGlobalMockById(interceptResult.globalMockId)
    if (!globalMock) {
      console.warn(
        `[Global Mock] Mock not found: ${interceptResult.globalMockId}`
      )
      return
    }

    // 处理延迟
    if (globalMock.delay > 0) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, globalMock.delay)
      )
    }

    // 解析响应 JSON
    let responseData: unknown
    try {
      responseData = JSON.parse(globalMock.responseJson)
    } catch (error) {
      console.error("[Global Mock] Failed to parse response JSON:", error)
      responseData = { error: "Invalid JSON in global mock response" }
    }

    // 模拟响应
    Object.defineProperty(xhr, "status", {
      value: globalMock.statusCode || 200,
      writable: false,
      configurable: true,
    })
    Object.defineProperty(xhr, "statusText", {
      value: getStatusText(globalMock.statusCode || 200),
      writable: false,
      configurable: true,
    })
    Object.defineProperty(xhr, "responseText", {
      value: JSON.stringify(responseData),
      writable: false,
      configurable: true,
    })
    Object.defineProperty(xhr, "response", {
      value: JSON.stringify(responseData),
      writable: false,
      configurable: true,
    })
    Object.defineProperty(xhr, "readyState", {
      value: XMLHttpRequest.DONE,
      writable: false,
      configurable: true,
    })

    // 触发事件
    if (xhr.onreadystatechange) {
      const event = new ProgressEvent("readystatechange", {
        bubbles: false,
        cancelable: false,
      })
      xhr.onreadystatechange(event)
    }
    if (xhr.onload) {
      const event = new ProgressEvent("load", {
        bubbles: false,
        cancelable: false,
      })
      xhr.onload(event)
    }
  })()

  // 如果不需要拦截，继续原始请求
  originalXHRSend.call(xhr, body)
}

// 获取状态码对应的状态文本
function getStatusText(status: number): string {
  const statusTexts: { [key: number]: string } = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  }
  return statusTexts[status] || "OK"
}
