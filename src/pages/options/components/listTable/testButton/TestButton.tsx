import React, { useState } from "react"
import { Button, Modal, Spin, Tag, Space, message } from "antd"
import { ThunderboltOutlined } from "@ant-design/icons"
import { ApiConfig } from "@src/types"
import { useConfigStore } from "@src/store"

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
    data: any
    error?: string
  } | null>(null)

  const handleTest = async () => {
    setTestModalVisible(true)
    setTestLoading(true)
    setTestResult(null)

    try {
      // 模拟请求延迟 1 秒
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 根据全局 mock 开关状态决定测试 URL
      // 如果全局 mock 开关关闭，直接测试原始 API URL（不经过代理）
      // 如果全局 mock 开关开启，测试 redirectURL（会被代理拦截的 URL）
      const testUrl =
        config.isGlobalEnabled && apiConfig.isOpen && apiConfig.redirectURL
          ? apiConfig.redirectURL
          : apiConfig.apiUrl

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

      let responseData: any
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
              {config.isGlobalEnabled &&
              apiConfig.isOpen &&
              apiConfig.redirectURL
                ? apiConfig.redirectURL
                : apiConfig.apiUrl}
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
                {apiConfig.redirectURL && (
                  <div className="mt-1">
                    <span className="font-medium">实际请求 URL: </span>
                    <span className="text-blue-600">
                      {apiConfig.redirectURL}
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
