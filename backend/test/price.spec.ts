import { parsePriceToCents } from "../src/products/price";

describe("price", () => {
  it("parses price strings", () => {
    expect(parsePriceToCents("10")).toBe(1000);
    expect(parsePriceToCents("10.5")).toBe(1050);
    expect(parsePriceToCents("10.50")).toBe(1050);
    expect(parsePriceToCents("10,50")).toBe(1050);
  });

  it("rejects invalid prices", () => {
    expect(parsePriceToCents("")).toBeNull();
    expect(parsePriceToCents("10.999")).toBeNull();
    expect(parsePriceToCents("abc")).toBeNull();
  });
});

