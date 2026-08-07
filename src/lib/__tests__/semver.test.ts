import { describe, expect, test } from "@jest/globals";

import { compareVersions, isVersionBelow } from "@/lib/semver";

describe("compareVersions", () => {
  test("equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("0.0.0", "0.0.0")).toBe(0);
  });

  test("simple ordering", () => {
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
    expect(compareVersions("1.9.0", "2.0.0")).toBe(-1);
  });

  test("numeric, not lexicographic", () => {
    expect(compareVersions("1.2.10", "1.2.9")).toBe(1);
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
  });

  test("missing segments count as zero", () => {
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1", "1.0.1")).toBe(-1);
    expect(compareVersions("2", "1.9.9")).toBe(1);
  });

  test("malformed segments count as zero", () => {
    expect(compareVersions("1.x.0", "1.0.0")).toBe(0);
    expect(compareVersions("garbage", "0.0.1")).toBe(-1);
    expect(compareVersions("", "0.0.0")).toBe(0);
  });

  test("whitespace tolerated", () => {
    expect(compareVersions(" 1.0.0 ", "1.0.0")).toBe(0);
  });
});

describe("isVersionBelow", () => {
  test("strictly below", () => {
    expect(isVersionBelow("1.0.0", "1.0.1")).toBe(true);
    expect(isVersionBelow("1.0.0", "1.0.0")).toBe(false);
    expect(isVersionBelow("1.0.1", "1.0.0")).toBe(false);
  });

  test("the launch-gate scenario", () => {
    // app 1.0.0 vs raised minimum
    expect(isVersionBelow("1.0.0", "1.1.0")).toBe(true);
    // default backend minimum blocks nothing
    expect(isVersionBelow("1.0.0", "0.0.0")).toBe(false);
  });
});
