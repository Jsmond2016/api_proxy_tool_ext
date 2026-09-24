import { describe, expect, it } from "vitest"
import { parseApifoxImportConfig } from "./configTransfer"

describe("parseApifoxImportConfig", () => {
  it("parses a complete config and trims string fields", () => {
    const result = parseApifoxImportConfig(
      JSON.stringify({
        projectId: " 123 ",
        apifoxToken: " token ",
        apifoxMockToken: " mock-token ",
        mockPrefix: " https://mock.example.com ",
        selectedTags: ["user"],
      })
    )

    expect(result).toEqual({
      config: {
        projectId: "123",
        apifoxToken: "token",
        apifoxMockToken: "mock-token",
        mockPrefix: "https://mock.example.com",
        selectedTags: ["user"],
      },
    })
  })

  it("rejects invalid JSON and incomplete fields", () => {
    expect(parseApifoxImportConfig("not-json").error).toContain("JSON")
    expect(parseApifoxImportConfig(JSON.stringify({ projectId: "123" }))).toEqual({
      error: expect.stringContaining("配置字段不完整"),
    })
  })
})
