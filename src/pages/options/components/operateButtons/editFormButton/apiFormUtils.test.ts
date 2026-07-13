import { ModelAction } from "@src/constant/model"
import type { SwaggerData } from "../../navButtons/syncApifoxModalButton/apifoxUtils"
import { describe, expect, it } from "vitest"
import { findApiInfoFromSwagger } from "./apiFormUtils"

const createSwaggerData = (paths: SwaggerData["paths"]): SwaggerData => ({
  openapi: "3.0.0",
  info: { title: "Test", description: "", version: "1.0.0" },
  tags: [],
  paths,
})

const apiInfo = (summary: string) => ({
  summary,
  tags: ["user.account"],
  "x-apifox-fe-general-model-base-action-type": ModelAction.CUSTOM,
})

describe("findApiInfoFromSwagger", () => {
  it("prefers an exact path over other fuzzy path matches", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": { get: apiInfo("查询用户") },
      "/api/user/queryOne/detail": { get: apiInfo("查询用户详情") },
    })

    const result = findApiInfoFromSwagger(
      swaggerData,
      "/api/user/queryOne",
      "GET",
    )

    expect(result.matchCount).toBe(1)
    expect(result.apiInfo?.path).toBe("/api/user/queryOne")
  })

  it("ignores OpenAPI path fields that are not supported HTTP methods", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": {
        get: apiInfo("查询用户"),
        parameters: { name: "tenantId", in: "header" },
      },
    })

    const result = findApiInfoFromSwagger(
      swaggerData,
      "/api/user/queryOne",
      "GET",
    )

    expect(result.matchCount).toBe(1)
    expect(result.apiInfo?.summary).toBe("查询用户")
  })

  it("uses the selected method when an exact path has multiple operations", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": {
        get: apiInfo("查询用户"),
        post: apiInfo("提交查询"),
      },
    })

    const result = findApiInfoFromSwagger(
      swaggerData,
      "/api/user/queryOne",
      "POST",
    )

    expect(result.matchCount).toBe(1)
    expect(result.apiInfo?.method).toBe("POST")
  })

  it("uses the first valid operation when the preferred method is unavailable", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": {
        post: apiInfo("提交查询"),
        put: apiInfo("更新查询"),
      },
    })

    const result = findApiInfoFromSwagger(
      swaggerData,
      "/api/user/queryOne",
      "GET",
    )

    expect(result.matchCount).toBe(1)
    expect(result.apiInfo?.method).toBe("POST")
  })

  it("normalizes full URLs, query strings, and trailing slashes", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": { post: apiInfo("提交查询") },
      "/api/user/queryOne/detail": { post: apiInfo("查询详情") },
    })

    const result = findApiInfoFromSwagger(
      swaggerData,
      "https://example.com/api/user/queryOne/?id=1",
      "GET",
    )

    expect(result.matchCount).toBe(1)
    expect(result.apiInfo?.path).toBe("/api/user/queryOne")
  })

  it("keeps the multiple-match warning for ambiguous fuzzy paths", () => {
    const swaggerData = createSwaggerData({
      "/api/user/queryOne": { get: apiInfo("查询用户") },
      "/api/admin/queryOne": { get: apiInfo("查询管理员") },
    })

    const result = findApiInfoFromSwagger(swaggerData, "queryOne", "GET")

    expect(result).toEqual({ apiInfo: null, matchCount: 2 })
  })
})
