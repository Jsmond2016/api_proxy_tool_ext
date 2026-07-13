import type { ApiConfig, GlobalConfig } from "@src/types"
import { isApiUrlDuplicate } from "@src/utils/chromeApi"
import { describe, expect, it } from "vitest"
import { resetModuleApis } from "./resetModuleUtils"

const createApi = (id: string, apiUrl: string): ApiConfig => ({
  id,
  apiKey: apiUrl,
  apiName: apiUrl,
  apiUrl,
  redirectURL: `https://mock.example.com${apiUrl}`,
  method: "GET",
  filterType: "contains",
  delay: 0,
  isOpen: false,
  mockWay: "redirect",
  statusCode: 200,
})

describe("resetModuleApis", () => {
  it("allows a reset API path to be added again", () => {
    const config: GlobalConfig = {
      isGlobalEnabled: false,
      modules: [
        {
          id: "module-a",
          apiDocKey: "module.a",
          label: "Module A",
          apiArr: [createApi("api-1", "/api/user/queryOne")],
        },
      ],
    }

    const resetConfig = resetModuleApis(config, "module-a")

    expect(resetConfig.modules[0].apiArr).toEqual([])
    expect(isApiUrlDuplicate(resetConfig.modules, "/api/user/queryOne")).toBe(
      false,
    )
  })

  it("does not remove APIs from other modules", () => {
    const config: GlobalConfig = {
      isGlobalEnabled: false,
      modules: [
        {
          id: "module-a",
          apiDocKey: "module.a",
          label: "Module A",
          apiArr: [createApi("api-1", "/api/user/queryOne")],
        },
        {
          id: "module-b",
          apiDocKey: "module.b",
          label: "Module B",
          apiArr: [createApi("api-2", "/api/order/queryOne")],
        },
      ],
    }

    const resetConfig = resetModuleApis(config, "module-a")

    expect(resetConfig.modules[1].apiArr).toEqual(config.modules[1].apiArr)
  })
})
