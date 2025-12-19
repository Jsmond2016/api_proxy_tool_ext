# API Proxy Tool - 需求文档

## 一、项目概述

### 1.1 项目定位

API Proxy Tool 是一个基于 Chrome Extension Manifest V3 开发的浏览器扩展工具，主要用于前端开发中的 API 接口代理和 Mock 数据管理。通过拦截浏览器中的 API 请求并重定向到指定的 Mock 服务器，帮助前端开发者在不修改代码的情况下快速切换不同的数据源进行开发和调试。

### 1.2 核心价值

- **提升开发效率**：快速配置 API 代理，无需修改代码即可切换 Mock 数据
- **模块化管理**：支持多项目、多模块的 API 配置管理
- **现代化界面**：基于 Ant Design 的直观操作界面
- **灵活配置**：支持多种匹配方式和自定义响应

### 1.3 技术架构

- **前端框架**：React 18.3.1 + TypeScript 5.8.3
- **UI 组件库**：Ant Design 5.26.5
- **样式框架**：TailwindCSS 4.1.8
- **构建工具**：Vite 6.3.5
- **状态管理**：Zustand 5.0.8
- **工具库**：ahooks 3.9.0, ramda 0.31.3
- **扩展规范**：Chrome Extension Manifest V3

---

## 二、核心功能需求

### 2.1 API 请求拦截与代理

#### 2.1.1 功能描述

自动拦截页面中的 API 请求，并根据配置规则将请求重定向到指定的 Mock 服务器或返回自定义响应数据。

#### 2.1.2 功能特性

- **请求拦截**：使用 Chrome `declarativeNetRequest` API 拦截 XMLHttpRequest 类型的网络请求
- **匹配方式**：支持三种 URL 匹配方式
  - `contains`：包含匹配（支持通配符 `*`）
  - `exact`：精确匹配
  - `regex`：正则表达式匹配
- **请求方法过滤**：支持按 HTTP 方法（GET、POST、PUT、DELETE、PATCH）进行过滤
- **代理方式**：
  - `redirect`：重定向到指定的 Mock URL
  - `mock`：直接返回自定义的响应数据（需配置 `mockResponseData`）
- **响应控制**：
  - 可配置响应状态码（默认 200）
  - 可配置响应延迟时间（毫秒），模拟真实网络环境
  - 支持自定义响应头（`requestHeaders`）

#### 2.1.3 技术实现

- 使用 `chrome.declarativeNetRequest.updateDynamicRules()` 动态更新拦截规则
- 规则优先级：1（固定值）
- 规则 ID：从 1 开始递增
- 支持规则签名检测，避免不必要的规则更新

#### 2.1.4 全局开关

- 提供全局总开关，控制所有代理功能是否生效
- 全局开关关闭时，清除所有拦截规则
- 全局开关状态通过扩展图标区分（启用：icon-32.png，禁用：dev-icon-32.png）

---

### 2.2 模块化管理

#### 2.2.1 功能描述

支持创建多个模块（Module），每个模块包含一组相关的 API 配置，用于组织和管理不同项目或功能的接口。

#### 2.2.2 模块属性

- **模块 ID**（`id`）：唯一标识符，自动生成
- **模块标识**（`apiDocKey`）：模块的业务标识，如 `order.management`
- **模块名称**（`label`）：显示名称，如 "订单管理模块"
- **API 文档 URL**（`apiDocUrl`）：关联的 API 文档地址（可选）
- **数据包装器**（`dataWrapper`）：响应数据包装器配置（可选）
- **页面域名**（`pageDomain`）：模块关联的页面域名（可选）
- **请求头**（`requestHeaders`）：模块级别的请求头配置（可选）
- **API 列表**（`apiArr`）：该模块下的所有 API 配置

#### 2.2.3 模块操作

- **创建模块**：
  - 点击模块标签页右侧的 "+" 按钮创建新模块
  - 自动生成模块 ID 和默认名称
  - 创建后自动切换到新模块
- **编辑模块**：
  - 点击模块标签页中的编辑图标
  - 可修改模块名称和标识
- **删除模块**：
  - 点击模块标签页的关闭按钮
  - 至少保留一个模块，不允许全部删除
  - 删除前需二次确认
  - 删除后自动切换到第一个模块
- **模块切换**：
  - 点击模块标签页切换
  - 切换后显示对应模块的 API 列表
  - 当前激活的模块 ID 会持久化保存

