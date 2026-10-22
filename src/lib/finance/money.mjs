// BRL amounts are exchanged as integer cents, never binary floating-point.
const LIMIT_CENTS = 9000000000000000n;

/** @param {string} raw @returns {string} Exact signed cent amount. */
export function parseBrlCents(raw) {
  if (typeof raw !== "string") throw new TypeError("Amount must be text.");
  const match = /^(-?)(0|[1-9]\d{0,12})(?:[,.](\d{1,2}))?$/.exec(raw.trim());
  if (!match) throw new RangeError("Enter BRL as 1234,56 (no thousand separators).");
  const cents = (BigInt(match[2]) * 100n + BigInt((match[3] ?? "").padEnd(2, "0") || "0")) * (match[1] ? -1n : 1n);
  if (cents < -LIMIT_CENTS || cents > LIMIT_CENTS) throw new RangeError("BRL exceeds supported limit.");
  return cents.toString();
}

/** @param {string | number | bigint} raw @returns {string} */
export function formatBrlCents(raw) {
  const cents = BigInt(raw);
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  return `${negative ? "-" : ""}R$ ${(absolute / 100n).toLocaleString("pt-BR")},${(absolute % 100n).toString().padStart(2, "0")}`;
}
