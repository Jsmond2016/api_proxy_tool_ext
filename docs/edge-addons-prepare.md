# Edge Add-ons 发布准备文档

适用于 Manifest V3 扩展「API Proxy Tool」的 Microsoft Edge 加载项商店发布指南。

---

## 一、前置条件

### 1.1 开发者账号

- 注册地址：https://partner.microsoft.com/
- 使用 Microsoft 账号登录
- **无需注册费**（与 Chrome Web Store 不同，Edge Add-ons 免费注册）
- 首次使用需要完成合作伙伴中心资料填写（发布者名称、联系信息等）
- 提交扩展前可先完善发布者资料

### 1.2 与 Chrome Web Store 的关键差异

| 项目         | Chrome Web Store           | Edge Add-ons             |
| ------------ | -------------------------- | ------------------------ |
| 开发者注册费 | 一次性缴费 ($5 USD)        | 免费                     |
| 审核周期     | 通常数小时到 1 天          | 通常 1-2 个工作日        |
| 构建产物     | 通用 MV3                   | 通用 MV3（可复用）       |
| 提交流程     | Chrome Developer Dashboard | Microsoft Partner Center |
| 年龄分级     | 无需单独声明               | 必须选择分级（建议 3+）  |
| 搜索关键词   | 有限支持                   | 支持自定义关键词         |

### 1.3 环境要求

```bash
node >= 22.17.0
pnpm >= 10.5.2
```

---

## 二、构建与打包

### 2.1 构建产物复用

Edge Add-ons 可直接使用 Chrome 构建产物，无需单独构建：

```bash
# 使用 Chrome 构建（通用 MV3）
pnpm build:chrome
```

构建产物输出到 `dist_chrome/` 目录，完全兼容 Edge。

### 2.2 打包 ZIP

```bash
cd dist_chrome && zip -r ../extension-v$(node -p "require('../package.json').version").zip . && cd ..
```

注意事项：

- 与 Chrome 使用相同的 ZIP 包
- ZIP 包根目录必须直接包含 `manifest.json`
- Edge 对 ZIP 包大小限制为 500MB（实际构建产物远小于此限制）

---

## 三、商店信息填写

### 3.1 基础信息

| 字段           | 要求                              | 内容                                          |
| -------------- | --------------------------------- | --------------------------------------------- |
| **扩展名称**   | 与 `manifest.json` 中 `name` 一致 | API Proxy Tool                                |
| **摘要**       | 132 字符以内，一句话描述          | API 请求拦截与 Mock 数据管理工具              |
| **详细描述**   | 详细功能列表，建议分项说明        | 参见下方模板                                  |
| **类别**       | 从商店分类中选择                  | Developer Tools                               |
| **定价**       | 必选                              | 免费                                          |
| **可见性**     | 公开/隐藏                         | 公开                                          |
| **年龄分级**   | Microsoft 标准分级                | 3+（适合所有年龄）                            |
| **搜索关键词** | 逗号分隔，提高搜索匹配度          | API Proxy, Mock, 前端开发, API 拦截, 代理工具 |

### 3.2 详细描述模板

**英文描述**（Edge 主要面向全球市场，建议优先完善英文描述）：

可参考 `docs/edge-market-description.md` 中的内容，核心要点：

- 首段概括工具用途和价值
- 用项目符号列出核心功能
- 明确使用场景和适用人群
- 结尾引导用户使用

**中文描述**：

在英文描述下方或单独的语言版本中添加中文内容，结构与英文一致。

### 3.3 权限用途说明

当前 `manifest.json` 中声明的权限及用途逐条说明（与 Chrome Web Store 保持一致）：

| 权限                            | 用途说明                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| `activeTab`                     | 获取当前活动标签页的 URL 信息，仅在用户点击扩展图标时临时生效 |
| `storage`                       | 持久化存储用户的模块配置和 API 规则                           |
| `declarativeNetRequest`         | 使用声明式规则拦截和重定向 API 请求，不读取请求/响应体        |
| `declarativeNetRequestFeedback` | 获取规则匹配结果用于界面展示                                  |
| `<all_urls>`                    | 支持用户在配置中自定义需要拦截的域名范围                      |

### 3.4 数据隐私说明

Edge Add-ons 对隐私声明的要求与 Chrome 类似，需提交：

```
数据收集与使用声明：

1. This extension does NOT collect, upload, or share any user data to remote servers.
2. All data is processed locally in the browser and never leaves the user's device.
3. User configurations are stored via chrome.storage.sync for syncing across browsers signed into the same Microsoft account.
4. This extension does NOT read or store browsing history, bookmarks, passwords, or other personal information.
5. No data is sent to any third-party services.
6. No remote code is executed; all code is packaged within the extension.
```

注意：Edge 的隐私声明问卷包含多项选择题，需逐项回答：

- 是否收集个人数据？→ **否**
- 是否使用加密？→ **否（不传输数据）**
- 是否需要数据保护影响评估？→ **否**
- 是否为儿童设计或吸引儿童？→ **否**

---

## 四、图片素材要求

### 4.1 扩展图标

| 尺寸    | 文件           | 说明                     |
| ------- | -------------- | ------------------------ |
| 128x128 | `icon-128.png` | 商店列表、详情页展示图标 |
| 32x32   | `icon-32.png`  | 浏览器工具栏、标签页图标 |

### 4.2 商店截图

