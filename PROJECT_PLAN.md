# Milk Tea and Beverage Shop POS — Project Plan

## 1. Objective and scope

Build a cashier-operated POS for a beverage stall near campus. The application must support browsing products, editing a cart, reviewing an order, entering cash payment, computing change, confirming payment, displaying a digital receipt, and starting a new transaction.

Support mouse and keyboard use on desktop or laptop screens. All transaction actions must be available through labeled buttons and inputs. Use native keyboard navigation, visible focus indicators, and readable validation messages.

Technology stack: **Next.js** with the App Router and React for the interface, **Tailwind CSS** for styling, and TypeScript for product and transaction types. Implement the interactive POS as a client component using React state. Hardcode the six products and their prices in a local data file. No database, ORM, external data service, or backend API is needed.

Keep the cart, payment input, validation messages, completed receipt, and transaction sequence in memory for the current browser session. New Transaction resets the current sale while preserving the sequence. Refreshing or closing the page clears the transaction state and restarts the sequence; persistent sales history is outside this scope.

Initial scope: six fixed products, whole-number quantities, Philippine peso prices, cash payments, and an on-screen receipt. Inventory tracking, accounts, discounts, online payments, sales reports, printing, and persistent sales history are optional later work.

## 2. Product catalog

| Product | Price |
| --- | ---: |
| Classic Milk Tea (Regular) | ₱59.00 |
| Wintermelon Milk Tea (Regular) | ₱65.00 |
| Taro Milk Tea (Regular) | ₱65.00 |
| Fruit Tea — Lychee (Regular) | ₱55.00 |
| Brown Sugar Milk Tea (Regular) | ₱69.00 |
| Bottled Water | ₱20.00 |

Define the catalog as a hardcoded product array in `src/data/products.ts`, with a stable ID, name, and price in integer centavos for each product. Format displayed amounts as Philippine pesos with two decimal places. Cart totals, payment results, and receipts must be calculated from the cashier's actions, not hardcoded.

## 3. Interface plan

Use a compact main screen with the product catalog on the left and a persistent cart/order summary on the right. Keep the payment controls beside the total. Show the receipt in a dedicated confirmation panel after payment.

Use Tailwind utility classes for spacing, typography, borders, button states, visible keyboard focus, and responsive layouts. Use white panels, subtle borders, and dark navy primary actions. Keep the cart visible beside the catalog on wider screens and stack the panels on narrower screens.

| Area | Content and behavior |
| --- | --- |
| Header | Shop name and short transaction instructions |
| Product catalog | Six product cards, each with name, price, and an Add button |
| Cart / order summary | Product name, unit price, quantity, decrease/increase buttons, subtotal, Remove button, and overall total |
| Review stage | Read-only order summary, Edit Order button, cash input, validation message, and Confirm Payment button |
| Confirmation / receipt | Successful-payment message, reference, date/time, purchased items, totals, cash paid, change, and New Transaction button |

Empty state: show “Your cart is empty. Add a drink to begin.” Disable Review Order until at least one item is present.

At quantity one, disable the decrease button; the separate Remove button removes the item. Adding the same product again increases its existing quantity.

## 4. Transaction flow

1. **Browse Products:** Show every product and its price immediately.
2. **Add to Cart:** Add products and allow quantity changes and removal. Recalculate subtotals and the total after every change.
3. **Review Order:** Review Order opens a clear summary. Edit Order returns to the editable cart and clears any entered payment and validation message.
4. **Enter Payment:** Cashier types the amount into a labeled numeric input with a 0.01 step.
5. **Validate & Compute:** Confirm Payment validates the current input against the current total. Failed validation leaves the order unpaid and displays a specific error.
6. **Confirm Payment:** A valid payment creates one completed transaction snapshot and displays success with the transaction details. Disable further payment submission and cart editing for that completed transaction.
7. **Receipt / New Transaction:** Display the digital receipt from the completed snapshot. New Transaction clears the cart, cash input, errors, confirmation, and receipt, then returns to browsing. The reference sequence continues rather than restarting.

## 5. Calculation and validation rules

- Item subtotal = unit price × quantity.
- Total amount = sum of item subtotals.
- Change = valid amount paid − total amount.
- Quantities must be positive whole numbers.
- Convert accepted payment to integer centavos before comparing or subtracting. Reject more than two decimal places rather than silently rounding.
- Do not allow payment for an empty cart.
- Allocate the transaction reference only when payment succeeds. Use a session sequence such as `TXN-0001`, `TXN-0002`; persistent or cross-device uniqueness is outside the initial scope.
- Check native numeric-input validity, including `badInput`, before classifying an empty value: browsers may expose invalid numeric text as an empty value. Never silently convert partial text into a valid payment.

| Invalid condition | On-screen message |
| --- | --- |
| Blank payment | Enter the cash amount. |
| Non-numeric or non-finite payment | Enter a valid numeric amount. |
| Negative payment | Cash amount cannot be negative. |
| More than two decimal places | Enter an amount with at most two decimal places. |
| Insufficient payment | Insufficient cash. You need ₱[remaining amount] more. |
| Empty cart | Add at least one product before payment. |

