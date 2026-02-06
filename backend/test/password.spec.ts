import { hashPassword, verifyPassword } from "../src/auth/password";

describe("password", () => {
  it("verifies correct password", () => {
    const hash = hashPassword("secret");
    expect(verifyPassword("secret", hash)).toBe(true);
  });

  it("rejects wrong password", () => {
    const hash = hashPassword("secret");
    expect(verifyPassword("nope", hash)).toBe(false);
  });
});

