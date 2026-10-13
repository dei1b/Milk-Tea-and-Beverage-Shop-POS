import { products } from "../data/products";
import type { CartItem, ReceiptItem, SaleState } from "../types/pos";

export const formatMoney = (centavos: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    centavos / 100,
  );

export function getOrderItems(cart: CartItem[]): ReceiptItem[] {
  return cart.map(({ productId, quantity }) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1)
      throw new Error("Invalid cart item");
    return {
      productId,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
    };
  });
}

export const getTotal = (cart: CartItem[]) =>
  getOrderItems(cart).reduce((sum, item) => sum + item.subtotal, 0);

export type PaymentResult =
  { ok: true; paid: number; change: number } | { ok: false; error: string };

export function validatePayment(
  raw: string,
  total: number,
  badInput = false,
): PaymentResult {
  const fail = (error: string): PaymentResult => ({ ok: false, error });
  if (total <= 0) return fail("Add at least one product before payment.");
  if (badInput) return fail("Enter a valid numeric amount.");
  const text = raw.trim();
  if (!text) return fail("Enter the cash amount.");
  const numeric = Number(text);
  const match = /^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:e([+-]?\d+))?$/i.exec(text);
  if (!match || !Number.isFinite(numeric))
    return fail("Enter a valid numeric amount.");
  if (numeric < 0) return fail("Cash amount cannot be negative.");
  const fractionLength = match[2].split(".")[1]?.length ?? 0;
  const exponent = Number(match[3] ?? 0);
  if (fractionLength - exponent > 2)
    return fail("Enter an amount with at most two decimal places.");
  // Parse the accepted decimal as integer centavos, without floating-point rounding.
  const digits = BigInt(match[2].replace(".", ""));
  const shift = 2 + exponent - fractionLength;
  if (shift > 20) return fail("Enter a valid numeric amount.");
  const cents = digits * 10n ** BigInt(shift);
  if (cents > BigInt(Number.MAX_SAFE_INTEGER))
    return fail("Enter a valid numeric amount.");
  const paid = Number(cents);
  if (paid < total)
    return fail(
      `Insufficient cash. You need ${formatMoney(total - paid)} more.`,
    );
  return { ok: true, paid, change: paid - total };
}

export const initialSale: SaleState = {
  stage: "order",
  cart: [],
  payment: "",
  error: "",
  completed: null,
  sequence: 1,
};
export type SaleAction =
  | { type: "add"; productId: string }
  | { type: "quantity"; productId: string; delta: number }
  | { type: "remove"; productId: string }
  | { type: "review" }
  | { type: "edit" }
  | { type: "payment"; value: string }
  | { type: "confirm"; raw: string; badInput: boolean; timestamp: string }
  | { type: "new" };

export function saleReducer(state: SaleState, action: SaleAction): SaleState {
  if (action.type === "new")
    return { ...initialSale, sequence: state.sequence };
  if (state.stage === "complete") return state;
  if (action.type === "edit")
    return { ...state, stage: "order", payment: "", error: "" };
  if (action.type === "review")
    return state.cart.length ? { ...state, stage: "review", error: "" } : state;
  if (action.type === "payment")
    return { ...state, payment: action.value, error: "" };
  if (action.type === "confirm") {
    if (state.stage !== "review") return state;
    const items = getOrderItems(state.cart);
    const total = getTotal(state.cart);
    const result = validatePayment(action.raw, total, action.badInput);
    if (!result.ok) return { ...state, error: result.error };
    return {
      ...state,
      stage: "complete",
      error: "",
      sequence: state.sequence + 1,
      completed: {
        reference: `TXN-${String(state.sequence).padStart(4, "0")}`,
        timestamp: action.timestamp,
        items,
        total,
        paid: result.paid,
        change: result.change,
      },
    };
  }
  if (state.stage !== "order") return state;
  if (action.type === "add") {
    if (!products.some((p) => p.id === action.productId)) return state;
    const found = state.cart.find(
      (item) => item.productId === action.productId,
    );
    return {
      ...state,
      cart: found
        ? state.cart.map((item) =>
            item.productId === action.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...state.cart, { productId: action.productId, quantity: 1 }],
    };
  }
  if (action.type === "quantity") {
    if (!Number.isSafeInteger(action.delta)) return state;
    return {
      ...state,
      cart: state.cart.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: Math.max(1, item.quantity + action.delta) }
          : item,
      ),
    };
  }
  if (action.type === "remove")
    return {
      ...state,
      cart: state.cart.filter((item) => item.productId !== action.productId),
    };
  return state;
}
