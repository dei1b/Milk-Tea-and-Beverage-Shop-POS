import { Check, RotateCcw } from "lucide-react";
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
          className="text-sm font-semibold text-green-900"
        >
          Payment successful
        </h3>
        <p className="mt-1 text-xs text-green-800">Your order is complete.</p>
      </div>
      <section
        aria-label="Digital receipt"
        className="receipt-paper rounded-lg border border-line p-4"
      >
        <div className="border-b border-dashed border-slate-300 pb-4 text-center">
          <p className="text-lg font-bold tracking-tight">
            steep & sip<span className="text-success">.</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Milk tea & everyday refreshment
          </p>
          <p className="mt-3 text-xs font-semibold">{transaction.reference}</p>
          <p className="mt-1 text-[10px] text-muted">{timestamp} (PHT)</p>
        </div>
        <ul className="space-y-3 border-b border-dashed border-slate-300 py-4">
          {transaction.items.map((item) => (
            <li key={item.productId}>
              <p className="text-xs font-medium leading-4">{item.name}</p>
              <div className="mt-1 flex justify-between text-xs">
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
        <dl className="space-y-2 pt-4 text-xs">
          <div className="flex justify-between text-sm font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(transaction.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Cash paid</dt>
            <dd>{formatMoney(transaction.paid)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-success">
            <dt>Change</dt>
            <dd>{formatMoney(transaction.change)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-center text-xs text-muted">
          Thanks for stopping by. Sip happy!
        </p>
      </section>
      <div className="mt-auto pt-5">
        <button className="primary-button" onClick={onNew}>
          <RotateCcw size={15} />
          New Transaction
        </button>
      </div>
    </div>
  );
}
