import { Check, Printer, RotateCcw } from "lucide-react";
import { formatMoney } from "@/lib/transactions";
import type { CompletedTransaction } from "@/types/pos";

export function Receipt({
  transaction,
  onNew,
}: {
  transaction: CompletedTransaction;
  onNew: () => void;
}) {
  const timestamp = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(transaction.timestamp));
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-success text-white">
          <Check size={20} />
        </span>
        <h3
          tabIndex={-1}
          id="receipt-success"
          className="text-2xl font-semibold leading-snug text-green-900"
        >
          Payment successful
        </h3>
        <p className="mt-1 text-lg text-green-800">Your order is complete.</p>
      </div>
      <section
        aria-label="Digital receipt"
        className="receipt-paper rounded-lg border border-line p-4"
      >
        <div className="receipt-header border-b border-dashed border-slate-300 pb-4 text-center">
          <p className="receipt-shop-name text-[28px] font-bold tracking-tight">
            steep & sip<span className="text-success">.</span>
          </p>
          <p className="mt-1 text-lg text-muted">
            Milk tea & everyday refreshment
          </p>
          <p className="mt-3 text-lg font-semibold">{transaction.reference}</p>
          <p className="mt-1 text-lg text-muted">{timestamp} (PHT)</p>
        </div>
        <ul className="space-y-5 border-b border-dashed border-slate-300 py-5">
          {transaction.items.map((item) => (
            <li key={item.productId}>
              <p className="text-lg font-medium leading-relaxed">{item.name}</p>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-lg">
                <span className="text-muted">
                  {item.quantity} × {formatMoney(item.price)}
                </span>
                <span className="tabular-nums">
                  {formatMoney(item.subtotal)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <dl className="receipt-totals space-y-4 pt-5 text-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 font-bold">
            <dt>Total</dt>
            <dd className="money-total">{formatMoney(transaction.total)}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted">Cash paid</dt>
            <dd>{formatMoney(transaction.paid)}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 font-semibold text-success">
            <dt>Change</dt>
            <dd className="money-total">{formatMoney(transaction.change)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-center text-lg text-muted">
          Thanks for stopping by. Sip happy!
        </p>
      </section>
      <div className="mt-auto space-y-4 pt-5 print:hidden">
        <button
          type="button"
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-md border border-slate-400 bg-white px-5 py-3.5 text-lg font-semibold leading-normal text-navy hover:bg-workspace"
          onClick={() => window.print()}
          aria-describedby="receipt-print-hint"
        >
          <Printer size={20} />
          Print Receipt / Save as PDF
        </button>
        <p
          id="receipt-print-hint"
          className="text-lg leading-relaxed text-muted"
        >
          Choose a printer or Save as PDF in the print dialog.
        </p>
        <button type="button" className="primary-button" onClick={onNew}>
          <RotateCcw size={20} />
          New Transaction
        </button>
      </div>
    </div>
  );
}
