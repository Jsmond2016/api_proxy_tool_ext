export interface ApifoxImportConfig {
  projectId: string
  apifoxToken: string
  apifoxMockToken: string
  mockPrefix: string
  selectedTags: string[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const parseApifoxImportConfig = (
  text: string
): { config?: ApifoxImportConfig; error?: string } => {
  let importedValue: unknown
  try {
    importedValue = JSON.parse(text)
  } catch {
    return { error: "配置 JSON 格式不正确，请检查后重试" }
  }

  if (!isRecord(importedValue)) {
    return { error: "配置格式不正确，必须是 JSON 对象" }
  }

  const {
    projectId,
    apifoxToken,
    apifoxMockToken,
    mockPrefix,
    selectedTags,
  } = importedValue
  if (
    typeof projectId !== "string" ||
    !projectId.trim() ||
    typeof apifoxToken !== "string" ||
    !apifoxToken.trim() ||
    typeof apifoxMockToken !== "string" ||
    !apifoxMockToken.trim() ||
    typeof mockPrefix !== "string" ||
    !mockPrefix.trim() ||
    (selectedTags !== undefined &&
      (!Array.isArray(selectedTags) ||
        selectedTags.some((tag) => typeof tag !== "string")))
  ) {
    return {
      error:
        "配置字段不完整，需要 projectId、授权令牌、Mock 令牌、Mock 地址前缀和标签",
    }
  }

  return {
    config: {
      projectId: projectId.trim(),
      apifoxToken: apifoxToken.trim(),
      apifoxMockToken: apifoxMockToken.trim(),
      mockPrefix: mockPrefix.trim(),
      selectedTags: (selectedTags || []) as string[],
    },
  }
}
