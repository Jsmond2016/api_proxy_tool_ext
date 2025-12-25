/**
 * 文档工具函数
 */

/**
 * 解析文档链接字符串，将其分割为链接数组
 * 支持使用换行符、逗号、分号作为分隔符
 * @param docs 文档链接字符串，可以是多个链接用换行符、逗号或分号分隔
 * @returns 解析后的链接数组
 */
export const parseDocLinks = (docs: string): string[] => {
  if (!docs || !docs.trim()) {
    return []
  }
  return docs
    .split(/[\n\r,;]+/)
    .map((doc) => doc.trim())
    .filter((doc) => doc.length > 0)
}

