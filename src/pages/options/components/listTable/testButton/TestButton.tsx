import React, { useState, useEffect } from "react"
import { Button, Modal, Spin, Tag, message } from "antd"
import { ThunderboltOutlined } from "@ant-design/icons"
import { ApiConfig, GlobalResponse } from "@src/types"
import { useConfigStore } from "@src/store"
import { getAllGlobalResponses, getGlobalResponse } from "@src/utils/globalResponseUtil"

interface TestButtonProps {
  apiConfig: ApiConfig
  getMethodColor: (method: string) => string
}

const TestButton: React.FC<TestButtonProps> = ({
  apiConfig,
  getMethodColor,
}) => {
  const { config } = useConfigStore()
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText?: string
    headers: Record<string, string>
    data: unknown
    error?: string
  } | null>(null)
  const [globalResponseList, setGlobalResponseList] = useState<GlobalResponse[]>([])

  // 加载全局响应 列表
  useEffect(() => {
    const loadGlobalResponses = async () => {
      try {
        const list = await getAllGlobalResponses()
        setGlobalResponseList(list)
      } catch (error) {
        console.error("Load global mocks error:", error)
      }
    }
    loadGlobalResponses()
  }, [])

  // 获取实际请求显示信息（使用 useMemo 缓存，避免每次渲染都重新计算）
  const actualRequestInfo = React.useMemo(() => {
    // 检查是否配置了全局响应
    if (apiConfig.activeGlobalResponseId) {
      const globalResponse = globalResponseList.find(
        (mock) => mock.id === apiConfig.activeGlobalResponseId
      )
      if (globalResponse?.name) {
        return {
          label: "实际请求",
          value: `全局响应 - ${globalResponse.name}`,
        }
      }
    }

    // 如果没有全局响应，显示 redirectURL
    if (apiConfig.redirectURL) {
      return {
        label: "实际请求 URL",
        value: apiConfig.redirectURL,
      }
    }

    return null
  }, [apiConfig.activeGlobalResponseId, apiConfig.redirectURL, globalResponseList])

  const handleTest = async () => {
    // 检查 mock 开关状态
    if (!config.isGlobalEnabled) {
      message.warning("全局响应 开关未打开，请先打开全局响应 开关后再测试")
      return
    }

    if (!apiConfig.isOpen) {
      message.warning(
        "单个 Mock 开关未打开，请先打开该接口的 Mock 开关后再测试"
      )
      return
    }

    setTestModalVisible(true)
    setTestLoading(true)
    setTestResult(null)

    try {
      // 模拟请求延迟 1 秒
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 如果开启了全局响应，直接返回全局响应 响应
      if (apiConfig.activeGlobalResponseId) {
        const globalResponse = await getGlobalResponse(apiConfig.activeGlobalResponseId)
        if (!globalResponse) {
          message.error("全局响应 配置不存在")
          setTestLoading(false)
          return
        }

        // 处理延迟
        if (globalResponse.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, globalResponse.delay))
        }

        // 解析响应 JSON
        let responseData: unknown
        try {
          responseData = JSON.parse(globalResponse.responseJson)
        } catch (error) {
          console.error("Failed to parse global mock response JSON:", error)
          responseData = { error: "Invalid JSON in global mock response" }
        }

        // 返回全局响应 响应
        setTestResult({
          status: globalResponse.statusCode || 200,
          statusText: getStatusText(globalResponse.statusCode || 200),
          headers: {
            "Content-Type": "application/json",
          },
          data: responseData,
        })
        return
      }

      // 如果没有开启全局响应，直接请求 redirectURL
      // 注意：options 页面不会被 declarativeNetRequest 拦截，所以需要直接请求 redirectURL
      if (!apiConfig.redirectURL) {
        message.warning("该接口未配置 Mock 地址，请先配置 Mock 地址后再测试")
        setTestLoading(false)
        return
      }

      // 直接使用 redirectURL 进行测试（因为 options 页面不会被 declarativeNetRequest 拦截）
      const testUrl = apiConfig.redirectURL

      const response = await fetch(testUrl, {
        method: apiConfig.method,
        headers: {
          "Content-Type": "application/json",
          ...(apiConfig.requestHeaders
            ? JSON.parse(apiConfig.requestHeaders)
            : {}),
        },
        body:
          apiConfig.method !== "GET" && apiConfig.requestBody
            ? apiConfig.requestBody
            : undefined,
      })

      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      let responseData: unknown
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers,
        data: responseData,
      })
    } catch (error) {
      setTestResult({
        status: 0,
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : "请求失败，未知错误",
      })
    } finally {
      setTestLoading(false)
    }
  }

  // 获取状态码对应的状态文本
  const getStatusText = (status: number): string => {
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

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<ThunderboltOutlined />}
        onClick={handleTest}
        title="测试接口"
      >
        测试
      </Button>

      <Modal
        title={`测试接口 - ${apiConfig.apiName}`}
        open={testModalVisible}
        onCancel={() => {
          if (!testLoading) {
            setTestModalVisible(false)
            setTestResult(null)
          }
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setTestModalVisible(false)
              setTestResult(null)
            }}
            disabled={testLoading}
          >
            关闭
          </Button>,
        ]}
        width={800}
        closable={!testLoading}
        maskClosable={!testLoading}
      >
        {testLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-6 text-gray-600 text-base font-medium">
              正在发送请求...
            </div>
            <div className="mt-2 text-gray-400 text-sm">
              {apiConfig.redirectURL}
            </div>
          </div>
        ) : testResult ? (
          <div className="space-y-4">
            <div>
              <div className="font-semibold mb-2">请求信息：</div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div>
                  <span className="font-medium">原始 URL: </span>
                  <span className="text-gray-600">{apiConfig.apiUrl}</span>
                </div>
                {actualRequestInfo && (
                  <div className="mt-1">
                    <span className="font-medium">
                      {actualRequestInfo.label}:{" "}
                    </span>
                    <span className="text-blue-600">
                      {actualRequestInfo.value}
                    </span>
                  </div>
                )}
                <div className="mt-1">
                  <span className="font-medium">Method: </span>
                  <Tag color={getMethodColor(apiConfig.method)}>
                    {apiConfig.method.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            {testResult.error ? (
              <div>
                <div className="font-semibold mb-2 text-red-600">
                  错误信息：
                </div>
                <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                  {testResult.error}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="font-semibold mb-2">响应状态：</div>
                  <div className="bg-gray-50 p-3 rounded">
                    <Tag
                      color={
                        testResult.status >= 200 && testResult.status < 300
                          ? "green"
                          : testResult.status >= 300 && testResult.status < 400
                            ? "orange"
                            : "red"
                      }
                    >
                      {testResult.status} {testResult.statusText || ""}
                    </Tag>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">响应头：</div>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(testResult.headers, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">响应数据：</div>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {typeof testResult.data === "string"
                        ? testResult.data
                        : JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  )
}

export default TestButton