#### 2.2.4 模块开关

- 每个模块可独立控制开关状态
- 模块关闭时，该模块下所有 API 的拦截规则都会被移除
- 模块开关状态影响该模块下所有 API 的 `isOpen` 状态

---

### 2.3 API 接口管理

#### 2.3.1 API 配置属性

**基础信息**

- **API ID**（`id`）：唯一标识符，自动生成或从 Apifox 同步时使用接口 ID
- **API Key**（`apiKey`）：接口的业务标识，如 `/api/orders`
- **接口名称**（`apiName`）：接口的中文名称，如 "获取订单列表"
- **接口地址**（`apiUrl`）：原始 API 地址，支持相对路径和完整 URL
- **重定向地址**（`redirectURL`）：Mock 服务器地址
- **请求方法**（`method`）：GET、POST、PUT、DELETE、PATCH

**匹配配置**

- **匹配方式**（`filterType`）：contains、exact、regex
- **延迟时间**（`delay`）：响应延迟（毫秒）

**Mock 配置**

- **Mock 方式**（`mockWay`）：redirect（重定向）或 mock（直接返回数据）
- **Mock 响应数据**（`mockResponseData`）：当 `mockWay` 为 `mock` 时使用
- **状态码**（`statusCode`）：HTTP 响应状态码，默认 200

**扩展属性**

- **请求体**（`requestBody`）：请求体配置（可选）
- **请求头**（`requestHeaders`）：请求头配置（可选）
- **数组深度**（`arrDepth`）：Mock 数据数组深度（可选）
- **数组长度**（`arrLength`）：Mock 数据数组长度（可选）
- **权限点 Key**（`authPointKey`）：接口关联的权限点标识（可选）
- **页面路由**（`pageRoute`）：接口所属的页面路由（可选）
- **Tags**（`tags`）：接口标签列表，用于 Apifox 同步（可选）

**快速联调配置**（部分实现）

- **快速联调类型**（`quickMockType`）：none（无）、preset（预设响应）、custom（自定义响应）
- **快速联调 Key**（`quickMockKey`）：预设响应的配置 key
- **快速联调启用**（`quickMockEnabled`）：是否启用快速联调
- **自定义响应列表**（`customMockResponses`）：自定义响应配置列表
- **激活的自定义响应 Key**（`activeCustomMockKey`）：当前激活的自定义响应

#### 2.3.2 API 操作

**添加接口**

- 点击"添加"按钮打开表单抽屉
- 填写接口基本信息、匹配配置、Mock 配置等
- 支持配置快速联调（部分功能）
- 保存后立即生效

**编辑接口**

- 点击表格中的"编辑"按钮
- 打开表单抽屉，预填充当前接口数据
- 修改后保存更新

**克隆接口**

- 点击"其他操作"下拉菜单中的"克隆"选项
- 复制当前接口配置，生成新的接口（ID 自动生成）
- 新接口默认关闭状态

**删除接口**

- 点击"其他操作"下拉菜单中的"删除"选项
- 删除前需二次确认
- 删除后立即更新拦截规则

**迁移接口**

- 点击"其他操作"下拉菜单中的"迁移"选项
- 打开迁移弹窗
- 显示当前接口信息（名称、地址）
- 选择目标模块（排除当前模块）
- 确认后将接口从当前模块移动到目标模块
- 迁移后接口配置保持不变，仅改变所属模块

**测试接口**

- 点击接口方法标签旁的"测试"按钮
- 打开接口测试弹窗
- 支持配置请求参数、请求头
- 发送请求并显示响应结果

**开关控制**

- 每个接口都有独立的开关
- 支持批量开关：表格表头的开关控制当前模块所有接口
- 开关状态实时同步到拦截规则

**复制权限点**

- 点击表格中的"复制权限点"按钮（单个接口）
- 或点击"复制权限点"下拉菜单（批量操作）
- 弹出输入框，输入父级权限点 Key
- 生成权限点 JSON 并复制到剪贴板

---

### 2.4 Apifox 同步功能

#### 2.4.1 功能描述

从 Apifox 平台同步接口配置，支持基于 Tag 和状态筛选，自动生成模块和 API 配置。

#### 2.4.2 同步配置

**Apifox 地址配置**

