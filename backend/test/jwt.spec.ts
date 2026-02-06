import { signAccessToken, verifyAccessToken } from "../src/auth/jwt";
import { resetEnvCache } from "../src/env";

describe("jwt", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    resetEnvCache();
  });

  it("signs and verifies access tokens", () => {
    const token = signAccessToken({ sub: "user-1", username: "admin" });
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe("user-1");
    expect(payload.username).toBe("admin");
  });
});

