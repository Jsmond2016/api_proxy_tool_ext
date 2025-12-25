/**
 * 全局响应拦截器 - 注入到页面上下文
 * 这个脚本会被注入到页面的 JavaScript 上下文中，以便拦截页面的 fetch 和 XHR 请求
 */

(function () {
  "use strict";

  // 避免重复注入
  if (window.__GLOBAL_RESPONSE_INJECTED__) {
    return;
  }
  window.__GLOBAL_RESPONSE_INJECTED__ = true;

  console.log("[Global Response Injector] Script injected into page context");

  // 保存原始方法
  const originalFetch = window.fetch.bind(window);
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  // 存储待处理的请求
  const pendingRequests = {};
  let requestId = 0;

  // 监听来自 content script 的消息
  window.addEventListener("message", function (event) {
    if (event.source !== window) return;

    if (event.data.type === "GLOBAL_RESPONSE_RESPONSE") {
      const data = event.data;
      const pending = pendingRequests[data.id];
      if (pending) {
        pending.resolve({
          shouldIntercept: data.shouldIntercept,
          globalResponseId: data.globalResponseId,
          responseData: data.responseData,
        });
        delete pendingRequests[data.id];
      }
    }
  });

  // 向 content script 发送消息并等待响应
  function checkInterceptRequest(url) {
    return new Promise(function (resolve) {
      const id = ++requestId;
      pendingRequests[id] = { resolve: resolve };

      window.postMessage(
        {
          type: "GLOBAL_RESPONSE_CHECK",
          id: id,
          url: url,
        },
        "*",
      );

      // 超时处理 - 200ms
      setTimeout(function () {
        if (pendingRequests[id]) {
          delete pendingRequests[id];
          resolve({ shouldIntercept: false });
        }
      }, 200);
    });
  }

  // 获取状态码对应的状态文本
  function getStatusText(status) {
    const statusTexts = {
      200: "OK",
      201: "Created",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
    };
    return statusTexts[status] || "OK";
  }

  // 拦截 fetch 请求
  window.fetch = function (input, init) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : "";

    console.log("[Global Response Injector] Fetch request:", url);

    return checkInterceptRequest(url)
      .then(function (result) {
        console.log("[Global Response Injector] Check result:", result);

        if (result.shouldIntercept && result.responseData) {
          console.log("[Global Response Injector] Intercepting fetch:", url);

          // 处理延迟
          const delay = result.responseData.delay || 0;
          return new Promise(function (resolve) {
            setTimeout(function () {
              // 解析响应 JSON
              let responseData;
              try {
                responseData = JSON.parse(result.responseData.responseJson);
              } catch (e) {
                responseData = {
                  error: "Invalid JSON in global response",
                };
              }

              // 返回响应
              resolve(
                new Response(JSON.stringify(responseData), {
                  status: result.responseData.statusCode || 200,
                  statusText: getStatusText(
                    result.responseData.statusCode || 200,
                  ),
                  headers: {
                    "Content-Type": "application/json",
                  },
                }),
              );
            }, delay);
          });
        }

        return originalFetch(input, init);
      })
      .catch(function (error) {
        console.error("[Global Response Injector] Error:", error);
        return originalFetch(input, init);
      });
  };

  // 拦截 XMLHttpRequest
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password,
  ) {
    this._globalResponseUrl = typeof url === "string" ? url : url.href;
    this._globalResponseMethod = method;
    return originalXHROpen.call(
      this,
      method,
      url,
      async !== false,
      user || null,
      password || null,
    );
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;
    const url = xhr._globalResponseUrl || "";

    console.log("[Global Response Injector] XHR request:", url);

    checkInterceptRequest(url)
      .then(function (result) {
        console.log("[Global Response Injector] XHR check result:", result);

        if (result.shouldIntercept && result.responseData) {
          console.log("[Global Response Injector] Intercepting XHR:", url);

          // 处理延迟
          const delay = result.responseData.delay || 0;
          setTimeout(function () {
            // 解析响应 JSON
            let responseData;
            try {
              responseData = JSON.parse(result.responseData.responseJson);
            } catch (e) {
              responseData = {
                error: "Invalid JSON in global response",
              };
            }

            // 模拟响应
            Object.defineProperty(xhr, "status", {
              value: result.responseData.statusCode || 200,
              writable: false,
              configurable: true,
            });
            Object.defineProperty(xhr, "statusText", {
              value: getStatusText(result.responseData.statusCode || 200),
              writable: false,
              configurable: true,
            });
            Object.defineProperty(xhr, "responseText", {
              value: JSON.stringify(responseData),
              writable: false,
              configurable: true,
            });
            Object.defineProperty(xhr, "response", {
              value: JSON.stringify(responseData),
              writable: false,
              configurable: true,
            });
            Object.defineProperty(xhr, "readyState", {
              value: XMLHttpRequest.DONE,
              writable: false,
              configurable: true,
            });

            // 触发事件
            if (xhr.onreadystatechange) {
              xhr.onreadystatechange(new Event("readystatechange"));
            }
            if (xhr.onload) {
              xhr.onload(new ProgressEvent("load"));
            }
            xhr.dispatchEvent(new Event("readystatechange"));
            xhr.dispatchEvent(new ProgressEvent("load"));
          }, delay);
        } else {
          // 不拦截，发送原始请求
          originalXHRSend.call(xhr, body);
        }
      })
      .catch(function () {
        // 出错时发送原始请求
        originalXHRSend.call(xhr, body);
      });
  };

  console.log("[Global Response Injector] Interception setup complete");
})();
