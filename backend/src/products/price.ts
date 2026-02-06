export function parsePriceToCents(price: string | number): number | null {
  const normalized =
    typeof price === "number" ? String(price) : price.replace(",", ".").trim();

  if (!normalized) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [intPart, decimalPart = ""] = normalized.split(".");
  const cents = Number.parseInt(intPart, 10) * 100;
  const dec = Number.parseInt(decimalPart.padEnd(2, "0"), 10);
  if (!Number.isFinite(cents) || !Number.isFinite(dec)) return null;

  return cents + dec;
}

