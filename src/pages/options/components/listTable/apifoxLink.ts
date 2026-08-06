import type { ApiConfig } from "@src/types"

type ApifoxLinkApi = Pick<ApiConfig, "id" | "link">

export const getApifoxApiLink = (
  apiConfig: ApifoxLinkApi,
  projectId: string | null,
): string => {
  const directLink = apiConfig.link?.trim()
  if (directLink) return directLink

  if (!projectId || !/^\d+$/.test(apiConfig.id)) return ""

  return `https://app.apifox.com/project/${projectId}/apis/api-${apiConfig.id}`
}
