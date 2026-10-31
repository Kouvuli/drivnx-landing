import { expect, test } from "@playwright/test";

// /pricing (CFX-WEB-landing revision 7): plans, comparison table and FAQ; no dollar amounts.

test("four plans with price lines, CTAs and what each includes (CFX-WEB-landing AC-45, CFX-WEB-landing AC-26)", async ({ page }) => {
  await page.goto("/pricing");
  const plans = page.locator('[data-item="plan"]');
  await expect(plans).toHaveCount(4);
  const expected = [
    ["Free / Local", "Free", "Join early access", "/#early-access", "Includes:"],
    ["Pro", "Early access", "Join early access", "/#early-access", "Everything in Free / Local, plus:"],
    ["Team", "Early access", "Join early access", "/#early-access", "Everything in Pro, plus:"],
    ["Enterprise", "Contact us", "Talk to us", "mailto:", "Everything in Team, plus:"],
  ];
  for (const [i, [name, price, cta, href, includes]] of expected.entries()) {
    const plan = plans.nth(i);
    await expect(plan.getByRole("heading", { level: 2 })).toHaveText(name);
    await expect(plan.locator("[data-plan-price]")).toHaveText(price);
    await expect(plan.getByRole("link", { name: cta })).toHaveAttribute("href", new RegExp(`^${href.replace("/", "\\/")}`));
    await expect(plan).toContainText(includes);
    await expect(plan.locator("svg.lucide").first()).toHaveAttribute("aria-hidden", "true");
  }
  await expect(page.locator("main")).toContainText("follow real usage");
  for (const path of ["/", "/pricing"]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("$");
  }
});

test("compare features across plans: twelve capabilities in five groups (CFX-WEB-landing AC-46)", async ({ page }) => {
  await page.goto("/pricing");
  const table = page.locator("[data-compare] table");
  await expect(page.getByRole("heading", { name: "Compare features across plans" })).toBeVisible();
  const groups = await table.locator('th[scope="colgroup"]').allInnerTexts();
  expect(groups).toEqual(["Data products", "Understanding", "Building", "Trust & control", "Collaboration & governance"]);
  await expect(table.locator('th[scope="row"]')).toHaveCount(12);
  await expect(table.locator('thead th[scope="col"]')).toHaveCount(5);
  const row = (name: string) => table.locator("tr", { has: page.locator(`th[scope="row"]`, { hasText: name }) });
  await expect(row("Profiling")).toContainText("Manual");
  await expect(row("Profiling")).toContainText("Policy-driven");
  await expect(row("Deployment controls").locator("td").last()).toHaveText("Included");
  await expect(row("Deployment controls").locator("td").first()).toHaveText("Not included");
});

test("the comparison scrolls inside its box on phones, never the page (CFX-WEB-landing AC-46, CFX-WEB-landing AC-49)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/pricing");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const box = page.locator("[data-compare]");
  expect(await box.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
});

test("pricing FAQ answers open without JavaScript (CFX-WEB-landing AC-47)", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/pricing");
  for (const q of ["Why are there no prices yet?", "What is a managed data product?", "What is the free Readiness Report?", "on my own infrastructure?"]) {
    const item = page.locator("details", { hasText: q });
    await item.locator("summary").click();
    await expect(item).toHaveAttribute("open", "");
  }
  // Revision 8: the answer says only what v2 §12 says; no promises v2 doesn't make.
  const noPrices = page.locator("details", { hasText: "Why are there no prices yet?" });
  await expect(noPrices).toContainText("follow real usage");
  await expect(noPrices).not.toContainText("early customers");
  await context.close();
});

test("the pricing page shares the site's chrome and is reachable from the header and footer (CFX-WEB-landing AC-49)", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "desktop") {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Pricing" }).click();
  } else {
    await page.getByRole("contentinfo").getByRole("link", { name: "Pricing" }).click();
  }
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page).toHaveTitle(/^Pricing · /);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(0, 0, 0)");
});
