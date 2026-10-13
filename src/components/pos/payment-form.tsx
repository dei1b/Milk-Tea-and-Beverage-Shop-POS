import { Banknote, Check, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatMoney, validatePayment } from "@/lib/transactions";

export function PaymentForm({
  total,
  payment,
  error,
  onChange,
  onConfirm,
}: {
  total: number;
  payment: string;
  error: string;
  onChange: (value: string) => void;
  onConfirm: (raw: string, badInput: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const preview = validatePayment(payment, total);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm(
          input.current?.value ?? payment,
          input.current?.validity.badInput ?? false,
        );
      }}
      className="mt-4"
    >
      <label htmlFor="cash-amount" className="mb-2 block text-xs font-semibold">
        Cash received
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3 text-sm text-muted">
          ₱
        </span>
        <input
          ref={input}
          id="cash-amount"
          name="cash"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={payment}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "payment-error" : "payment-hint"}
          placeholder="0.00"
          className="h-11 w-full rounded-md border border-line bg-white pl-8 pr-3 text-sm tabular-nums"
        />
      </div>
      <p id="payment-hint" className="mt-2 text-xs text-muted">
        Enter the cash handed to you by the customer.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange((total / 100).toFixed(2))}
          className="cash-chip"
        >
          Exact amount
        </button>
        {[20000, 50000]
          .filter((value) => value >= total)
          .map((value) => (
            <button
              key={value}
              type="button"
              className="cash-chip"
              onClick={() => onChange((value / 100).toFixed(2))}
            >
              {formatMoney(value)}
            </button>
          ))}
      </div>
      <div className="my-4 flex items-center justify-between rounded-md bg-workspace px-3 py-3 text-xs">
        <span className="text-muted">Change to return</span>
        <strong className="font-semibold tabular-nums">
          {preview.ok ? formatMoney(preview.change) : "—"}
        </strong>
      </div>
      {error && (
        <p
          role="alert"
          id="payment-error"
          className="mb-3 flex items-start gap-2 rounded-md bg-red-50 p-3 text-xs leading-5 text-red-700"
        >
          <TriangleAlert className="mt-0.5 shrink-0" size={15} />
          {error}
        </p>
      )}
      <button type="submit" className="primary-button">
        <Check size={16} />
        Confirm Payment
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Banknote size={13} />
        Cash payment
      </p>
    </form>
  );
}