- **Apifox URL**：Apifox 导出的 OpenAPI 3.0 格式的 Swagger JSON 地址
  - 格式示例：`http://127.0.0.1:4523/export/openapi/3?version=3.0`
  - 或：`http://127.0.0.1:4523/export/openapi?projectId=项目编号&specialPurpose=openapi-generator`
- **URL 验证**：填写后自动验证地址是否可访问，并解析 Swagger Schema
- **URL 缓存**：保存最近使用的 Apifox URL，方便下次使用

**Mock 地址前缀**

- 默认值：`http://127.0.0.1:4523/m1/3155205-1504204-default/`
- 支持自定义配置
- 用于生成接口的 `redirectURL`

**Tag 筛选**

- **Tag 选择器**：多选下拉框，选项来自 Swagger Schema 中的 `tags` 字段
- **Tag 历史**：保存最近选择的 Tag 组合，支持快速选择
- **Tag 冲突检测**：检测已存在的 Tag，提示用户选择合并策略

**状态筛选**

- 支持按接口状态筛选：
  - `developing`：开发中
  - `obsolete`：已废弃
  - `deprecated`：已弃用
  - `testing`：测试中
  - `released`：已发布
- 默认选择所有状态

**合并策略**

- **合并模式**（`merge`）：保留现有模块，追加新模块
- **替换模式**（`replace`）：替换所有 Apifox 来源的模块
- 当检测到 Tag 冲突时，必须选择合并策略

#### 2.4.3 同步流程

1. **配置 Apifox 地址**
   - 输入 Apifox URL
   - 自动验证并解析 Swagger Schema
   - 提取可用的 Tags 列表

2. **选择同步范围**
   - 选择要同步的 Tags（可选，不选则同步所有）
   - 选择接口状态（可选）
   - 配置 Mock 地址前缀

3. **预览同步结果**
   - 显示将要同步的接口数量
   - 显示接口摘要信息
   - 检测冲突和变化

4. **执行同步**
   - 解析 Swagger Schema，转换为模块配置
   - 根据 `x-apifox-fe-general-model-base-action-type` 字段分组
   - 生成权限点 Key（格式：分组名 + 接口路径最后一段）
   - 保存配置并更新拦截规则

#### 2.4.4 智能同步

**变化检测**

- 对比现有 Apifox 模块和新同步的模块
- 检测新增、删除、修改的接口
- 显示变化摘要表格

**冲突处理**

- 检测模块名称冲突
- 检测接口 URL 冲突
- 提示用户选择处理方式

**迭代信息管理**

- 支持配置迭代信息（需求文档、技术文档、原型文档）
- 按 Tag 分组展示迭代信息
- 在模块信息栏中显示相关文档链接

#### 2.4.5 数据转换规则

**模块生成**

- 根据 `x-apifox-fe-general-model-base-action-type` 字段分组
- 如果没有该字段，归入"默认分组"
- 模块 `apiDocUrl` 设置为 Apifox URL
- 模块 `apiDocKey` 从分组字段提取

**接口生成**

- `id`：使用 Apifox 接口 ID（如果可用）
- `apiKey`：从 Swagger `paths` 的 key 提取
- `apiName`：使用 Swagger `summary` 字段
- `apiUrl`：从 Swagger `paths` 的 key 提取
- `redirectURL`：Mock 前缀 + `apiUrl`
- `method`：从 Swagger `paths` 的方法提取并转大写
- `filterType`：默认 `contains`
- `tags`：从 Swagger `tags` 字段提取
- `authPointKey`：自动生成（分组名 + 接口路径最后一段）

---

### 2.5 权限点管理

#### 2.5.1 功能描述

根据接口配置自动生成权限点 JSON，用于后端权限系统的集成。

#### 2.5.2 权限点数据结构

```json
{
  "parentAuthPointKey": "GEN_PAGE_TODO_请填写父节点-authPointKey",
  "authPointApiUrl": "/demo/user/queryList",
  "authPointKey": "demoUserManagement-queryList",
  "authPointName": "获取用户列表",
  "type": "权限点",
  "priority": null,
  "children": null,
  "desc": "",
  "menuPath": "",
  "prefixPath": "",
  "systemDomain": ""
}
```

#### 2.5.3 权限点生成规则

**authPointApiUrl 提取规则**

- 从接口 URL 中提取，从 `/v1` 或 `/v2` 等版本号之后开始截取
- 示例：`/api/saas/v1/demo/user/queryList` → `/demo/user/queryList`

