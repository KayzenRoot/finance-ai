import assert from "node:assert/strict";
import test from "node:test";
import { formatBrlCents, parseBrlCents } from "../../src/lib/finance/money.mjs";

test("money parser returns exact signed BRL cents", () => {
  assert.equal(parseBrlCents("0"), "0");
  assert.equal(parseBrlCents("0,01"), "1");
  assert.equal(parseBrlCents("1234,56"), "123456");
  assert.equal(parseBrlCents("-1234.56"), "-123456");
  assert.equal(parseBrlCents("90000000000000"), "9000000000000000");
  assert.equal(parseBrlCents("-90000000000000"), "-9000000000000000");
});

test("money parser rejects floats, grouping and malformed monetary input", () => {
  for (const invalid of ["", "1,234", "1.234,56", "1e3", "NaN", "Infinity", "+1", "01", "90000000000000,01"]) {
    assert.throws(() => parseBrlCents(invalid), { name: "RangeError" }, invalid);
  }
});

test("formatter does not lose cents or precision", () => {
  assert.equal(formatBrlCents("0"), "R$ 0,00");
  assert.equal(formatBrlCents("-12"), "-R$ 0,12");
  assert.equal(formatBrlCents("123456"), "R$ 1.234,56");
  assert.equal(formatBrlCents("9000000000000000"), "R$ 90.000.000.000.000,00");
});
