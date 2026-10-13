# Steep & Sip — Milk Tea and Beverage Shop POS

A compact cashier interface built with Next.js App Router, React, TypeScript, and Tailwind CSS. Includes the six fixed products from PROJECT_PLAN.md, search/category filters, editable quantities, order review, cash validation, change calculation, and a digital receipt.

## Run locally

Requires Node.js 20.9 or later and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For a production server, run `npm run build` followed by `npm start`.

## Verify

```sh
npm test
npm run typecheck
npm run build
```

Browser acceptance checks use Playwright:

```sh
npx playwright install chromium
npm run test:ui
```

## Cashier flow

Add drinks, adjust quantities, and choose **Review Order**. Enter **Cash received**, then choose **Confirm Payment**. The receipt includes copied order details, a reference, the payment timestamp in Philippine time, total, cash paid, and change. **New Transaction** clears the sale and keeps the reference sequence running. **Edit Order** clears payment and validation before returning to cart editing.

Prices and calculations use integer centavos. Payment validation checks native numeric-input `badInput` before empty input, rejects non-finite or partial numeric text and amounts with over two decimal places, and prevents insufficient payment. Receipt creation and reference allocation are guarded in the reducer so repeated confirmation cannot complete a second sale.

State stays in memory: refreshing or closing the page clears the sale and restarts references at TXN-0001. There is no database, backend API, persistent sales history, tax, discount, or inventory service. All drink images and fonts are served locally.

Product definitions: `src/data/products.ts`. Money/state helpers: `src/lib/transactions.ts`. Cashier interface: `src/components/pos/`.

See `DESIGN_NOTES.md` for the visual system and generated imagery details.

See `VERIFICATION.md` for completed checks and the standalone browser-runner limitation on this machine.
