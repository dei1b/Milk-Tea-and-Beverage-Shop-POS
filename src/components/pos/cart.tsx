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
        <p className="mb-1 text-sm font-semibold">Your cart is empty.</p>
        <p className="text-xs leading-5 text-muted">Add a drink to begin.</p>
      </div>
    );
  return (
    <ul className="flex flex-1 flex-col gap-2.5 p-4">
      {getOrderItems(cart).map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return (
          <li
            key={item.productId}
            className="rounded-lg border border-line p-2.5"
          >
            <div className="flex gap-3">
              <DrinkImage
                index={product.imageIndex}
                className="h-[62px] w-[62px] shrink-0 rounded-md"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold leading-4">
                  {product.shortName}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {product.category === "Water" ? "Bottled" : "Regular"} ·{" "}
                  {formatMoney(item.price)} each
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <strong className="text-xs font-semibold tabular-nums">
                    {formatMoney(item.subtotal)}
                  </strong>
                  {readonly && (
                    <span className="text-xs text-muted">
                      Qty {item.quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!readonly && (
              <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
                <div className="flex items-center rounded-md border border-line">
                  <button
                    className="quantity-button"
                    aria-label={`Decrease ${product.shortName}`}
                    disabled={item.quantity === 1}
                    onClick={() => onQuantity(item.productId, -1)}
                  >
                    <Minus size={13} />
                  </button>
                  <span
                    className="min-w-7 text-center text-xs tabular-nums"
                    aria-label={`Quantity of ${product.shortName}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    className="quantity-button"
                    aria-label={`Increase ${product.shortName}`}
                    onClick={() => onQuantity(item.productId, 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="flex min-h-8 items-center gap-1.5 rounded px-2 text-xs text-muted hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remove ${product.shortName}`}
                >
                  <Trash2 size={13} />
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
