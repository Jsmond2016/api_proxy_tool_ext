import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Modal, Spin, Tag, Tooltip, message } from "antd";
import {
  CopyOutlined,
  DownOutlined,
  ThunderboltOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  ExportOutlined,
  UpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { ApiConfig } from "@src/types";
import { useConfigStore } from "@src/store";
import { saveConfig } from "@src/utils/configUtil";
import { appendApifoxMockToken } from "@src/utils/mockUtils";
import { findResponseSearchMatches } from "./responseSearch";

interface TestButtonProps {
  apiConfig: ApiConfig;
  apifoxLink?: string;
  getMethodColor: (method: string) => string;
}

const TestButton: React.FC<TestButtonProps> = ({
  apiConfig,
  apifoxLink,
  getMethodColor,
}) => {
  const { config, setConfig } = useConfigStore();
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    statusText?: string;
    headers: Record<string, string>;
    data: unknown;
    error?: string;
  } | null>(null);

  const [showGlobalOffWarning, setShowGlobalOffWarning] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const searchResultRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const searchMatches = useMemo(
    () => findResponseSearchMatches(testResult?.data, searchKeyword),
    [searchKeyword, testResult?.data],
  );
  const activeSearchMatch = searchMatches[activeSearchIndex];

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchKeyword, testResult?.data]);

  useEffect(() => {
    if (activeSearchMatch) {
      setCollapsedPaths((currentPaths) => {
        const expandedPaths = new Set(currentPaths);
        let currentPath = activeSearchMatch.path;
        while (currentPath !== "$") {
          expandedPaths.delete(currentPath);
          currentPath = currentPath.endsWith("]")
            ? currentPath.replace(/\[(?:\d+|"(?:\\.|[^"])*")\]$/, "")
            : currentPath.slice(0, currentPath.lastIndexOf("."));
        }
        expandedPaths.delete("$");
        return expandedPaths;
      });
      window.requestAnimationFrame(() => {
        searchResultRefs.current[activeSearchMatch.path]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [activeSearchIndex, activeSearchMatch]);

  const resetTestResult = () => {
    setTestResult(null);
    setSearchKeyword("");
    setActiveSearchIndex(0);
    setCollapsedPaths(new Set());
  };

  const handleSearchNavigation = (direction: 1 | -1) => {
    if (!searchMatches.length) {
      return;
    }

    setActiveSearchIndex(
      (currentIndex) =>
        (currentIndex + direction + searchMatches.length) %
        searchMatches.length,
    );
  };

  const handleCopySearchPath = async () => {
    if (!activeSearchMatch) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeSearchMatch.path);
      message.success("字段路径已复制");
    } catch (error) {
      console.error("复制字段路径失败:", error);
      message.error("复制失败，请重试");
    }
  };

  const highlightSearchKeyword = (value: string) => {
    const trimmedKeyword = searchKeyword.trim();
    if (!trimmedKeyword) {
      return value;
    }

    const segments = value.split(
      new RegExp(
        `(${trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      ),
    );
    return segments.map((segment, index) =>
      segment.toLocaleLowerCase() === trimmedKeyword.toLocaleLowerCase() ? (
        <mark key={`${segment}-${index}`} className="bg-amber-200 px-0.5">
          {segment}
        </mark>
      ) : (
        segment
      ),
    );
  };

  const getChildPath = (path: string, key: string | number) =>
    typeof key === "number"
      ? `${path}[${key}]`
      : /^[A-Za-z_$][\w$]*$/.test(key)
        ? `${path}.${key}`
        : `${path}[${JSON.stringify(key)}]`;

  const toggleCollapsedPath = (path: string) => {
    setCollapsedPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths);
      if (nextPaths.has(path)) {
        nextPaths.delete(path);
      } else {
        nextPaths.add(path);
      }
      return nextPaths;
    });
  };

  const renderPrimitive = (value: unknown) => {
    const text = String(value);
    return typeof value === "string" ? (
      <>
        {`"`}
        {highlightSearchKeyword(text)}
        {`"`}
      </>
    ) : (
      highlightSearchKeyword(text)
    );
  };

  const renderResponseValue = (
    value: unknown,
    path: string,
    depth = 0,
    isLast = true,
    lineNumberRef = { current: 1 },
  ): React.ReactNode => {
    const suffix = isLast ? "" : ",";
    const renderLine = (
      content: React.ReactNode,
      rowPath?: string,
      indent = depth,
    ) => {
      const lineNumber = lineNumberRef.current++;
      return (
        <div className="grid grid-cols-[3rem_minmax(0,1fr)] min-h-6">
          <span className="select-none border-r border-gray-200 pr-2 text-right text-gray-400">
            {lineNumber}
          </span>
          <div
            ref={(element) => {
              if (rowPath) {
                searchResultRefs.current[rowPath] = element;
              }
            }}
            className={
              activeSearchMatch?.path === rowPath
                ? "bg-blue-100 rounded"
                : undefined
            }
            style={{ paddingLeft: `${indent * 20}px` }}
          >
            {content}
          </div>
        </div>
      );
    };

    const renderCollapseButton = (blockPath: string, label: string) => {
      const isCollapsed = collapsedPaths.has(blockPath);
      return (
        <Tooltip title={`${isCollapsed ? "展开" : "折叠"}${label}`}>
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
            onClick={() => toggleCollapsedPath(blockPath)}
            aria-label={`${isCollapsed ? "展开" : "折叠"}${label}`}
            style={{ width: 20, height: 20, padding: 0, marginRight: 4 }}
          />
        </Tooltip>
      );
    };

    if (Array.isArray(value)) {
      const isCollapsed = collapsedPaths.has(path);
      return (
        <>
          {renderLine(
            <>
              {renderCollapseButton(path, "数组")}
              {isCollapsed ? `[ ... ${value.length} 项 ]${suffix}` : "["}
            </>,
            path,
          )}
          {!isCollapsed && (
            <>
              {value.map((item, index) => {
                const childPath = getChildPath(path, index);
                return (
                  <React.Fragment key={childPath}>
                    {renderResponseValue(
                      item,
                      childPath,
                      depth + 1,
                      index === value.length - 1,
                      lineNumberRef,
                    )}
                  </React.Fragment>
                );
              })}
              {renderLine(`]${suffix}`)}
            </>
          )}
        </>
      );
    }

    if (value !== null && typeof value === "object") {
      const entries = Object.entries(value);
      const isCollapsed = collapsedPaths.has(path);
      return (
        <>
          {renderLine(
            <>
              {renderCollapseButton(path, "对象")}
              {isCollapsed ? `{ ... ${entries.length} 个字段 }${suffix}` : "{"}
            </>,
            path,
          )}
          {!isCollapsed && (
            <>
              {entries.map(([key, item], index) => {
                const childPath = getChildPath(path, key);
                const childIsLast = index === entries.length - 1;
                if (item !== null && typeof item === "object") {
                  return (
                    <React.Fragment key={childPath}>
                      {renderLine(
                        <>
                          {`"`}
                          {highlightSearchKeyword(key)}
                          {`":`}
                        </>,
                        childPath,
                        depth + 1,
                      )}
                      {renderResponseValue(
                        item,
                        childPath,
                        depth + 2,
                        childIsLast,
                        lineNumberRef,
                      )}
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={childPath}>
                    {renderLine(
                      <>
                        {`"`}
                        {highlightSearchKeyword(key)}
                        {`": `}
                        {renderPrimitive(item)}
                        {childIsLast ? "" : ","}
                      </>,
                      childPath,
                      depth + 1,
                    )}
                  </React.Fragment>
                );
              })}
              {renderLine(`}${suffix}`)}
            </>
          )}
        </>
      );
    }

    return renderLine(
      <>
        {renderPrimitive(value)}
        {suffix}
      </>,
      path,
    );
  };

  // 执行测试请求
  const runTestRequest = async () => {
    setTestModalVisible(true);
    setTestLoading(true);
    resetTestResult();

    try {
      // 模拟请求延迟 1 秒
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 使用 redirectURL 进行测试（会被代理拦截的 URL）
      let testUrl = apiConfig.redirectURL;

      // 如果配置了 Apifox Mock Token 但 URL 中未携带，自动补充
      testUrl = appendApifoxMockToken(
        testUrl,
        config.apifoxConfig?.apifoxMockToken,
      );

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
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let responseData: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers,
        data: responseData,
      });
    } catch (error) {
      setTestResult({
        status: 0,
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : "请求失败，未知错误",
      });
    } finally {
      setTestLoading(false);
    }
  };

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
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    message.success("已关闭其他接口，仅保留当前接口的 Mock 开关");
    setShowGlobalOffWarning(false);
    runTestRequest();
  };

  // 开启全局开关
  const handleEnableGlobal = () => {
    const newConfig = {
      ...config,
      isGlobalEnabled: true,
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    message.success("已开启全局 Mock 开关");
    setShowGlobalOffWarning(false);
    runTestRequest();
  };

  // 测试按钮点击入口
  const handleTest = () => {
    if (!config.isGlobalEnabled) {
      setShowGlobalOffWarning(true);
      return;
    }

    if (!apiConfig.isOpen) {
      message.warning(
        "单个 Mock 开关未打开，请先打开该接口的 Mock 开关后再测试",
      );
      return;
    }

    if (!apiConfig.redirectURL) {
      message.warning("该接口未配置 Mock 地址，请先配置 Mock 地址后再测试");
      return;
    }

    runTestRequest();
  };

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
            setTestModalVisible(false);
            resetTestResult();
          }
        }}
        footer={[
          <Button
            key="retry"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={runTestRequest}
            disabled={testLoading}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            重试
          </Button>,
          apifoxLink ? (
            <Button
              key="edit-mock"
              type="primary"
              icon={<ExportOutlined />}
              href={apifoxLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              去改 mock
            </Button>
          ) : null,
          <Button
            key="close"
            onClick={() => {
              setTestModalVisible(false);
              resetTestResult();
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
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="flex items-center gap-2 bg-white p-2 border-b border-gray-200">
                      <Input
                        allowClear
                        placeholder="搜索响应数据"
                        value={searchKeyword}
                        onChange={(event) =>
                          setSearchKeyword(event.target.value)
                        }
                        onPressEnter={(event) =>
                          handleSearchNavigation(event.shiftKey ? -1 : 1)
                        }
                        aria-label="搜索响应数据"
                      />
                      <Tooltip title="下一个匹配项 (Enter)">
                        <Button
                          aria-label="下一个匹配项"
                          icon={<DownOutlined />}
                          onClick={() => handleSearchNavigation(1)}
                          disabled={!searchMatches.length}
                        />
                      </Tooltip>
                      <Tooltip title="上一个匹配项 (Shift + Enter)">
                        <Button
                          aria-label="上一个匹配项"
                          icon={<UpOutlined />}
                          onClick={() => handleSearchNavigation(-1)}
                          disabled={!searchMatches.length}
                        />
                      </Tooltip>
                    </div>
                    <div className="bg-gray-50 p-3 text-sm font-mono max-h-80 overflow-y-auto leading-6">
                      {renderResponseValue(testResult.data, "$")}
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 border-t border-gray-200 text-xs">
                      <div className="min-w-0 text-gray-500">
                        {searchKeyword.trim() ? (
                          activeSearchMatch ? (
                            <>
                              <span className="mr-2 text-gray-400">
                                {activeSearchIndex + 1}/{searchMatches.length}
                              </span>
                              <span className="font-mono text-gray-700 break-all">
                                {activeSearchMatch.path}
                              </span>
                            </>
                          ) : (
                            "未找到匹配的字段"
                          )
                        ) : (
                          "输入关键词以查找字段路径"
                        )}
                      </div>
                      <Tooltip title="复制字段路径">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={handleCopySearchPath}
                          disabled={!activeSearchMatch}
                          aria-label="复制字段路径"
                        />
                      </Tooltip>
                    </div>
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
            <span className="text-orange-600 font-medium">
              仅调试单个接口：
            </span>
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
  );
};

export default TestButton;
