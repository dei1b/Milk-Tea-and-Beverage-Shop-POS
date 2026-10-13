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
      className="mt-6"
    >
      <label htmlFor="cash-amount" className="mb-2 block text-lg font-semibold">
        Cash received
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted">
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
          className="min-h-14 w-full rounded-md border border-slate-400 bg-white py-3 pl-10 pr-4 text-xl tabular-nums placeholder:text-slate-500"
        />
      </div>
      <p id="payment-hint" className="mt-2 text-lg text-muted">
        Enter the cash handed to you by the customer.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
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
      <div className="my-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-workspace p-4 text-lg">
        <span className="text-muted">Change to return</span>
        <strong className="money-total">
          {preview.ok ? formatMoney(preview.change) : "—"}
        </strong>
      </div>
      {error && (
        <p
          role="alert"
          id="payment-error"
          className="mb-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-lg leading-relaxed text-red-800"
        >
          <TriangleAlert className="mt-0.5 shrink-0" size={20} />
          {error}
        </p>
      )}
      <button type="submit" className="primary-button">
        <Check size={20} />
        Confirm Payment
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-lg text-muted">
        <Banknote size={20} />
        Cash payment
      </p>
    </form>
  );
}
