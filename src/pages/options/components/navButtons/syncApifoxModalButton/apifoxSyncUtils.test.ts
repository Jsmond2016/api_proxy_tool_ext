import type { ApiConfig, ModuleConfig } from "@src/types"
import { describe, expect, it } from "vitest"
import { getApifoxModules, mergeApifoxModules, replaceApifoxModules } from "./apifoxSyncUtils"

const APIFOX_URL = "project-1"

const createApi = (id: string, apiUrl: string, overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  id,
  apiKey: apiUrl,
  apiName: id,
  apiUrl,
  redirectURL: `https://mock.example.com${apiUrl}`,
  method: "GET",
  filterType: "contains",
  delay: 0,
  isOpen: true,
  mockWay: "redirect",
  statusCode: 200,
  ...overrides
})

const createModule = (
  id: string,
  label: string,
  apiArr: ApiConfig[],
  overrides: Partial<ModuleConfig> = {}
): ModuleConfig => ({
  id,
  label,
  apiDocKey: label,
  apiDocUrl: APIFOX_URL,
  apiArr,
  ...overrides
})

describe("Apifox sync boundaries", () => {
  it("selects only synced APIs and excludes legacy external modules", () => {
    const syncedApi = createApi("apifox-old", "/users", { tags: ["sprint"] })
    const customApi = createApi("custom", "/custom")
    const externalModule = createModule(
      "external",
      "quick.mock.external",
      [createApi("external-api", "/external", { tags: ["sprint"] })],
      { apiDocKey: "quick.mock.external" }
    )

    const selected = getApifoxModules(
      [createModule("users", "users", [syncedApi, customApi]), externalModule],
      APIFOX_URL
    )

    expect(selected).toHaveLength(1)
    expect(selected[0].apiArr).toEqual([syncedApi])
  })

  it("replaces synced APIs while retaining custom and external APIs", () => {
    const customApi = createApi("custom", "/custom", { tags: ["sprint"] })
    const oldModule = createModule(
      "users-old",
      "users",
      [createApi("apifox-old", "/users", { tags: ["sprint"] }), customApi],
      { source: "apifox", apifoxApiIds: ["apifox-old"] }
    )
    const externalModule = createModule(
      "external",
      "quick.mock.external",
      [createApi("external-api", "/external")],
      { source: "external" }
    )
    const refreshedApi = createApi("apifox-new", "/users", { tags: ["sprint"] })

    const result = replaceApifoxModules(
      [oldModule, externalModule],
      [
        createModule("users-new", "users", [refreshedApi], {
          source: "apifox",
          apifoxApiIds: ["apifox-new"]
        })
      ],
      APIFOX_URL
    )

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe("users-old")
    expect(result[0].apiArr).toEqual([refreshedApi, customApi])
    expect(result[1]).toBe(externalModule)
  })

  it("keeps a custom-only module when its Apifox group was removed", () => {
    const customApi = createApi("custom", "/custom")
    const result = replaceApifoxModules(
      [
        createModule("removed-group", "removed", [createApi("apifox-old", "/removed", { tags: ["sprint"] }), customApi])
      ],
      [],
      APIFOX_URL
    )

    expect(result).toEqual([
      expect.objectContaining({
        id: "removed-group",
        apiDocUrl: undefined,
        source: undefined,
        apifoxApiIds: undefined,
        apiArr: [customApi]
      })
    ])
  })

  it("merges new Apifox APIs without touching custom or external data", () => {
    const customApi = createApi("custom", "/custom")
    const externalModule = createModule("external", "quick.mock.external", [createApi("external-api", "/external")], {
      source: "external"
    })
    const result = mergeApifoxModules(
      [
        createModule("users", "users", [createApi("apifox-old", "/users", { tags: ["sprint"] }), customApi]),
        externalModule
      ],
      [
        createModule(
          "users-new",
          "users",
          [createApi("apifox-old", "/users"), createApi("apifox-added", "/users/2")],
          {
            source: "apifox",
            apifoxApiIds: ["apifox-old", "apifox-added"]
          }
        )
      ],
      APIFOX_URL
    )

    expect(result.addedCount).toBe(1)
    expect(result.modules.find((module) => module.id === "users")?.apiArr).toEqual([
      expect.objectContaining({ id: "apifox-old" }),
      customApi,
      expect.objectContaining({ id: "apifox-added" })
    ])
    expect(result.modules).toContain(externalModule)
  })
})
