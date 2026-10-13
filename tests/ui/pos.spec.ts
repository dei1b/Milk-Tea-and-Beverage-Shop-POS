import { test, expect, type Page } from "@playwright/test";

async function addSampleOrder(page: Page) {
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
  await expect(page.getByTestId("order-total")).toHaveText("₱138.00");
}

test("cash validation, receipt snapshot, new sequence, and refresh reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Review Order", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".product-card")).toHaveCount(6);
  await addSampleOrder(page);
  await expect(page.getByLabel("Quantity of Classic Milk Tea")).toHaveText("2");
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  const cash = page.getByLabel("Cash received");
  const confirm = page.getByRole("button", { name: "Confirm Payment" });
  await expect(cash).toBeFocused();
  await confirm.click();
  await expect(page.locator("#payment-error")).toHaveText(
    "Enter the cash amount.",
  );
  for (const [value, error] of [
    ["-1", "Cash amount cannot be negative."],
    ["137", "Insufficient cash. You need ₱1.00 more."],
    ["200.001", "Enter an amount with at most two decimal places."],
  ]) {
    await cash.fill(value);
    await confirm.click();
    await expect(page.locator("#payment-error")).toHaveText(error);
    await expect(
      page.getByRole("region", { name: "Digital receipt" }),
    ).toHaveCount(0);
  }
  await cash.fill("");
  await cash.pressSequentially("e");
  await confirm.click();
  await expect(page.locator("#payment-error")).toHaveText(
    "Enter a valid numeric amount.",
  );
  await cash.fill("200.50");
  await confirm.click();
  const receipt = page.getByRole("region", { name: "Digital receipt" });
  await expect(receipt).toContainText("TXN-0001");
  await expect(receipt).toContainText("₱62.50");
  await expect(receipt).toContainText("Classic Milk Tea (Regular)");
  await expect(
    page.getByRole("button", {
      name: "Add Taro Milk Tea (Regular)",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(confirm).toHaveCount(0);
  await page.getByRole("button", { name: "New Transaction" }).click();
  await expect(page.getByTestId("order-total")).toHaveText("₱0.00");
  await expect(
    page.getByRole("region", { name: "Digital receipt" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Add Bottled Water", exact: true })
    .click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await page.getByRole("button", { name: "Exact amount" }).click();
  await confirm.click();
  await expect(receipt).toContainText("TXN-0002");
  await expect(receipt).toContainText("₱0.00");
  await page.reload();
  await expect(page.getByTestId("order-total")).toHaveText("₱0.00");
  await page
    .getByRole("button", { name: "Add Bottled Water", exact: true })
    .click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await cash.fill("20");
  await confirm.click();
  await expect(receipt).toContainText("TXN-0001");
  expect(errors).toEqual([]);
});

test("quantity controls, removal, filters, and editing clear payment", async ({
  page,
}) => {
  await page.goto("/");
  await addSampleOrder(page);
  await page.getByRole("button", { name: "Decrease Classic Milk Tea" }).click();
  await expect(page.getByTestId("order-total")).toHaveText("₱79.00");
  await expect(
    page.getByRole("button", { name: "Decrease Classic Milk Tea" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Increase Classic Milk Tea" }).click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await page.getByLabel("Cash received").fill("200");
  await page.getByRole("button", { name: "Edit Order" }).click();
  await page.getByRole("button", { name: "Increase Bottled Water" }).click();
  await page.getByRole("button", { name: "Review Order", exact: true }).click();
  await expect(page.getByLabel("Cash received")).toHaveValue("");
  await expect(page.getByTestId("order-total")).toHaveText("₱158.00");
  await page.getByRole("button", { name: "Edit Order" }).click();
  await page.getByRole("button", { name: "Remove Classic Milk Tea" }).click();
  await page.getByRole("button", { name: "Remove Bottled Water" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review Order", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Fruit tea 1", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All drinks 6", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search drinks" }).fill("taro");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("searchbox", { name: "Search drinks" })
    .fill("not-a-drink");
  await expect(page.getByText("No matching drinks")).toBeVisible();
});

test("entire transaction can be completed with keyboard controls", async ({
  page,
}) => {
  await page.goto("/");
  async function tabTo(name: string) {
    const button = page.getByRole("button", { name, exact: true });
    for (let index = 0; index < 60; index++) {
      await page.keyboard.press("Tab");
      if (
        await button.evaluate((element) => element === document.activeElement)
      )
        return;
    }
    throw new Error(`Keyboard could not reach ${name}`);
  }
  await tabTo("Add Classic Milk Tea (Regular)");
  await page.keyboard.press("Enter");
  await tabTo("Review Order");
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Cash received")).toBeFocused();
  await page.keyboard.type("100");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Edit Order" })).toBeFocused();
  await page.keyboard.press("Tab");
  await tabTo("Confirm Payment");
  const outline = await page
    .getByRole("button", { name: "Confirm Payment" })
    .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Digital receipt" }),
  ).toContainText("₱41.00");
  await tabTo("New Transaction");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("order-total")).toHaveText("₱0.00");
});

for (const width of [1440, 834, 390]) {
  test(`responsive layout stays usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".product-card")).toHaveCount(6);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
    await page.screenshot({
      path: `test-results/catalog-${width}.png`,
      fullPage: true,
    });
    await addSampleOrder(page);
    await page
      .getByRole("button", { name: "Review Order", exact: true })
      .click();
    await page.getByLabel("Cash received").fill("200");
    await page.getByRole("button", { name: "Confirm Payment" }).click();
    await expect(
      page.getByRole("region", { name: "Digital receipt" }),
    ).toContainText("₱62.00");
    await page.screenshot({
      path: `test-results/receipt-${width}.png`,
      fullPage: true,
    });
  });
}
