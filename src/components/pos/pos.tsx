"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  ChevronRight,
  CircleHelp,
  Coffee,
  CupSoda,
  LayoutGrid,
  ListChecks,
  ReceiptText,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { products } from "@/data/products";
import {
  formatMoney,
  getTotal,
  initialSale,
  saleReducer,
} from "@/lib/transactions";
import type { Category } from "@/types/pos";
import { ProductGrid } from "./product-grid";
import { Cart } from "./cart";
import { PaymentForm } from "./payment-form";
import { Receipt } from "./receipt";

function BrandMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy text-white">
      <svg
        width="23"
        height="25"
        viewBox="0 0 23 25"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 8h14l-2 14H7L5 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M4 8h16M14 8l2-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="17" r="1.2" fill="currentColor" />
        <circle cx="14" cy="18" r="1.2" fill="currentColor" />
        <circle cx="12" cy="14" r="1.2" fill="currentColor" />
      </svg>
    </span>
  );
}

export function POS() {
  const [sale, dispatch] = useReducer(saleReducer, initialSale);
  const [category, setCategory] = useState<Category | "All drinks">(
    "All drinks",
  );
  const [search, setSearch] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [date, setDate] = useState("");
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const catalogHeading = useRef<HTMLHeadingElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const update = () =>
      setDate(
        new Intl.DateTimeFormat("en-PH", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Manila",
        }).format(new Date()),
      );
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (sale.stage === "complete")
      document.getElementById("receipt-success")?.focus();
  }, [sale.stage]);
  useEffect(() => {
    if (helpOpen) helpDialog.current?.showModal();
    else helpDialog.current?.close();
  }, [helpOpen]);
  const total = getTotal(sale.cart);
  const count = sale.cart.reduce((sum, item) => sum + item.quantity, 0);
  const visibleProducts = products.filter(
    (product) =>
      (category === "All drinks" || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase()),
  );
  function startNew() {
    dispatch({ type: "new" });
    setCategory("All drinks");
    setSearch("");
    requestAnimationFrame(() => catalogHeading.current?.focus());
  }
  return (
    <div className="compact-pos app-shell min-h-screen bg-workspace text-ink">
      <a href="#catalog" className="skip-link">
        Skip to drink menu
      </a>
      <aside className="nav-rail border-line bg-white">
        <div className="flex items-center gap-2.5 px-4 py-6">
          <BrandMark />
          <div>
            <p className="whitespace-nowrap text-2xl font-bold tracking-tight">
              steep & sip<span className="text-success">.</span>
            </p>
            <p className="mt-0.5 text-lg text-muted">A little cup of happy</p>
          </div>
        </div>
        <div className="px-3 pt-5">
          <p className="mb-3 px-2 text-lg text-muted">Workspace</p>
          <nav aria-label="Main navigation" className="space-y-1.5">
            <a
              href="#catalog"
              aria-current={sale.stage !== "complete" ? "page" : undefined}
              className={`rail-link ${sale.stage !== "complete" ? "active" : ""}`}
            >
              <LayoutGrid size={20} />
              New sale
            </a>
            <a
              href="#order-summary"
              aria-current={sale.stage === "complete" ? "page" : undefined}
              className={`rail-link ${sale.stage === "complete" ? "active" : ""}`}
            >
              <ReceiptText size={20} />
              {sale.stage === "complete" ? "Receipt" : "Current order"}
              {count > 0 && <span className="ml-auto text-lg">{count}</span>}
            </a>
          </nav>
        </div>
        <div className="mt-auto px-4 pb-5">
          <div className="mb-5 rounded-lg border border-line bg-workspace p-3">
            <Banknote size={20} className="mb-2 text-muted" />
            <p className="text-lg font-medium">Keep it simple.</p>
            <p className="mt-1 text-lg leading-relaxed text-muted">
              Good drinks.
              <br />
              Quick cash checkout.
            </p>
          </div>
          <button
            onClick={() => setHelpOpen(true)}
            className="flex min-h-12 w-full items-center gap-2 rounded-md px-1 text-lg text-muted hover:bg-workspace"
          >
            <CircleHelp size={20} />
            Quick guide
          </button>
          <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-workspace text-lg font-semibold">
              C
            </span>
            <div>
              <p className="text-lg font-medium">Cashier</p>
              <p className="text-lg text-muted">Campus counter</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell min-w-0">
        <header className="global-header flex min-h-24 flex-wrap items-center justify-between gap-4 border-b border-line bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Store size={20} className="text-muted" />
            <span className="text-lg font-semibold">Campus counter</span>
            <span className="ml-2 flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-lg text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Open
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="header-date hidden text-lg text-muted sm:inline">
              {date}
            </span>
            <span className="rounded-md border border-line px-2.5 py-1.5 text-lg text-muted">
              Cash register
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-lg text-muted">
                <span>Workspace</span>
                <ChevronRight size={20} />
                <span className="text-ink">New sale</span>
              </div>
              <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
                New sale
              </h1>
              <p className="mt-1.5 text-lg text-muted">
                Choose a drink, review the order, and take payment.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-lg text-muted">
              <Coffee size={20} />
              <span>6 drinks available</span>
            </div>
          </div>
          <div className="workspace-layout grid items-start gap-6">
            <section
              id="catalog"
              className="min-w-0 scroll-mt-4"
              aria-labelledby="catalog-title"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="catalog-title"
                  ref={catalogHeading}
                  tabIndex={-1}
                  className="flex items-center gap-3 text-2xl font-semibold leading-snug tracking-tight"
                >
                  <CupSoda size={20} strokeWidth={1.7} />
                  Drink menu{" "}
                  <span className="ml-1 rounded bg-slate-200/60 px-1.5 py-0.5 text-lg font-medium text-muted">
                    6
                  </span>
                </h2>
                <span className="text-lg text-muted">
                  Select a drink to add
                </span>
              </div>
              <div className="catalog-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
                <div
                  className="flex flex-wrap gap-3"
                  role="group"
                  aria-label="Filter products by category"
                >
                  {(
                    ["All drinks", "Milk tea", "Fruit tea", "Water"] as const
                  ).map((value) => (
                    <button
                      key={value}
                      onClick={() => setCategory(value)}
                      aria-pressed={category === value}
                      className={`category-chip flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-lg font-medium ${category === value ? "border-navy bg-navy text-white" : "border-slate-400 bg-white text-muted hover:bg-slate-100"}`}
                    >
                      {value}
                      <span
                        className={`rounded px-2 text-lg ${category === value ? "bg-white/15" : "bg-workspace"}`}
                      >
                        {value === "All drinks"
                          ? products.length
                          : products.filter((p) => p.category === value).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative w-full min-w-0">
                  <Search
                    size={20}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    aria-label="Search drinks"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search drinks..."
                    className="min-h-14 w-full rounded-md border border-slate-400 bg-white py-3 pl-12 pr-4 text-lg placeholder:text-slate-500"
                  />
                </div>
              </div>
              {sale.stage === "review" && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-line bg-white p-3 text-lg text-muted">
                  <ListChecks size={20} />
                  Reviewing your order. Select Edit Order to make changes.
                </div>
              )}
              {sale.stage === "complete" && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-lg text-green-800"
                >
                  <ReceiptText size={20} />
                  Sale complete. Start a new transaction for the next customer.
                </div>
              )}
              <ProductGrid
                products={visibleProducts}
                cart={sale.cart}
                locked={sale.stage !== "order"}
                onAdd={(productId) => dispatch({ type: "add", productId })}
              />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-lg text-muted">
                <span>{visibleProducts.length} of 6 drinks</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  All prices in Philippine pesos
                </span>
              </div>
            </section>
            <aside
              id="order-summary"
              aria-labelledby="order-title"
              className="summary-panel flex min-h-[640px] min-w-0 scroll-mt-6 flex-col overflow-hidden rounded-[10px] border border-line bg-white xl:sticky xl:top-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
                <h2
                  id="order-title"
                  ref={reviewHeading}
                  className="flex items-center gap-3 text-2xl font-semibold leading-snug"
                >
                  <ShoppingBag size={20} strokeWidth={1.7} />
                  {sale.stage === "complete"
                    ? "Digital receipt"
                    : sale.stage === "review"
                      ? "Review order"
                      : "Order summary"}
                </h2>
                <span className="rounded bg-workspace px-2 py-1 text-lg text-muted">
                  {sale.completed?.reference ?? "New sale"}
                </span>
              </div>
              <div
                className="flex flex-wrap gap-y-3 border-b border-line px-4 py-4 text-lg sm:px-5"
                aria-label="Transaction progress"
              >
                {["Order", "Payment", "Receipt"].map((step, index) => {
                  const current = ["order", "review", "complete"].indexOf(
                    sale.stage,
                  );
                  return (
                    <div
                      key={step}
                      className={`flex flex-1 items-center gap-2 ${current >= index ? "font-medium text-navy" : "text-muted"}`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg ${current >= index ? "bg-navy text-white" : "bg-workspace"}`}
                      >
                        {index + 1}
                      </span>
                      {step}
                      {index < 2 && (
                        <ChevronRight
                          size={20}
                          className="ml-auto mr-2 hidden shrink-0 text-muted sm:block"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {sale.completed ? (
                <Receipt transaction={sale.completed} onNew={startNew} />
              ) : (
                <>
                  <Cart
                    cart={sale.cart}
                    readonly={sale.stage === "review"}
                    onQuantity={(productId, delta) =>
                      dispatch({ type: "quantity", productId, delta })
                    }
                    onRemove={(productId) =>
                      dispatch({ type: "remove", productId })
                    }
                  />
                  <div className="mt-auto border-t border-line p-4 sm:p-5">
                    <dl className="space-y-4 text-lg">
                      <div className="flex flex-wrap justify-between gap-3">
                        <dt className="text-muted">
                          Subtotal{" "}
                          <span>
                            ({count} {count === 1 ? "item" : "items"})
                          </span>
                        </dt>
                        <dd className="tabular-nums">{formatMoney(total)}</dd>
                      </div>
                      <div className="flex flex-wrap justify-between gap-3">
                        <dt className="text-muted">Payment method</dt>
                        <dd className="flex items-center gap-1.5">
                          <Banknote size={20} />
                          Cash
                        </dd>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                        <dt className="text-lg font-semibold">Total amount</dt>
                        <dd className="money-total" data-testid="order-total">
                          {formatMoney(total)}
                        </dd>
                      </div>
                    </dl>
                    {sale.stage === "order" ? (
                      <div className="mt-5">
                        <button
                          disabled={!count}
                          onClick={() => dispatch({ type: "review" })}
                          className="primary-button"
                        >
                          Review Order
                          <ArrowRight size={20} />
                        </button>
                        <p className="mt-3 text-center text-lg text-muted">
                          Double-check the order before taking payment.
                        </p>
                      </div>
                    ) : (
                      <>
                        <button
                          className="mt-5 flex min-h-12 items-center gap-3 rounded px-3 py-2 text-lg font-medium text-muted hover:bg-workspace hover:text-ink"
                          onClick={() => dispatch({ type: "edit" })}
                        >
                          <ArrowLeft size={20} />
                          Edit Order
                        </button>
                        <PaymentForm
                          total={total}
                          payment={sale.payment}
                          error={sale.error}
                          onChange={(value) =>
                            dispatch({ type: "payment", value })
                          }
                          onConfirm={(raw, badInput) =>
                            dispatch({
                              type: "confirm",
                              raw,
                              badInput,
                              timestamp: new Date().toISOString(),
                            })
                          }
                        />
                      </>
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>
          <footer className="mt-8 flex flex-wrap justify-between gap-4 text-lg text-muted">
            <span>steep & sip. / Campus counter</span>
            <span>Cash payments</span>
          </footer>
        </main>
      </div>
      <dialog
        ref={helpDialog}
        onCancel={() => setHelpOpen(false)}
        onClose={() => setHelpOpen(false)}
        className="help-dialog rounded-xl border border-line bg-white p-6 text-ink"
      >
        <div className="mb-4 flex items-center justify-between gap-5">
          <h2 className="text-2xl font-semibold leading-snug">A quick guide</h2>
          <button
            aria-label="Close quick guide"
            onClick={() => setHelpOpen(false)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded hover:bg-workspace"
          >
            <X size={20} />
          </button>
        </div>
        <ol className="list-decimal space-y-3 pl-5 text-lg leading-relaxed text-muted">
          <li>Add drinks and adjust quantities in the order summary.</li>
          <li>
            Select Review Order. Use Edit Order if anything needs changing.
          </li>
          <li>Enter cash received, then select Confirm Payment.</li>
          <li>
            Check the change and receipt. Select New Transaction for your next
            customer.
          </li>
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-lg leading-relaxed text-muted">
          You can use Tab and Shift+Tab to move through controls, and Enter or
          Space to select buttons. Refreshing the page clears the current sale.
        </p>
      </dialog>
    </div>
  );
}
