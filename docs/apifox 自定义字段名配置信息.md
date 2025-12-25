# Apifox 自定义字段名配置信息

本文档整理了从 Apifox 导出的 Swagger/OpenAPI 文档中使用的所有自定义扩展字段（以 `x-` 开头的字段）的配置信息、含义和代码中的使用方式。

## 字段列表

### 1. `x-run-in-apifox`

**字段类型**: `string`
**是否必填**: 否
**字段含义**: Apifox 平台中接口的运行链接地址

**示例值**:

```
"https://apifox.com/web/project/123456789/apis/api-102913012-run"
```

**代码中的使用**:

- **位置**: `src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils.ts`
- **作用**: 从该字段中提取接口的唯一标识符（apiId）
- **提取逻辑**:
  ```typescript
  const xApifoxRunUrl = swaggerInfo["x-run-in-apifox"];
  // 从 URL 中提取 apiId: "https://apifox.com/web/project/3155205/apis/api-102913012-run"
  // 提取规则: 取 URL 最后一段，然后取 "-" 分隔的第二部分
  const apiId = xApifoxRunUrl?.split("/").pop()?.split("-")?.[1] || "";
  // 结果: "102913012"
  ```
- **用途**:
  - 作为接口的唯一标识符存储在 `ApiConfig.id` 字段中
  - 用于接口的识别和去重
  - 支持跳转到 Apifox Web 版查看接口详情

---

### 2. `x-apifox-status`

**字段类型**: `ApifoxStatus`
**是否必填**: 否
**字段含义**: 接口在 Apifox 平台中的状态

**可选值**:

- `"developing"` - 开发中（默认值）
- `"testing"` - 测试中
- `"released"` - 已发布
- `"deprecated"` - 将废弃
- `"obsolete"` - 已废弃

**代码中的使用**:

- **位置**: `src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils.ts`
- **作用**: 用于过滤和筛选要同步的接口
- **使用逻辑**:
  ```typescript
  const apifoxStatus = swaggerInfo["x-apifox-status"];
  // 只保留状态匹配的接口
  if (apifoxStatus !== selectedStatus) {
    return; // 跳过不匹配的接口
  }
  ```
- **用途**:
  - 在同步 Apifox 接口时，用户可以选择要同步的接口状态
  - 默认只同步"开发中"状态的接口
  - 支持按状态筛选，避免同步已废弃或已发布的接口

---

### 3. `x-apifox-fe-general-model-base-action-type`

**字段类型**: `string`
**是否必填**: 否（如果缺失，会使用 tags[0] 或 "默认分组"）
**字段含义**: 接口的分组名/命名空间，用于模块分组和权限点生成

**格式要求**:

- 必须为英文 a.b.c 形式
- 只能包含小写字母、大写字母和点号（`.`）
- 不能包含数字、中文和其他特殊字符
- 示例: `"demo.user.management"`, `"order.management"`

**验证规则**:

```typescript
/^[a-zA-Z.]+$/;
```

**代码中的使用**:

- **位置**:
  - `src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils.ts`
  - `src/utils/permissionUtils.ts`
  - `src/types/permission.ts`
- **作用**:
  1. **模块分组**: 作为模块的 `label` 和 `apiDocKey`
  2. **权限点生成**: 作为权限点 key 的前缀部分
- **使用逻辑**:

  ```typescript
  // 1. 获取分组名
  const groupName =
    swaggerInfo["x-apifox-fe-general-model-base-action-type"] ||
    (tags.length > 0 ? tags[0] : "默认分组");

  // 2. 验证格式
  if (!isValidGroupName(groupName)) {
    console.warn("groupName 不符合格式要求");
  }

  // 3. 转换为模块配置
  apiDocKey: groupName.toLowerCase().replace(/\s+/g, ".");
  label: groupName;

  // 4. 生成权限点 key
  const authPrefix = groupName.split(".").join("-"); // demo.user.management -> demo-user-management
  const authPointKey = `${authPrefix}-${apiName}`; // demo-user-management-queryList
  ```

- **用途**:
  - 将接口按业务模块进行分组
  - 生成权限点 key，格式: `{groupName}-{apiName}`
  - 用于权限管理和模块管理

