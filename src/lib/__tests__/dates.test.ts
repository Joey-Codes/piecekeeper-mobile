import { describe, expect, test } from "@jest/globals";

import { formatFriendlyDate } from "@/lib/dates";

describe("formatFriendlyDate", () => {
  test("formats and keeps the local calendar day", () => {
    // 2026-08-08 is a Saturday; naive UTC parsing would render Friday
    // in negative-offset timezones.
    const result = formatFriendlyDate("2026-08-08");
    expect(result.toLowerCase()).toContain("saturday");
    expect(result).toContain("8");
  });

  test("returns unparsable input unchanged", () => {
    expect(formatFriendlyDate("not-a-date")).toBe("not-a-date");
  });
});
