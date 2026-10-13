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
    <div className="product-grid grid gap-6">
      {products.map((product) => {
        const quantity =
          cart.find((item) => item.productId === product.id)?.quantity ?? 0;
        return (
          <article
            key={product.id}
            className="product-card flex flex-col rounded-[10px] border border-line bg-white p-4"
          >
            <div className="relative overflow-hidden rounded-md">
              <DrinkImage
                index={product.imageIndex}
                className="aspect-[4/3] w-full"
              />
              <span className="absolute right-3 top-3 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-lg font-medium text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Available
              </span>
            </div>
            <div className="flex flex-1 flex-col pt-4">
              <div className="flex min-h-[104px] flex-col items-start justify-between gap-2">
                <h3 className="text-2xl font-semibold leading-snug">
                  {product.shortName}
                </h3>
                <span className="text-xl font-semibold tabular-nums">
                  {formatMoney(product.price)}
                </span>
              </div>
              <p className="mb-5 mt-2 text-lg text-muted">
                {product.category === "Water" ? "Bottled" : "Regular"}
              </p>
              <button
                disabled={locked}
                onClick={() => onAdd(product.id)}
                aria-label={`Add ${product.name}`}
                className={`mt-auto flex min-h-14 w-full items-center justify-center gap-3 rounded-md border px-4 py-3 text-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-600 ${quantity ? "border-slate-400 bg-white text-navy hover:bg-workspace" : "border-navy bg-navy text-white hover:bg-navy-hover"}`}
              >
                <Plus size={20} />
                {quantity ? `Add more (${quantity})` : "Add to order"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