**authPointKey 生成规则**

- 格式：`分组名-接口路径最后一段`
- 示例：`demoUserManagement-queryList`
- 使用 kebab-case 命名规范

**authPointName**

- 直接使用接口名称（`apiName`）

**parentAuthPointKey**

- 用户手动输入
- 用于标识权限点的父级节点

#### 2.5.4 权限点操作

**单个接口复制**

- 点击表格中"权限点"列的复制按钮
- 弹出输入框，输入父级权限点 Key
- 生成权限点 JSON 并复制到剪贴板

**批量复制（模块级别）**

- 点击"复制权限点"下拉按钮
- 选择"复制所有权限点"或"复制勾选权限点"
- 弹出输入框，输入父级权限点 Key
- 生成权限点 JSON 数组并复制到剪贴板

**全局复制**

- 点击顶部导航栏的"复制所有权限点"按钮
- 弹出输入框，输入父级权限点 Key
- 生成所有模块的权限点 JSON 数组并复制到剪贴板

---

### 2.6 快速联调功能（部分实现）

#### 2.6.1 功能描述

支持快速切换不同的 Mock 响应数据，无需修改接口配置即可测试不同场景。

#### 2.6.2 快速联调类型

**无（none）**

- 不使用快速联调，使用正常的代理配置

**预设响应（preset）**

- 使用全局配置的快速联调模板
- 在"快速联调设置"中管理模板
- 接口配置中关联模板 Key
- 启用后使用模板的响应数据

**自定义响应（custom）**

- 接口级别的自定义响应列表
- 支持多个自定义响应场景
- 可切换激活的自定义响应
- 当前功能未完全实现

#### 2.6.3 快速联调设置

**模板管理**

- 添加、编辑、删除快速联调模板
- 模板包含：名称、Key、响应 JSON
- 模板可在多个接口中复用

**接口配置**

- 在接口编辑表单中配置快速联调
- 选择快速联调类型
- 关联预设模板或配置自定义响应

**注意**：由于 Manifest V3 的限制，`declarativeNetRequest` 无法直接返回自定义响应，快速联调的完整功能需要后续优化实现。

---

### 2.7 导入导出功能

#### 2.7.1 导出功能

**导出格式**

- JSON 格式文件
- 文件名格式：`proxy-config-YYYY-MM-DD.json`
- 包含所有模块和接口配置

**导出内容**

- 模块配置：`apiDocKey`、`label`、`apiDocUrl`、`dataWrapper`、`pageDomain`、`requestHeaders`
- 接口配置：所有接口属性（除 `id` 外）

**导出操作**

- 点击顶部导航栏的"导出"按钮
- 自动下载 JSON 文件

#### 2.7.2 导入功能

**导入格式**

- 支持 JSON 格式文件
- 格式需符合 `example-config.json` 的结构

**导入模式**

- **替换模式**：清空现有配置，使用导入的配置
- **追加模式**：保留现有配置，追加导入的配置
- 智能判断：如果只有默认模块，自动使用替换模式

**冲突检测**

- 检测模块名称重复
- 检测接口 URL 重复
- 显示冲突警告，用户可选择是否继续

**导入流程**

1. 点击"导入"按钮
2. 选择 JSON 文件
3. 解析并验证文件格式
4. 检测冲突
5. 选择导入模式（如有非默认模块）
6. 执行导入
7. 显示导入结果

---

### 2.8 搜索与筛选

#### 2.8.1 全局搜索功能

**搜索范围**

- 接口名称（`apiName`）
- 接口地址（`apiUrl`）
- 重定向地址（`redirectURL`）
- 模块名称（`moduleName`）

**搜索方式**

- 使用 AutoComplete 组件，支持自动补全
- 实时搜索：输入关键词即时过滤
- 不区分大小写
- 支持部分匹配
- 跨模块搜索：搜索所有模块的接口

**搜索结果展示**

- 显示接口名称（加粗）
- 显示接口地址（灰色小字）
- 显示所属模块（蓝色小字）
- 支持键盘导航选择

**搜索交互**

- 点击搜索结果后：
  1. 自动切换到接口所属的模块
  2. 清空搜索关键词
  3. 高亮显示目标接口（3 秒后自动清除）
  4. 自动滚动到目标接口位置
  5. 如果接口不在当前页，自动跳转到对应页码

#### 2.8.2 模块内搜索功能

**搜索范围**

