import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getOrderItems,
  getTotal,
  initialSale,
  saleReducer,
  validatePayment,
} from "../src/lib/transactions";

const cart = [
  { productId: "classic", quantity: 2 },
  { productId: "water", quantity: 1 },
];
test("catalog prices produce the specified order and centavo totals", () => {
  assert.deepEqual(
    getOrderItems(cart).map((item) => item.subtotal),
    [11800, 2000],
  );
  assert.equal(getTotal(cart), 13800);
});
test("payments reject each invalid condition with actionable messages", () => {
  const cases: [string, string, boolean?][] = [
    ["", "Enter the cash amount."],
    ["abc", "Enter a valid numeric amount."],
    ["", "Enter a valid numeric amount.", true],
    ["Infinity", "Enter a valid numeric amount."],
    ["1e999", "Enter a valid numeric amount."],
    ["0x200", "Enter a valid numeric amount."],
    ["200abc", "Enter a valid numeric amount."],
    ["-1.00", "Cash amount cannot be negative."],
    ["200.001", "Enter an amount with at most two decimal places."],
    ["200.000", "Enter an amount with at most two decimal places."],
    ["137", "Insufficient cash. You need ₱1.00 more."],
    ["0", "Insufficient cash. You need ₱138.00 more."],
  ];
  for (const [raw, error, badInput] of cases)
    assert.deepEqual(
      validatePayment(raw, 13800, badInput),
      { ok: false, error },
      raw,
    );
  assert.deepEqual(validatePayment("200", 0), {
    ok: false,
    error: "Add at least one product before payment.",
  });
});
test("money conversion and change remain exact, including decimal and exponent input", () => {
  for (const [raw, paid, change] of [
    ["138", 13800, 0],
    ["200", 20000, 6200],
    ["200.50", 20050, 6250],
    ["2e2", 20000, 6200],
  ] as const)
    assert.deepEqual(validatePayment(raw, 13800), { ok: true, paid, change });
  assert.deepEqual(validatePayment("0.29", 28), {
    ok: true,
    paid: 29,
    change: 1,
  });
});
test("cart merges products, respects positive integer quantities, and removes items", () => {
  let state = saleReducer(initialSale, { type: "add", productId: "classic" });
  state = saleReducer(state, { type: "add", productId: "classic" });
  assert.deepEqual(state.cart, [{ productId: "classic", quantity: 2 }]);
  state = saleReducer(state, {
    type: "quantity",
    productId: "classic",
    delta: -5,
  });
  assert.equal(state.cart[0].quantity, 1);
  state = saleReducer(state, {
    type: "quantity",
    productId: "classic",
    delta: 0.5,
  });
  assert.equal(state.cart[0].quantity, 1);
  state = saleReducer(state, { type: "remove", productId: "classic" });
  assert.equal(state.cart.length, 0);
  assert.equal(saleReducer(state, { type: "review" }).stage, "order");
});
test("editing clears payment and errors; confirmation uses the changed total", () => {
  let state = saleReducer({ ...initialSale, cart }, { type: "review" });
  state = saleReducer(state, { type: "payment", value: "137" });
  state = saleReducer(state, {
    type: "confirm",
    raw: "137",
    badInput: false,
    timestamp: "2026-10-13T04:00:00Z",
  });
  assert.equal(state.sequence, 1);
  assert.equal(state.completed, null);
  state = saleReducer(state, { type: "edit" });
  assert.equal(state.payment, "");
  assert.equal(state.error, "");
  state = saleReducer(state, { type: "add", productId: "water" });
  state = saleReducer(state, { type: "review" });
  state = saleReducer(state, {
    type: "confirm",
    raw: "200",
    badInput: false,
    timestamp: "2026-10-13T04:00:00Z",
  });
  assert.equal(state.completed?.total, 15800);
  assert.equal(state.completed?.change, 4200);
});
test("completed receipt is immutable; repeated confirmation does not consume references", () => {
  const original = { ...initialSale, cart };
  const reviewed = saleReducer(original, { type: "review" });
  const confirm = {
    type: "confirm",
    raw: "200.50",
    badInput: false,
    timestamp: "2026-10-13T04:00:00Z",
  } as const;
  const paid = saleReducer(reviewed, confirm);
  assert.equal(paid.completed?.reference, "TXN-0001");
  assert.equal(paid.sequence, 2);
  assert.equal(saleReducer(paid, confirm), paid);
  assert.equal(saleReducer(paid, { type: "add", productId: "taro" }), paid);
  original.cart[0] = { productId: "classic", quantity: 7 };
  assert.equal(paid.completed?.items[0].quantity, 2);
  const fresh = saleReducer(paid, { type: "new" });
  assert.deepEqual(fresh, { ...initialSale, sequence: 2 });
  const next = saleReducer(
    saleReducer(saleReducer(fresh, { type: "add", productId: "water" }), {
      type: "review",
    }),
    { ...confirm, raw: "20" },
  );
  assert.equal(next.completed?.reference, "TXN-0002");
});
