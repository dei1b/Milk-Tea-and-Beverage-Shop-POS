import { Plus, SearchX } from "lucide-react";
import type { CSSProperties } from "react";
import type { CartItem, Product } from "@/types/pos";
import { formatMoney } from "@/lib/transactions";

export function DrinkImage({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`drink-image ${className}`}
      style={
        {
          "--photo-column": index % 3,
          "--photo-row": Math.floor(index / 3),
        } as CSSProperties
      }
    />
  );
}

export function ProductGrid({
  products,
  cart,
  locked,
  onAdd,
}: {
  products: Product[];
  cart: CartItem[];
  locked: boolean;
  onAdd: (id: string) => void;
}) {
  if (!products.length)
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-white text-muted">
        <SearchX size={28} />
        <p className="font-medium text-ink">No matching drinks</p>
        <p>Try a different name or category.</p>
      </div>
    );
  return (
    <div className="product-grid grid gap-3.5">
      {products.map((product) => {
        const quantity =
          cart.find((item) => item.productId === product.id)?.quantity ?? 0;
        return (
          <article
            key={product.id}
            className="product-card rounded-[10px] border border-line bg-white p-2.5"
          >
            <div className="relative overflow-hidden rounded-md">
              <DrinkImage
                index={product.imageIndex}
                className="aspect-[4/3] w-full"
              />
              <span className="absolute right-2 top-2 flex items-center gap-1.5 rounded bg-white/95 px-2 py-1 text-[10px] font-medium text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Available
              </span>
            </div>
            <div className="px-1 pb-1 pt-3">
              <div className="flex min-h-10 items-start justify-between gap-2">
                <h3 className="text-[13px] font-semibold leading-[1.4]">
                  {product.shortName}
                </h3>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                  {formatMoney(product.price)}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted">
                {product.category === "Water" ? "Bottled" : "Regular"}
              </p>
              <button
                disabled={locked}
                onClick={() => onAdd(product.id)}
                aria-label={`Add ${product.name}`}
                className={`flex h-9 w-full items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${quantity ? "border-line bg-white text-navy hover:bg-workspace" : "border-navy bg-navy text-white hover:bg-navy-hover"}`}
              >
                <Plus size={14} />
                {quantity ? `Add more (${quantity})` : "Add to order"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