- 当前模块内的接口
- 接口名称（`apiName`）
- 接口地址（`apiUrl`）
- 重定向地址（`redirectURL`）
- 页面路由（`pageRoute`）

**搜索方式**

- 实时搜索：输入关键词即时过滤表格数据
- 不区分大小写
- 支持部分匹配

**搜索状态**

- 搜索关键词持久化保存
- 切换模块后保持搜索状态

#### 2.8.3 接口高亮功能

**高亮触发**

- 全局搜索选择结果后自动触发
- 通过程序设置 `highlightApiId` 触发

**高亮效果**

- 目标接口行背景色变为黄色（`bg-yellow-100`）
- 平滑过渡动画（`transition-colors duration-500`）
- 自动滚动到目标位置（`scrollIntoView`）
- 3 秒后自动清除高亮

**高亮逻辑**

- 检测目标接口是否在当前过滤列表中
- 如果不在当前页，自动计算并跳转到对应页码
- 延迟 300ms 后执行滚动，确保页面已渲染

#### 2.8.4 筛选功能

**状态筛选**（预留）

- 全部、已启用、已禁用
- 当前版本未完全实现

**模块筛选**（预留）

- 按模块筛选接口
- 当前版本未完全实现

---

### 2.9 接口测试功能

#### 2.9.1 功能描述

在配置页面直接测试接口，验证代理配置是否正确。

#### 2.9.2 测试功能

- 点击接口方法标签旁的"测试"按钮
- 打开测试弹窗
- 配置请求参数、请求头
- 发送请求
- 显示响应结果、状态码、响应时间

---

### 2.10 模块重置功能

#### 2.10.1 模块重置

- 点击"重置模块"按钮
- 清空当前模块的所有接口配置
- 需二次确认

#### 2.10.2 全局重置

- 点击顶部导航栏的"重置"按钮
- 清空所有模块和接口配置
- 恢复默认模块
- 需二次确认

---

## 三、用户界面需求

### 3.1 整体布局

#### 3.1.1 页面结构

- **顶部导航栏**（64px 高度）
  - 左侧：全局搜索选择器（AutoComplete，宽度 650px）
  - 右侧：全局开关、同步 Apifox、导入、导出、复制所有权限点、重置等按钮
- **模块标签页区域**
  - 显示所有模块标签
  - 支持添加、编辑、删除模块
- **模块信息栏**（可选显示）
  - 显示当前模块的接口 Tags
  - 显示迭代信息（需求文档、技术文档、原型文档）
- **操作按钮栏**
  - 添加接口、复制权限点（下拉）、重置模块
- **主要内容区域**
  - API 表格
  - 分页控件
- **页脚**
  - 显示项目信息、版本号、作者链接

#### 3.1.2 响应式设计

- 支持不同屏幕尺寸
- 表格支持横向滚动
- 内容区域高度自适应

### 3.2 组件设计

#### 3.2.1 表格设计

- **列定义**：
  - 序号
  - 开关（表头支持批量操作）
  - 请求方式（标签 + 测试按钮）
  - 接口信息（名称、接口地址、Mock URL，支持复制）
  - 权限点（支持复制）
  - 页面路由（支持跳转）
  - 代理设置（匹配方式）
  - 操作（编辑、其他操作下拉菜单）

#### 3.2.2 表单设计

- **接口编辑表单**（抽屉形式）
  - 基础信息：接口名称、接口地址、重定向地址、请求方法
  - 匹配配置：匹配方式、延迟时间
  - Mock 配置：Mock 方式、响应数据、状态码
  - 扩展配置：权限点、页面路由、请求头、请求体
  - 快速联调配置（部分功能）

- **模块编辑表单**（弹窗形式）
  - 模块名称
  - 模块标识

#### 3.2.3 弹窗设计

- **同步 Apifox 弹窗**
  - Apifox URL 输入和验证
  - Tag 选择器（多选）
  - 状态筛选
  - Mock 地址前缀配置
  - 接口预览表格
  - 冲突检测提示

- **导入弹窗**
  - 文件选择
  - 文件内容预览
  - 导入模式选择

- **权限点复制弹窗**
  - 父级权限点 Key 输入
  - 权限点预览
  - 复制按钮

### 3.3 交互设计

#### 3.3.1 操作反馈

