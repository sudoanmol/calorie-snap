import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveConvexUrl } from "./convex-url";

describe("resolveConvexUrl", () => {
  it("prefers NEXT_PUBLIC_CONVEX_URL when set", () => {
    assert.equal(
      resolveConvexUrl({
        convexUrl: "https://happy-cat.convex.cloud",
        siteUrl: "http://127.0.0.1:3211",
      }),
      "https://happy-cat.convex.cloud",
    );
  });

  it("maps a local site URL on 3211 to the backend on 3210", () => {
    assert.equal(
      resolveConvexUrl({ siteUrl: "http://127.0.0.1:3211" }),
      "http://127.0.0.1:3210",
    );
  });

  it("maps a hosted .convex.site URL to .convex.cloud", () => {
    assert.equal(
      resolveConvexUrl({ siteUrl: "https://happy-cat.convex.site" }),
      "https://happy-cat.convex.cloud",
    );
  });

  it("returns undefined when nothing usable is set", () => {
    assert.equal(resolveConvexUrl({}), undefined);
    assert.equal(resolveConvexUrl({ siteUrl: "not-a-url" }), undefined);
  });
});