Exact payment is valid and displays ₱0.00 change. Zero payment is insufficient for any nonempty order.

## 6. Data and file organization

| Data | Fields |
| --- | --- |
| Product | ID, name, unit price in centavos |
| Cart item | Product ID, quantity; derive subtotal from catalog price |
| Active transaction | Stage, cart items, raw payment input, validation message |
| Completed transaction | Reference, timestamp, copied item names/prices/quantities/subtotals, total, paid amount, change |

Keep the hardcoded catalog in a local module and import it directly into the POS. Manage the active sale with React state or a reducer in the client component. Derive subtotals and totals from the cart rather than storing duplicate totals in state. Keep calculation and validation functions separate from React rendering so they can be checked directly. Build the receipt from the copied completed transaction, not mutable cart data.

Use the Next.js page to render the POS client component. Create the completed transaction timestamp and reference only in the successful-payment event handler. No API routes, server actions, database migrations, or environment secrets are required for the POS flow.

Suggested files:

```text
Milk Tea and Beverage Shop POS/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout and page metadata
│   │   ├── page.tsx        # Main POS route
│   │   └── globals.css     # Tailwind entry and shared base styles
│   ├── components/pos/
│   │   ├── pos.tsx         # Client component: transaction state and flow
│   │   ├── product-grid.tsx # Product cards and Add actions
│   │   ├── cart.tsx        # Quantity controls and order summary
│   │   ├── payment-form.tsx # Cash input and validation feedback
│   │   └── receipt.tsx     # Confirmation, receipt, and New Transaction
│   ├── data/
│   │   └── products.ts     # Six hardcoded products and prices
│   ├── lib/
│   │   └── transactions.ts # Pure calculation, formatting, and validation helpers
│   └── types/
│       └── pos.ts          # Product, cart, and completed transaction types
├── tests/
│   └── transactions.test.ts # Meaningful money and validation checks
├── package.json            # Dependencies and dev/build/test scripts
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # Tailwind/PostCSS integration
├── tsconfig.json           # TypeScript configuration
├── README.md               # Run instructions and feature overview
└── PROJECT_PLAN.md
```

## 7. Implementation milestones

| Milestone | Work | Completion condition |
| --- | --- | --- |
| 1. Setup, interface, and catalog | Initialize Next.js with TypeScript and Tailwind; build components and import the hardcoded catalog | App runs locally; every name/price is correct and every Add button works |
| 2. Cart and totals | Implement React state, add, increase, decrease, remove, empty state, and derived totals | Summary always matches the current cart |
| 3. Review and payment | Add review/edit transitions, numeric input, specific validation, and centavo calculations | Invalid payment cannot complete an order; valid payment computes correct change |
| 4. Confirmation and receipt | Snapshot completed transaction, generate reference, show confirmation/receipt, and reset | Receipt has all required fields; New Transaction clears prior transaction data |
| 5. Verification and handoff | Check calculations, transaction flow, keyboard navigation, TypeScript, and production build; document install and run commands | All acceptance checks pass, the Next.js build succeeds, and the project can be run from the README |

## 8. Acceptance checks

1. All six catalog entries match the supplied names and prices.
2. Adding a product twice produces one cart row with quantity two.
3. Increase, decrease, and Remove update the displayed totals immediately.
4. Decrease cannot produce a zero or negative quantity.
5. Removing the final item restores the empty state and disables Review Order.
6. Two Classic Milk Teas plus one Bottled Water show subtotals ₱118.00 and ₱20.00, with total ₱138.00.
7. For that order: blank, alphabetic/invalid numeric input, −₱1.00, and ₱137.00 each produce the correct rejection; no receipt is created.
8. ₱138.00 completes payment with ₱0.00 change; ₱200.00 produces ₱62.00 change; ₱200.50 produces ₱62.50 change.
9. A payment with more than two decimal places is rejected.
10. Editing a reviewed order clears the prior payment input; the next confirmation uses the updated total.
11. Successful payment displays confirmation and a receipt with reference, items, quantities, subtotals, total, cash paid, and change.
12. Repeated clicks on Confirm Payment cannot create another completed transaction.
13. New Transaction clears all previous cart, payment, errors, confirmation, and receipt data. The next completed sale gets a new reference.
14. A cashier can finish the entire flow using Tab, Shift+Tab, Enter/Space, and keyboard text entry, with visible focus and clear error feedback.
15. All six products load from the hardcoded catalog and the full transaction flow works without a database or external data API.
16. Refreshing the page clears the in-memory transaction state, while New Transaction preserves the reference sequence within the running session.
17. The Next.js production build and TypeScript checks pass; Tailwind styling renders correctly in the built application.

The project is complete when all twelve supplied feature requirements and these acceptance checks are satisfied.
