# API Proxy Tool - Chrome Extension

一个功能强大的Chrome扩展，用于拦截和重定向API请求到Mock服务器。

## 功能特性

### 🎯 核心功能
- **API请求拦截**: 自动拦截页面中的API请求并重定向到指定的Mock URL
- **模块化管理**: 支持创建多个模块来分类管理不同的API配置
- **灵活匹配**: 支持多种URL匹配方式（contains、exact、regex）
- **延迟控制**: 可配置API响应延迟时间，模拟真实网络环境

### 🔧 管理功能
- **接口管理**: 添加、编辑、删除、克隆API配置
- **批量操作**: 支持模块级别的批量开关和重置
- **导入导出**: 支持JSON格式的配置导入导出
- **全局控制**: 一键开启/关闭所有代理功能

### 🎨 用户界面
- **现代化UI**: 基于Ant Design的现代化界面设计
- **响应式布局**: 适配不同屏幕尺寸
- **实时搜索**: 支持按接口名称和地址快速搜索
- **直观操作**: 拖拽排序、一键复制等便捷操作

## 安装使用

### 开发环境
```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build
```

### 安装扩展
1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist_chrome` 目录

## 使用指南

### 1. 创建模块
- 点击模块标签页右侧的"+"按钮
- 输入模块名称（如：order.management）
- 模块创建后会自动切换到新模块

### 2. 添加API配置
- 在模块中点击"添加"按钮
- 填写以下信息：
  - **接口地址**: 原始API地址（支持相对路径和完整URL）
  - **重定向地址**: Mock服务器地址
  - **接口名称**: 便于识别的名称
  - **请求方式**: GET、POST、PUT、DELETE、PATCH
  - **匹配方式**: contains（包含）、exact（精确）、regex（正则）
  - **延迟时间**: 响应延迟（毫秒）

### 3. 管理API
- **开关控制**: 点击开关按钮启用/禁用单个API
- **编辑**: 点击"编辑"按钮修改API配置
- **克隆**: 点击"克隆"按钮快速复制API配置
- **删除**: 点击"删除"按钮移除API配置

### 4. 全局控制
- **全局开关**: 顶部开关控制所有代理功能
- **模块开关**: 可单独控制某个模块的代理
- **重置功能**: 支持模块重置和全局重置

### 5. 导入导出
- **导出**: 点击"导出"按钮下载当前配置为JSON文件
- **导入**: 点击"导入"按钮上传JSON配置文件

## 配置格式

### 导入格式示例
```json
[
  {
    "apiDocKey": "order.management",
    "label": "订单管理",
    "apiArr": [
      {
        "apiKey": "/api/orders",
        "apiName": "获取订单列表",
        "apiUrl": "http://localhost:3000/api/orders",
        "redirectURL": "http://127.0.0.1:4523/mock/api/orders",
        "method": "get",
        "filterType": "contains",
        "delay": 0,
        "isOpen": true,
        "mockWay": "redirect",
        "statusCode": 200
      }
    ]
  }
]
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design 5.x
- **构建工具**: Vite 6.x
- **包管理**: pnpm
- **样式**: Tailwind CSS

## 项目结构

```
src/
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
├── pages/
│   ├── background/        # Background Script
│   ├── popup/            # 弹窗界面
│   │   └── components/   # 弹窗组件
│   ├── content/          # Content Script
│   └── options/          # 选项页面
└── assets/               # 静态资源
```

## 开发说明

### 添加新功能
1. 在 `src/types/index.ts` 中定义类型
2. 在 `src/utils/` 中添加工具函数
3. 在 `src/pages/popup/components/` 中创建组件
4. 更新主界面集成新功能

### 调试技巧
- 使用Chrome DevTools查看Background Script日志
- 在popup界面使用React DevTools
- 检查Network面板查看请求拦截效果

## 注意事项

1. **权限要求**: 扩展需要访问所有网站权限来拦截API请求
2. **HTTPS限制**: 某些HTTPS网站可能限制扩展功能
3. **性能影响**: 大量API拦截可能影响页面性能
4. **数据安全**: 请勿在生产环境使用敏感数据的Mock配置

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！