- 成功操作：显示成功提示（message.success）
- 失败操作：显示错误提示（message.error）
- 警告操作：显示警告提示（message.warning）
- 确认操作：使用 Modal.confirm 二次确认

#### 3.3.2 状态指示

- 全局开关状态：通过扩展图标区分
- 接口开关状态：表格中的 Switch 组件
- 模块开关状态：模块信息栏中的 Switch
- 高亮显示：支持接口高亮（3 秒后自动清除）

#### 3.3.3 快捷操作

- 复制功能：支持一键复制接口地址、Mock URL、权限点
- 跳转功能：支持跳转到 Apifox Web 版、页面路由
- 批量操作：支持批量开关、批量复制权限点

---

## 四、数据存储需求

### 4.1 存储方式

- 使用 Chrome Storage API（`chrome.storage.local`）
- 存储键名：`globalConfig`

### 4.2 存储内容

- 全局配置（`GlobalConfig`）
  - 全局开关状态（`isGlobalEnabled`）
  - 模块列表（`modules`）
  - Apifox 配置（`apifoxConfig`）
  - 快速联调配置列表（`quickMockConfigs`）

### 4.3 持久化状态

- 使用 Zustand 的 persist 中间件
- 配置数据持久化到 Chrome Storage
- 激活模块 ID 持久化到 localStorage
- 搜索关键词持久化到 localStorage
- 选中的 API IDs 持久化到 localStorage

### 4.4 缓存数据

- Apifox URL 缓存
- Tag 选择历史
- 迭代信息缓存（`apifox-iteration-info`）

---

## 五、技术实现需求

### 5.1 扩展权限

- `activeTab`：访问当前标签页
- `storage`：存储配置数据
- `declarativeNetRequest`：拦截网络请求
- `declarativeNetRequestFeedback`：获取请求反馈
- `host_permissions`：`http://*/*`, `https://*/*`, `<all_urls>`

### 5.2 Background Script

- Service Worker 类型（Manifest V3）
- 处理配置管理
- 更新拦截规则
- 处理消息通信
- 更新扩展图标

### 5.3 Options Page

- 全屏配置页面
- React 应用
- 使用 Ant Design 组件库
- 使用 TailwindCSS 样式

### 5.4 消息通信

- Background Script 与 Options Page 通过 `chrome.runtime.sendMessage` 通信
- 消息类型：
  - `getConfig`：获取配置
  - `updateConfig`：更新配置
  - `toggleGlobal`：切换全局开关
  - `toggleModule`：切换模块开关
  - `toggleApi`：切换接口开关
  - `updateIcon`：更新图标

---

## 六、性能与优化需求

### 6.1 规则更新优化

- 使用规则签名检测，避免不必要的规则更新
- 批量更新规则，减少 API 调用次数

### 6.2 状态管理优化

- 使用 Zustand 进行轻量级状态管理
- 避免不必要的状态更新
- 使用函数式更新避免闭包问题

### 6.3 渲染优化

- 使用 React.memo 优化组件渲染
- 使用 useMemo 和 useCallback 优化计算和函数

---

## 七、兼容性需求

### 7.1 浏览器支持

- Chrome >= 88.0.0（支持 Manifest V3）
- Firefox >= 109.0.0（支持 Manifest V3）
- Edge >= 88.0.0（Chromium 内核）
- 其他基于 Chromium 的浏览器

### 7.2 平台支持

- Windows
- macOS
- Linux

---

## 八、安全需求

### 8.1 权限最小化

- 仅申请必要的权限
- 不使用已废弃的 API（如 webRequest）

### 8.2 数据安全

- 配置数据仅存储在本地
- 不向第三方服务器发送用户数据
- 支持用户导出和删除数据

---

## 九、用户体验需求

### 9.1 易用性

- 直观的操作界面
- 清晰的操作反馈
- 完善的错误提示
- 详细的操作说明

### 9.2 可访问性

- 支持键盘操作
- 清晰的视觉反馈
- 合理的焦点管理

### 9.3 国际化

- 当前版本支持中文界面
- 预留国际化扩展能力

---

## 十、未来扩展需求

### 10.1 功能扩展

- 完善快速联调功能
- 支持更多 Mock 数据生成规则
- 支持接口分组和排序
- 支持接口历史记录
- 支持接口性能监控

### 10.2 集成扩展

- 支持更多 API 文档平台同步
- 支持 Postman、Swagger 等格式导入
- 支持团队协作和配置共享

