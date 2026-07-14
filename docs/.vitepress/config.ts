import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/api_proxy_tool_ext/",
  lang: "zh-CN",
  title: "API Proxy Tool",
  description: "Chrome & Firefox 扩展 — 拦截并重定向 API 请求到 Mock 服务器",
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: [
    /^\.\/README_CN/,
    /^\.\/%E6%89%A9%E5%B1%95/,
    /^\.\/%E9%9C%80%E6%B1%82/,
  ],

  head: [
    ["link", { rel: "icon", href: "/api_proxy_tool_ext/logo.png" }],
    ["meta", { name: "theme-color", content: "#1677FF" }],
  ],

  themeConfig: {
    logo: "/logo.png",

    nav: [
      { text: "首页", link: "/", activeMatch: "^/$" },
      { text: "快速开始", link: "/guide/getting-started" },
      {
        text: "功能指南",
        link: "/guide/extension-usage",
        activeMatch: "^/guide/(?!getting-started)",
      },
      { text: "更新日志", link: "/changelog/", activeMatch: "^/changelog/" },
      {
        text: "项目资料",
        items: [
          {
            text: "项目与集成",
            items: [
              {
                text: "项目概览",
                link: "https://github.com/Jsmond2016/api_proxy_tool_ext",
              },
              { text: "集成接口", link: "/api-reference/" },
            ],
          },
          {
            text: "开发与维护",
            items: [
              { text: "开发指南", link: "/developer-guide/" },
              { text: "架构设计", link: "/architecture/" },
              { text: "发布指南", link: "/publishing/" },
            ],
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "用户指南",
          items: [
            { text: "指南概览", link: "/guide/" },
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "功能使用指南", link: "/guide/extension-usage" },
          ],
        },
        {
          text: "按功能查找",
          collapsed: false,
          items: [
            {
              text: "模块与接口管理",
              link: "/guide/extension-usage#模块与接口管理",
            },
            { text: "Apifox 同步", link: "/guide/extension-usage#apifox-同步" },
            { text: "迭代信息", link: "/guide/extension-usage#迭代信息" },
            { text: "存档与恢复", link: "/guide/extension-usage#存档与恢复" },
            { text: "权限点复制", link: "/guide/extension-usage#权限点复制" },
            {
              text: "跨扩展 Quick Mock",
              link: "/guide/extension-usage#跨扩展批量-quick-mock",
            },
          ],
        },
      ],

      "/developer-guide/": [
        {
          text: "开发指南",
          items: [
            { text: "近期改动说明", link: "/developer-guide/recent-changes" },
            { text: "AI 开发环境", link: "/developer-guide/ai-environment" },
            { text: "提交规范", link: "/developer-guide/commit-convention" },
            { text: "AI 协作规范", link: "/developer-guide/agents" },
          ],
        },
      ],

      "/architecture/": [
        {
          text: "架构设计",
          items: [
            { text: "技术架构", link: "/architecture/stack-architecture" },
            { text: "UI 设计规范", link: "/architecture/design" },
            {
              text: "跨插件 QuickMock 方案",
              link: "/architecture/quick-mock-plan",
            },
            {
              text: "Quick Mock 持久缓存",
              link: "/architecture/quick-mock-persistent-cache-fix-plan",
            },
            {
              text: "批量 Quick Mock 性能优化",
              link: "/cross-extension-batch-mock-performance-optimization",
            },
          ],
        },
      ],

      "/api-reference/": [
        {
          text: "接口文档",
          items: [
            { text: "固定 ID 配置", link: "/api-reference/fixed-id-config" },
            {
              text: "跨插件批量 QuickMock 联调",
              link: "/api-reference/quick-mock-debug",
            },
          ],
        },
      ],

      "/publishing/": [
        {
          text: "发布指南",
          collapsed: false,
          items: [
            { text: "发布流程", link: "/publishing/release-guide" },
            { text: "修复发布问题", link: "/publishing/fix-release" },
            { text: "商店提交流程", link: "/publishing/store-submission" },
            { text: "隐私声明", link: "/publishing/privacy" },
          ],
        },
        {
          text: "商店 Listing",
          collapsed: true,
          items: [
            { text: "Chrome 商店描述", link: "/publishing/chrome-listing" },
            { text: "Edge 商店描述", link: "/publishing/edge-listing" },
            { text: "Edge 测试者信息", link: "/publishing/edge-tester-info" },
            { text: "Edge 市场描述", link: "/publishing/market-description" },
          ],
        },
      ],

      "/templates/": [
        {
          text: "AI 模板",
          items: [
            { text: "Chrome 扩展模板", link: "/templates/chrome-extension" },
            { text: "组件模板", link: "/templates/component" },
            { text: "Hook 模板", link: "/templates/hook" },
            { text: "状态管理模板", link: "/templates/state-management" },
          ],
        },
      ],

      "/changelog/": [
        {
          text: "更新日志",
          items: [
            { text: "概述", link: "/changelog/" },
            { text: "v1.5.x", link: "/changelog/v1-5" },
            {
              text: "Changelog 自动化方案",
              link: "/changelog/automation-summary",
            },
            { text: "简化 Changelog 方案", link: "/changelog/simplified-plan" },
          ],
        },
      ],
    },

    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    returnToTopLabel: "返回顶部",

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Jsmond2016/api_proxy_tool_ext",
      },
    ],

    footer: {
      message: "基于 MIT 协议开源",
      copyright: `Copyright 2024-${new Date().getFullYear()} Jsmond2016`,
    },

    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                noResultsText: "未找到相关结果",
                resetButtonTitle: "清除搜索条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },

    outline: { label: "页面导航", level: [2, 3] },

    editLink: {
      pattern:
        "https://github.com/Jsmond2016/api_proxy_tool_ext/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
  },
});
