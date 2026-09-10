import { describe, expect, it } from "vitest";
import { findResponseSearchMatches } from "./responseSearch";

describe("findResponseSearchMatches", () => {
  it("finds case-insensitive matches in property names and leaf values", () => {
    expect(
      findResponseSearchMatches(
        { userName: "Ada", profile: { nickname: "ada-lovelace" } },
        "ada",
      ),
    ).toEqual([{ path: "$.userName" }, { path: "$.profile.nickname" }]);
  });

  it("uses bracket notation for array items and non-identifier property names", () => {
    expect(
      findResponseSearchMatches(
        { "display-name": ["first", "second target"] },
        "target",
      ),
    ).toEqual([{ path: '$["display-name"][1]' }]);
  });

  it("keeps one result per occurrence and supports plain text responses", () => {
    expect(findResponseSearchMatches("target target", "target")).toEqual([
      { path: "$" },
      { path: "$" },
    ]);
  });

  it("returns no matches for an empty keyword", () => {
    expect(findResponseSearchMatches({ name: "Ada" }, "  ")).toEqual([]);
  });
});
