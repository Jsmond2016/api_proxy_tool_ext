import { describe, expect, it } from "vitest"
import { getApifoxApiLink } from "./apifoxLink"

describe("getApifoxApiLink", () => {
  it("uses the API link stored on the table record", () => {
    expect(
      getApifoxApiLink(
        {
          id: "123",
          link: " https://app.apifox.com/project/1/apis/api-123 ",
        },
        "2",
      ),
    ).toBe("https://app.apifox.com/project/1/apis/api-123")
  })

  it("builds a fallback link for a numeric Apifox API id", () => {
    expect(getApifoxApiLink({ id: "123" }, "456")).toBe(
      "https://app.apifox.com/project/456/apis/api-123",
    )
  })

  it("returns an empty link when no Apifox API can be identified", () => {
    expect(getApifoxApiLink({ id: "custom-api" }, "456")).toBe("")
    expect(getApifoxApiLink({ id: "123" }, null)).toBe("")
  })
})
