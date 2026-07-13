import "fake-indexeddb/auto"

import { ModelAction } from "@src/constant/model"
import type { ParsedApi } from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils"
import { fetchOrGetCachedSwaggerData } from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxCache"
import {
  getCachedParsedApiMap,
  normalizeApiLookupPath,
  PARSED_API_CACHE_TTL,
  setCachedParsedApis,
} from "@src/utils/parsedApiCache"
import {
  buildBatchQuickMockApi,
  fetchApifoxApiMap,
} from "@src/utils/batchQuickMock"
import { describe, expect, it, vi } from "vitest"

vi.mock(
  "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxCache",
  () => ({
    fetchOrGetCachedSwaggerData: vi.fn(),
  }),
)

const createParsedApi = (overrides: Partial<ParsedApi> = {}): ParsedApi => ({
  apiId: "102913012",
  path: "/api/users",
  method: "POST",
  summary: "创建用户",
  link: "https://app.apifox.com/project/1/apis/api-102913012",
  tags: ["user"],
  groupName: "user.account",
  authPointKey: "user.account.create",
  modelApiType: ModelAction.CREATE,
  ...overrides,
})

describe("parsed API persistent cache", () => {
  it("normalizes full URLs and relative paths to the same lookup key", () => {
    expect(
      normalizeApiLookupPath("https://example.com//api/users/?page=1#top"),
    ).toBe("/api/users")
    expect(normalizeApiLookupPath("api/users/")).toBe("/api/users")
  })

  it("persists and restores parsed APIs from IndexedDB", async () => {
    const identity = { mode: "online" as const, url: "project-persisted" }
    const parsedApi = createParsedApi()

    await setCachedParsedApis(identity, [parsedApi], 1_000)
    const cached = await getCachedParsedApiMap(identity, 2_000)

    expect(cached?.get("/api/users")).toEqual(parsedApi)
  })

  it("deletes expired cache records", async () => {
    const identity = { mode: "online" as const, url: "project-expired" }

    await setCachedParsedApis(identity, [createParsedApi()], 1_000)
    const cached = await getCachedParsedApiMap(
      identity,
      1_000 + PARSED_API_CACHE_TTL + 1,
    )

    expect(cached).toBeNull()
  })

  it("does not expose the Apifox URL or token in IndexedDB keys", async () => {
    const secret = "credential-marker"
    const identity = {
      mode: "local" as const,
      url: `https://example.com/export-openapi?token=${secret}`,
    }

    await setCachedParsedApis(identity, [createParsedApi()])

    const database = await openCacheDatabase()
    const keys = await requestToPromise(
      database
        .transaction("parsed-api-maps", "readonly")
        .objectStore("parsed-api-maps")
        .getAllKeys(),
    )
    const serializedKeys = JSON.stringify(keys)

    expect(serializedKeys).not.toContain(secret)
    expect(serializedKeys).not.toContain("example.com")
  })
})

describe("batch Quick Mock API enrichment", () => {
  it("enriches the first cold request and reuses IndexedDB afterwards", async () => {
    const projectId = `project-cold-${crypto.randomUUID()}`
    vi.mocked(fetchOrGetCachedSwaggerData).mockResolvedValue({
      info: {
        title: "Test",
        description: "",
        version: "1.0.0",
      },
      tags: [{ name: "user.account" }],
      paths: {
        "/api/users": {
          post: {
            summary: "创建用户",
            tags: ["user.account"],
          },
        },
      },
    })

    const config = {
      isGlobalEnabled: true,
      modules: [],
      apifoxConfig: {
        mode: "online" as const,
        apifoxUrl: projectId,
        mockPrefix: "https://mock.example.com",
        apifoxToken: "test-credential",
      },
    }

    const firstResult = await fetchApifoxApiMap(config)
    const secondResult = await fetchApifoxApiMap(config)

    expect(firstResult.get("/api/users")?.summary).toBe("创建用户")
    expect(secondResult.get("/api/users")?.summary).toBe("创建用户")
    expect(fetchOrGetCachedSwaggerData).toHaveBeenCalledTimes(1)
  })

  it("uses parsed Apifox metadata instead of the URL fallback", () => {
    const parsedApi = createParsedApi()
    const result = buildBatchQuickMockApi({
      normalizedUrl: parsedApi.path,
      parsedApi,
      mockPrefix: "https://mock.example.com",
    })

    expect(result.apiName).toBe("创建用户")
    expect(result.link).toBe(parsedApi.link)
    expect(result.method).toBe("POST")
    expect(result.apiName).not.toBe(result.apiUrl)
  })
})

const openCacheDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open("api-proxy-cache-db", 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