### 10.3 界面优化

- 支持暗色主题
- 支持自定义主题
- 优化移动端体验

---

## 十一、UI 设计提示

### 11.1 设计原则

- **简洁明了**：界面简洁，信息层次清晰
- **一致性**：遵循 Ant Design 设计规范
- **易用性**：操作流程顺畅，减少用户学习成本
- **反馈及时**：操作后立即给出反馈

### 11.2 色彩方案

- 主色调：Ant Design 默认蓝色系
- 功能色：
  - 成功：绿色
  - 警告：橙色
  - 错误：红色
  - 信息：蓝色
- 中性色：灰色系用于文本和边框

### 11.3 布局建议

- **顶部导航栏**：固定高度，深色背景（gray-800），白色文字
- **模块标签页**：浅色背景，支持多标签切换
- **模块信息栏**：信息提示样式（Alert），浅色背景
- **操作按钮栏**：右对齐，按钮间距合理
- **表格区域**：白色背景，支持滚动，斑马纹行
- **页脚**：浅色背景（gray-50），居中对齐

### 11.4 组件使用建议

- **按钮**：主要操作使用 Primary 按钮，次要操作使用 Default 按钮
- **表格**：使用 Ant Design Table 组件，支持排序、筛选、分页
- **表单**：使用 Drawer 或 Modal 承载表单，分组展示字段
- **提示**：使用 Message 组件显示操作反馈，使用 Modal.confirm 进行确认
- **标签**：使用 Tag 组件显示状态和分类信息

### 11.5 交互细节

- **悬停效果**：按钮、链接等可交互元素添加悬停效果
- **加载状态**：异步操作显示加载状态
- **禁用状态**：不可用操作显示禁用状态
- **高亮效果**：重要信息使用高亮显示，接口高亮使用黄色背景（bg-yellow-100）
- **动画效果**：页面切换、弹窗打开等使用平滑动画
- **滚动定位**：搜索后自动滚动到目标位置，使用平滑滚动（smooth）
- **自动聚焦**：搜索框支持键盘操作，搜索结果支持键盘导航

---

## 十二、数据流程图

### 12.1 配置更新流程

```
用户操作 → Options Page → chrome.runtime.sendMessage → Background Script
→ 更新内存配置 → 保存到 Chrome Storage → 更新拦截规则 → 更新图标
→ 返回响应 → Options Page 更新 UI
```

### 12.2 请求拦截流程

```
页面发起请求 → Chrome 浏览器 → declarativeNetRequest 规则匹配
→ 匹配成功 → 重定向到 Mock URL → 返回响应 → 页面接收响应
```

### 12.3 Apifox 同步流程

```
用户输入 Apifox URL → 验证 URL → 获取 Swagger Schema → 解析 Schema
→ 提取 Tags 和接口信息 → 用户选择同步范围 → 转换为模块配置
→ 检测冲突 → 用户确认 → 保存配置 → 更新拦截规则
```

---

## 附录：数据结构定义

### A.1 GlobalConfig

```typescript
interface GlobalConfig {
  isGlobalEnabled: boolean;
  modules: ModuleConfig[];
  apifoxConfig?: ApifoxConfig;
  quickMockConfigs?: QuickMockConfig[];
}
```

### A.2 ModuleConfig

```typescript
interface ModuleConfig {
  id: string;
  apiDocKey: string;
  label: string;
  apiDocUrl?: string;
  dataWrapper?: string;
  pageDomain?: string;
  requestHeaders?: string;
  apiArr: ApiConfig[];
}
```

### A.3 ApiConfig

```typescript
interface ApiConfig {
  id: string;
  apiKey: string;
  apiName: string;
  apiUrl: string;
  redirectURL: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  filterType: "contains" | "exact" | "regex";
  delay: number;
  isOpen: boolean;
  mockWay: "redirect" | "mock";
  mockResponseData?: string;
  requestBody?: string;
  requestHeaders?: string;
  statusCode: number;
  arrDepth?: number;
  arrLength?: number;
  authPointKey?: string;
  pageRoute?: string;
  quickMockType?: "none" | "preset" | "custom";
  quickMockKey?: string;
  quickMockEnabled?: boolean;
  customMockResponses?: QuickMockConfig[];
  activeCustomMockKey?: string;
  tags?: string[];
}
```

---

**文档版本**：v1.0
**最后更新**：2025年
**维护者**：开发团队
