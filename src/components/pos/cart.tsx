import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { formatMoney, getOrderItems } from "@/lib/transactions";
import type { CartItem } from "@/types/pos";
import { DrinkImage } from "./product-grid";

export function Cart({
  cart,
  readonly,
  onQuantity,
  onRemove,
}: {
  cart: CartItem[];
  readonly: boolean;
  onQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  if (!cart.length)
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-full border border-line bg-workspace text-muted">
          <ShoppingBag size={25} strokeWidth={1.4} />
        </div>
        <p className="mb-1 text-lg font-semibold">Your cart is empty.</p>
        <p className="text-lg leading-relaxed text-muted">
          Add a drink to begin.
        </p>
      </div>
    );
  return (
    <ul className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
      {getOrderItems(cart).map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return (
          <li
            key={item.productId}
            className="rounded-lg border border-line p-4"
          >
            <div className="flex gap-4 max-[400px]:flex-col">
              <DrinkImage
                index={product.imageIndex}
                className="h-20 w-20 shrink-0 rounded-md"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold leading-snug">
                  {product.shortName}
                </h3>
                <p className="mt-1 text-lg text-muted">
                  {product.category === "Water" ? "Bottled" : "Regular"} ·{" "}
                  {formatMoney(item.price)} each
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <strong className="text-lg font-semibold tabular-nums">
                    {formatMoney(item.subtotal)}
                  </strong>
                  {readonly && (
                    <span className="text-lg text-muted">
                      Qty {item.quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!readonly && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <div className="flex items-center rounded-md border border-line">
                  <button
                    className="quantity-button"
                    aria-label={`Decrease ${product.shortName}`}
                    disabled={item.quantity === 1}
                    onClick={() => onQuantity(item.productId, -1)}
                  >
                    <Minus size={20} />
                  </button>
                  <span
                    className="min-w-10 px-1 text-center text-lg font-semibold tabular-nums"
                    aria-label={`Quantity of ${product.shortName}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    className="quantity-button"
                    aria-label={`Increase ${product.shortName}`}
                    onClick={() => onQuantity(item.productId, 1)}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="flex min-h-12 items-center gap-2 rounded px-3 py-2 text-lg text-muted hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remove ${product.shortName}`}
                >
                  <Trash2 size={20} />
                  Remove
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
