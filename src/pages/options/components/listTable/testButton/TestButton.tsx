import React, { useState } from "react"
import { Button, Modal, Spin, Tag, message } from "antd"
import { ThunderboltOutlined, CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons"
import { ApiConfig } from "@src/types"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { appendApifoxMockToken } from "@src/utils/mockUtils"

interface TestButtonProps {
  apiConfig: ApiConfig
  getMethodColor: (method: string) => string
}

const TestButton: React.FC<TestButtonProps> = ({
  apiConfig,
  getMethodColor,
}) => {
  const { config, setConfig } = useConfigStore()
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText?: string
    headers: Record<string, string>
    data: unknown
    error?: string
  } | null>(null)

  const [showGlobalOffWarning, setShowGlobalOffWarning] = useState(false)

  // 执行测试请求
  const runTestRequest = async () => {
    setTestModalVisible(true)
    setTestLoading(true)
    setTestResult(null)

    try {
      // 模拟请求延迟 1 秒
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 使用 redirectURL 进行测试（会被代理拦截的 URL）
      let testUrl = apiConfig.redirectURL

      // 如果配置了 Apifox Mock Token 但 URL 中未携带，自动补充
      testUrl = appendApifoxMockToken(testUrl, config.apifoxConfig?.apifoxMockToken)

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

  // 仅调试单个接口：关闭其他所有接口，只保留当前接口
  const handleDebugSingle = () => {
    const newConfig = {
      ...config,
      isGlobalEnabled: true,
      modules: config.modules.map((module) => ({
        ...module,
        apiArr: module.apiArr.map((api) => ({
          ...api,
          isOpen: api.id === apiConfig.id,
        })),
      })),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
    message.success("已关闭其他接口，仅保留当前接口的 Mock 开关")
    setShowGlobalOffWarning(false)
    runTestRequest()
  }

  // 开启全局开关
  const handleEnableGlobal = () => {
    const newConfig = {
      ...config,
      isGlobalEnabled: true,
    }
    setConfig(newConfig)
    saveConfig(newConfig)
    message.success("已开启全局 Mock 开关")
    setShowGlobalOffWarning(false)
    runTestRequest()
  }

  // 测试按钮点击入口
  const handleTest = () => {
    if (!config.isGlobalEnabled) {
      setShowGlobalOffWarning(true)
      return
    }

    if (!apiConfig.isOpen) {
      message.warning("单个 Mock 开关未打开，请先打开该接口的 Mock 开关后再测试")
      return
    }

    if (!apiConfig.redirectURL) {
      message.warning("该接口未配置 Mock 地址，请先配置 Mock 地址后再测试")
      return
    }

    runTestRequest()
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
              {apiConfig.redirectURL || apiConfig.apiUrl}
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

      {/* 全局 Mock 开关未打开时的提示弹框 */}
      <Modal
        title="全局 Mock 开关未打开"
        open={showGlobalOffWarning}
        onCancel={() => setShowGlobalOffWarning(false)}
        closable
        maskClosable
        footer={null}
        width={420}
      >
        <div className="py-3 space-y-2 text-xs text-gray-500">
          <div>
            <span className="text-orange-600 font-medium">仅调试单个接口：</span>
            关闭其他接口 Mock，打开全局开关，仅单个测试
          </div>
          <div>
            <span className="text-blue-600 font-medium">开启全局开关：</span>
            打开全局开关并测试
          </div>
        </div>
        <div className="flex gap-3 pb-2">
          <Button
            icon={<CloseCircleOutlined />}
            onClick={handleDebugSingle}
            style={{ color: "#d4380d", borderColor: "#d4380d" }}
            block
          >
            仅调试单个接口
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleEnableGlobal}
            block
          >
            开启全局开关
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default TestButton