| 规格 | 要求                   |
| ---- | ---------------------- |
| 尺寸 | 1280x800 PNG           |
| 数量 | 至少 1 张，建议 3-5 张 |
| 内容 | 展示扩展核心功能和界面 |

Edge 对截图的要求与 Chrome Web Store 基本一致，可复用同一套截图。

### 4.3 其他素材

Edge Add-ons 额外支持：

- **小图标**（可选）：用于搜索结果列表，建议 64x64 PNG
- **推广图片**（可选）：用于市场推广展示，建议 1400x560 PNG

---

## 五、提交流程

### 5.1 操作步骤

1. 登录 Microsoft Partner Center → "Edge Add-ons" 模块
2. 点击 "Create new"
3. 上传 ZIP 包
4. 填写商店信息：
   - 扩展名称、摘要、详细描述
   - 类别：Developer Tools
   - 搜索关键词
   - 定价：免费
   - 可见性：公开
5. 填写隐私声明
6. 填写年龄分级：3+
7. 上传图标和截图
8. 提交审核（或保存为草稿）

### 5.2 审核流程

- **自动化审核**：提交后首先经过自动化检查（ZIP 结构、manifest 有效性等）
- **人工审核**：通过自动检查后进入人工审核
- **审核周期**：通常 1-2 个工作日
- **审核通过**：自动上架，邮件通知
- **审核被拒**：邮件通知拒绝原因，根据反馈修改后重新提交

### 5.3 常见拒绝原因及处理

| 拒绝原因           | 解决方案                    |
| ------------------ | --------------------------- |
| 功能描述不完整     | 补充详细描述和用法说明      |
| 权限用途不明确     | 逐条补充代码层面的使用场景  |
| 隐私声明不足       | 填写完整的数据收集/使用声明 |
| 截图模糊或尺寸不对 | 替换为 1280x800 清晰截图    |

---

## 六、版本更新流程

Edge Add-ons 的版本更新流程与 Chrome Web Store 类似：

```bash
# 1. 升级版本号
pnpm version:patch   # 补丁版本

# 2. 构建（复用 Chrome 构建）
pnpm build:chrome

# 3. 打包
cd dist_chrome && zip -r ../extension-v$(node -p "require('../package.json').version").zip . && cd ..

# 4. 登录 Edge Partner Center 上传新包并提交审核
```

注意：

- Edge 对版本号的要求与 Chrome 一致
- 每次更新都需要重新审核
- 建议与 Chrome Web Store 同步更新，保持版本一致

---

## 七、Chrome 与 Edge 的差异要点

| 事项       | Chrome Web Store  | Edge Add-ons        | 操作建议            |
| ---------- | ----------------- | ------------------- | ------------------- |
| 开发者注册 | 需缴费 $5         | 免费                | 优先在 Edge 上测试  |
| ZIP 包     | 通用 MV3 构建产物 | 复用 Chrome 的产物  | 使用同一份构建      |
| 商店截图   | 3-5 张 1280x800   | 可复用 Chrome 截图  | 一套截图两用        |
| 隐私声明   | 自由文本          | 问卷 + 声明         | 内容一致，格式不同  |
| 审核周期   | 数小时 ~ 1 天     | 1-2 个工作日        | 提前规划提交时间    |
| 年龄分级   | 无单独要求        | 必须选择（推荐 3+） | 选择 3+             |
| 搜索关键词 | 有限支持          | 支持自定义关键词    | Edge 补充相关关键词 |

---

## 八、发布前检查清单

### 必备项

- [ ] Microsoft 开发者账号已注册（Partner Center）
- [ ] 发布者资料已完善（名称、联系信息）
- [ ] `manifest.json` 版本号已确认
- [ ] 扩展图标 128x128 已就绪
- [ ] 至少 1 张功能截图（1280x800 PNG）已准备
- [ ] 详细描述（英文优先）已填写完整
- [ ] 分类选择 "Developer Tools"
- [ ] 定价设置为 "免费"
- [ ] 可见性设置为 "公开"
- [ ] 年龄分级选择 "3+"
- [ ] 已逐条填写每个权限的用途说明
- [ ] 隐私声明问卷已填写
- [ ] ZIP 包已正确打包并测试

### 建议项

- [ ] 搜索关键词已配置（建议 5-10 个相关词）
- [ ] 中文描述也已准备
- [ ] 与 Chrome Web Store 的描述内容保持一致
- [ ] 已在 Edge 浏览器中加载未打包扩展测试
- [ ] 确认功能在 Edge 中正常工作

### 提交流程检查

- [ ] 提交前在本地 Edge 浏览器中完整测试一轮
- [ ] 确认无控制台报错
- [ ] 确认所有功能正常
- [ ] 准备好提交

---

## 九、后续维护

### 9.1 用户反馈

- Edge Add-ons 支持用户评分和评论
- 定期查看评论，及时响应用户反馈
- 关注评分变化，识别并修复常见问题

### 9.2 版本同步

- 建议在两个商店同时更新版本
- 每次更新后在两个平台均测试验证
- 留意 Edge 和 Chrome 的 API 差异

---

**相关文件**：

- `manifest.json` — 扩展配置文件
- `package.json` — 版本号定义
- `docs/edge-market-description.md` — 市场描述内容
- `docs/edge-tester-info.md` — 测试人员指南
- `docs/chrome-webstore-prepare.md` — Chrome Web Store 发布准备文档
