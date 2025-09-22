# 需求

基于tag自动同步apifox-mock接口

## 功能说明

- 增加按钮：在顶部 nav 栏的右侧增加按钮：同步 apifox 接口
- 交互：点击按钮，打开弹框进行设置，有如下字段：
  - apifox 本地地址：
    - ui 组件：Input.Textarea
    - 默认值预设：空值，给出提示如：`http://127.0.0.1:4523/export/openapi/3?version=3.0`
    - 交互校验说明：当用户填写完后，自动请求该接口是否能够获取正确的 swagger schema 信息，若不能，校验不过；
  - tag: 
    - ui 组件为 Select 组件，支持多选，选项值为基于上面 请求拉取获得的 tag 汇总列表；
    - 默认值：空
    - 联动：当前面字段填写的时候，自动更新此选项列表；
  - mock地址前缀：默认 `http://127.0.0.1:4523/m1/3155205-1504204-default/`，支持自定义配置
- 弹框交互：
  - 取消：重置所有操作，关闭弹框；
  - 确定：
    - 分析请求到的 swagger schema 数据，进行处理和转换成 `/example-config.json` 数据结构：
    - 逻辑冲突说明：若同步的 url 和已有的 url 冲突，或者 分组名字 冲突，则给出提示，是否覆盖替换；二次确认后可覆盖；若拒绝覆盖则取消所有操作

## swagger 文件字段说明

- 文件说明：导出的 swagger json 示例参考文件 `./swagger-version-3-example.json`
- 字段说明：
  - tags: 用于分析合并成 tag 字段的选项列表，注意需要去重；
  - x-apifox-fe-general-model-base-action-type: 该字段为 apifox 自定义字段，用于作为分组名，每个接口都应该有该字段，若没有，则将该接口分配至 默认分组；
  - paths: 对象的 key 即为 url，里面的 key 为请求方法；
  - summary: 该字段作为接口中文名字