**注意事项**:

- 如果接口没有该字段，会使用 `tags[0]` 作为分组名
- 如果 `tags` 也为空，则使用 `"默认分组"`
- 格式不符合要求时会在控制台输出警告，但不会阻止同步

---

### 4. `x-apifox-fe-general-model-api-type`

**字段类型**: `ModelApiActionType`
**是否必填**: 否（如果缺失，默认使用 `ModelAction.CUSTOM`）
**字段含义**: API 的操作类型，用于标识接口的 CRUD 操作类型

**可选值**（定义在 `src/constant/model.ts`）:

- `"atom-列表"` - 列表查询
- `"atom-新增"` - 新增数据
- `"atom-修改"` - 修改数据
- `"atom-获取详情"` - 获取详情
- `"atom-获取详情-origin"` - 获取详情（原始）
- `"atom-更新状态-单条"` - 更新单条状态
- `"atom-删除-单条"` - 删除单条
- `"atom-删除-多条"` - 删除多条
- `"atom-自定义"` - 自定义操作（默认值）

**代码中的使用**:

- **位置**: `src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils.ts`
- **作用**: 用于生成权限点 key 的后缀部分（apiName）
- **使用逻辑**:

  ```typescript
  const modelApiType =
    swaggerInfo["x-apifox-fe-general-model-api-type"] || ModelAction.CUSTOM;

  // 根据类型映射到对应的 API 名称
  let apiName = ModelNamesMap[modelApiType]; // 如: "queryList", "create", "updateOne" 等

  // 如果是自定义类型，则从接口路径中提取
  if (apiName === "custom") {
    apiName = camelCase(path.split("/").pop() ?? ""); // 如: "createOneV2"
  }

  // 最终生成权限点 key
  const authPointKey = `${authPrefix}-${apiName}`;
  ```

- **用途**:
  - 确定权限点 key 的后缀部分
  - 标准 CRUD 操作使用预定义的名称（如 `queryList`, `create`, `updateOne`）
  - 自定义操作从接口路径中提取名称

**映射关系**（`ModelNamesMap`）:

- `"atom-列表"` → `"queryList"`
- `"atom-新增"` → `"create"`
- `"atom-修改"` → `"updateOne"`
- `"atom-获取详情"` → `"queryOne"`
- `"atom-获取详情-origin"` → `"queryOneOrigin"`
- `"atom-更新状态-单条"` → `"updateStatus"`
- `"atom-删除-单条"` → `"deleteOne"`
- `"atom-删除-多条"` → `"deleteList"`
- `"atom-自定义"` → `"custom"`（需要从路径提取）

---

## 字段使用流程图

```
Swagger 数据解析
    ↓
提取 x-run-in-apifox → 生成 apiId
    ↓
检查 x-apifox-status → 过滤接口
    ↓
提取 x-apifox-fe-general-model-base-action-type → 确定分组名
    ↓
提取 x-apifox-fe-general-model-api-type → 确定 API 类型
    ↓
生成权限点 key: {groupName}-{apiName}
    ↓
转换为 ModuleConfig 和 ApiConfig
```

## 字段依赖关系

1. **x-apifox-fe-general-model-base-action-type** 和 **x-apifox-fe-general-model-api-type** 共同用于生成权限点 key
2. **x-apifox-status** 用于过滤，不影响其他字段的处理
3. **x-run-in-apifox** 独立使用，仅用于提取 apiId

## 注意事项

1. 所有 `x-` 开头的字段都是可选的，代码中都有默认值处理
2. `x-apifox-fe-general-model-base-action-type` 的格式必须符合要求，否则会影响权限点生成
3. 如果接口缺少关键字段，会使用备用方案（如使用 tags、默认值等）
4. 字段名称较长，建议使用常量引用，避免硬编码

## 相关文件

- `src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils.ts` - 主要解析逻辑
- `src/utils/permissionUtils.ts` - 权限点生成逻辑
- `src/constant/model.ts` - API 类型定义和映射
- `src/constant/apifoxFields.ts` - Apifox 字段常量定义
- `src/types/permission.ts` - 权限相关类型定义
- `src/types/index.ts` - 全局类型定义
