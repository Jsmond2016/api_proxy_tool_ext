import { IterationInfo } from "./apifoxCache"
import { parseDocLinks } from "@src/utils/docUtils"

type IterationInfoFieldKey = Exclude<keyof IterationInfo, "tag">

interface IterationInfoFieldConfig {
  key: IterationInfoFieldKey
  label: string
  shortLabel: string
  placeholder: string
  tooltip: string
  linkColorClassName: string
}

const MULTIPLE_LINK_TOOLTIP =
  "支持多个文档链接，用换行、空格、逗号或分号分隔"

export const iterationInfoFieldConfigs: IterationInfoFieldConfig[] = [
  {
    key: "requirementDocs",
    label: "需求文档",
    shortLabel: "需求",
    placeholder:
      "请输入需求文档链接，多个链接用换行、空格、逗号或分号分隔",
    tooltip: MULTIPLE_LINK_TOOLTIP,
    linkColorClassName: "text-blue-600 hover:text-blue-800 hover:underline",
  },
  {
    key: "technicalDocs",
    label: "技术方案文档",
    shortLabel: "技术",
    placeholder:
      "请输入技术方案文档链接，多个链接用换行、空格、逗号或分号分隔",
    tooltip: MULTIPLE_LINK_TOOLTIP,
    linkColorClassName: "text-green-600 hover:text-green-800 hover:underline",
  },
  {
    key: "prototypeDocs",
    label: "原型文档",
    shortLabel: "原型",
    placeholder:
      "请输入原型文档链接，多个链接用换行、空格、逗号或分号分隔",
    tooltip: MULTIPLE_LINK_TOOLTIP,
    linkColorClassName: "text-purple-600 hover:text-purple-800 hover:underline",
  },
  {
    key: "testCaseDocs",
    label: "测试用例文档",
    shortLabel: "用例",
    placeholder:
      "请输入测试用例文档链接，多个链接用换行、空格、逗号或分号分隔",
    tooltip: MULTIPLE_LINK_TOOLTIP,
    linkColorClassName: "text-amber-600 hover:text-amber-800 hover:underline",
  },
  {
    key: "scheduleDocs",
    label: "排期文档",
    shortLabel: "排期",
    placeholder:
      "请输入排期文档链接，多个链接用换行、空格、逗号或分号分隔",
    tooltip: MULTIPLE_LINK_TOOLTIP,
    linkColorClassName: "text-cyan-600 hover:text-cyan-800 hover:underline",
  },
]

export const getIterationFieldName = (
  key: IterationInfoFieldKey,
  tag: string
): string => `${key}_${tag}`

export const getIterationFieldLinks = (
  info: IterationInfo,
  key: IterationInfoFieldKey
): string[] => parseDocLinks(info[key] || "")

export const hasIterationFieldValue = (info?: IterationInfo | null): boolean => {
  if (!info) {
    return false
  }

  return iterationInfoFieldConfigs.some(
    ({ key }) => getIterationFieldLinks(info, key).length > 0
  )
}

export const buildIterationCopyText = (
  tag: string,
  info?: IterationInfo | null
): string => {
  const lines = [`- 需求：${tag}`, `- 接口 tag：${tag}`]

  iterationInfoFieldConfigs.forEach(({ key, label }) => {
    const value = info ? getIterationFieldLinks(info, key).join("，") : ""
    if (!value) {
      return
    }

    lines.push(`- ${label}：${value}`)
  })

  return lines.join("\n")
}
