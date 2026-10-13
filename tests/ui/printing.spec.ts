import { test, expect } from "@playwright/test";

test("print dialog return preserves the completed receipt and reference sequence", async ({
  page,
}) => {
  // Both Print and Cancel return undefined from window.print(). Simulate that
  // return and the browser lifecycle without sending a job to a real printer.
  await page.addInitScript(() => {
    const calls: number[] = [];
    Object.assign(window, { printCalls: calls });
    window.print = () => {
      window.dispatchEvent(new Event("beforeprint"));
      calls.push(1);
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await page.goto("/");
  const print = page.getByRole("button", {
    name: "Print Receipt / Save as PDF",
    exact: true,
  });
  await expect(print).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Add Classic Milk Tea (Regular)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Add Classic Milk Tea (Regular)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Add Bottled Water", exact: true })
    .click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await expect(print).toHaveCount(0);
  await page.getByLabel("Cash received").fill("200.50");
  await page
    .getByRole("button", { name: "Confirm Payment", exact: true })
    .click();
  const receipt = page.getByRole("region", {
    name: "Digital receipt",
    exact: true,
  });
  const snapshot = await receipt.innerText();
  for (let attempt = 1; attempt <= 2; attempt++) {
    await print.click();
    expect(
      await page.evaluate(
        () => (window as Window & { printCalls?: number[] }).printCalls?.length,
      ),
    ).toBe(attempt);
    expect(await receipt.innerText()).toBe(snapshot);
    await expect(
      page.getByRole("button", { name: "Confirm Payment", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add Bottled Water", exact: true }),
    ).toBeDisabled();
  }
  await page
    .getByRole("button", { name: "New Transaction", exact: true })
    .click();
  await expect(print).toHaveCount(0);
  await page
    .getByRole("button", { name: "Add Bottled Water", exact: true })
    .click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await page.getByLabel("Cash received").fill("20");
  await page
    .getByRole("button", { name: "Confirm Payment", exact: true })
    .click();
  await expect(receipt).toContainText("TXN-0002");
});

test("print media isolates the receipt and allows unclipped PDF output", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  // Use the complete catalog to exercise a longer receipt and pagination.
  for (const button of await page.locator(".product-card button").all())
    await button.click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await page.getByLabel("Cash received").fill("500");
  await page
    .getByRole("button", { name: "Confirm Payment", exact: true })
    .click();
  const receipt = page.getByRole("region", {
    name: "Digital receipt",
    exact: true,
  });
  const snapshot = await receipt.innerText();
  await page.emulateMedia({ media: "print" });
  await expect(receipt).toBeVisible();
  for (const selector of [
    ".nav-rail",
    ".global-header",
    "#catalog",
    "#order-title",
    "#receipt-success",
    "#receipt-print-hint",
    "footer",
    "button",
    "input",
  ]) {
    for (const element of await page.locator(selector).all())
      await expect(element).toBeHidden();
  }
  const visibleText = await page.locator("body").innerText();
  expect(visibleText.trim()).toBe(snapshot.trim());
  for (const text of [
    "steep & sip",
    "TXN-0001",
    "(PHT)",
    "Classic Milk Tea (Regular)",
    "Wintermelon Milk Tea (Regular)",
    "Taro Milk Tea (Regular)",
    "Fruit Tea — Lychee (Regular)",
    "Brown Sugar Milk Tea (Regular)",
    "Bottled Water",
    "1 × ₱59.00",
    "₱333.00",
    "₱500.00",
    "₱167.00",
  ])
    expect(visibleText).toContain(text);
  for (const width of [794, 302]) {
    await page.setViewportSize({ width, height: 1123 });
    const layout = await receipt.evaluate((element) => {
      const ancestors: {
        overflow: string;
        position: string;
        minHeight: string;
      }[] = [];
      for (
        let ancestor = element.parentElement;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        const style = getComputedStyle(ancestor);
        ancestors.push({
          overflow: style.overflow,
          position: style.position,
          minHeight: style.minHeight,
        });
      }
      return {
        width: element.clientWidth,
        scroll: element.scrollWidth,
        ancestors,
      };
    });
    expect(layout.scroll).toBeLessThanOrEqual(layout.width);
    expect(
      layout.ancestors.every(
        (style) =>
          style.overflow === "visible" &&
          style.position === "static" &&
          style.minHeight === "0px",
      ),
    ).toBe(true);
  }
  await page.pdf({
    path: testInfo.outputPath("receipt-a4.pdf"),
    format: "A4",
    printBackground: false,
    displayHeaderFooter: false,
  });
  await page.pdf({
    path: testInfo.outputPath("receipt-narrow.pdf"),
    width: "80mm",
    height: "297mm",
    printBackground: false,
    displayHeaderFooter: false,
  });
  await page.emulateMedia({ media: "screen" });
  expect(await receipt.innerText()).toBe(snapshot);
  await expect(
    page.getByRole("button", {
      name: "Print Receipt / Save as PDF",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "New Transaction", exact: true }),
  ).toBeVisible();
});
