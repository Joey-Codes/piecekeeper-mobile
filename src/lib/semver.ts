/**
 * Minimal dotted-version comparison for the app-config upgrade gate.
 * Framework-free. Not full semver — no prerelease/build tags, which
 * app versions here never use.
 */

/**
 * Compare two dotted version strings numerically ("1.2.10" > "1.2.9").
 * Returns -1 if a < b, 0 if equal, 1 if a > b. Missing segments count
 * as 0 ("1.0" equals "1.0.0"); non-numeric segments count as 0.
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = parseSegments(a);
  const pb = parseSegments(b);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

/** True if `version` is strictly below `minimum`. */
export function isVersionBelow(version: string, minimum: string): boolean {
  return compareVersions(version, minimum) < 0;
}

function parseSegments(version: string): number[] {
  return version
    .trim()
    .split(".")
    .map((segment) => {
      const n = parseInt(segment, 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    });
}
