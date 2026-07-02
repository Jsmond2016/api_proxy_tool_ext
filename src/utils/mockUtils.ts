/**
 * 在重定向 URL 后追加 Apifox Mock Token
 *
 * 如果未配置 token 或 URL 已携带 token，返回原 URL
 *
 * @param url 原始重定向 URL
 * @param mockToken Apifox Mock 令牌（来自用户配置）
 * @returns 追加 token 后的 URL
 */
export function appendApifoxMockToken(
  url: string,
  mockToken?: string
): string {
  if (!mockToken) return url
  if (url.includes("apifoxToken=")) return url

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}apifoxToken=${encodeURIComponent(mockToken)}`
}
