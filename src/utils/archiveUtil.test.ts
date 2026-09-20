import type { ApiConfig, GlobalConfig } from "@src/types"
import { describe, expect, it } from "vitest"
import { archiveTagData } from "./archiveUtil"

const createApi = (id: string, tags?: string[]): ApiConfig => ({
  id,
  apiKey: `/${id}`,
  apiName: id,
  apiUrl: `/${id}`,
  redirectURL: `https://mock.example.com/${id}`,
  method: "GET",
  filterType: "contains",
  delay: 0,
  isOpen: true,
  mockWay: "redirect",
  statusCode: 200,
  tags,
})

describe("archiveTagData", () => {
  it("archives every API and quick mock config in the current panel", async () => {
    const config: GlobalConfig = {
      isGlobalEnabled: true,
      modules: [
        {
          id: "tag-module",
          apiDocKey: "tag.module",
          label: "Tag module",
          apiArr: [createApi("tag-api", ["sprint"])],
        },
        {
          id: "custom-module",
          apiDocKey: "custom.module",
          label: "Custom module",
          apiArr: [createApi("custom-api")],
        },
      ],
      quickMockConfigs: [
        { id: "quick-1", key: "success", name: "Success", responseJson: "{}" },
      ],
    }

    const archive = await archiveTagData("sprint", config)

    expect(archive.modules).toEqual(config.modules)
    expect(archive.modules).not.toBe(config.modules)
    expect(archive.modules[0].apiArr).not.toBe(config.modules[0].apiArr)
    expect(archive.quickMockConfigs).toEqual(config.quickMockConfigs)
    expect(archive).not.toHaveProperty("iterationInfo")
  })
})
