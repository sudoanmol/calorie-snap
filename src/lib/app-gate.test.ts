import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  UNLOCK_MAX_AGE_SEC,
  createUnlockToken,
  evaluateUnlock,
  isValidUnlockToken,
} from "./app-gate";

describe("evaluateUnlock", () => {
  it("denies a wrong password", () => {
    assert.deepEqual(evaluateUnlock("wrong", "secret"), { kind: "denied" });
  });

  it("denies when the expected password is empty", () => {
    assert.deepEqual(evaluateUnlock("secret", ""), { kind: "denied" });
    assert.deepEqual(evaluateUnlock("", ""), { kind: "denied" });
  });

  it("denies a non-string password", () => {
    assert.deepEqual(evaluateUnlock(undefined, "secret"), { kind: "denied" });
    assert.deepEqual(evaluateUnlock(12, "secret"), { kind: "denied" });
  });

  it("returns a token that unlocks when the password matches", () => {
    const result = evaluateUnlock("secret", "secret");
    assert.equal(result.kind, "ok");
    if (result.kind !== "ok") return;
    assert.equal(isValidUnlockToken(result.token, "secret"), true);
  });
});

describe("unlock token", () => {
  it("rejects a token signed with a different password", () => {
    const token = createUnlockToken("secret");
    assert.equal(isValidUnlockToken(token, "other"), false);
  });

  it("rejects garbage", () => {
    assert.equal(isValidUnlockToken("", "secret"), false);
    assert.equal(isValidUnlockToken("not-a-token", "secret"), false);
  });

  it("rejects an expired token and accepts one still inside the window", () => {
    const now = 1_700_000_000_000;
    const token = createUnlockToken("secret", now);
    assert.equal(
      isValidUnlockToken(token, "secret", now + UNLOCK_MAX_AGE_SEC * 1000 - 1),
      true,
    );
    assert.equal(
      isValidUnlockToken(token, "secret", now + UNLOCK_MAX_AGE_SEC * 1000 + 1),
      false,
    );
  });
});
