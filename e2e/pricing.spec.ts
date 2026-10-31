import { expect, test } from "@playwright/test";

// /pricing (CFX-WEB-landing revision 12): early access is free; what you get now and what comes next. No prices.

test("early access is free: what you get now and what comes next (CFX-WEB-landing AC-45, CFX-WEB-landing AC-26)", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Early access is free");
  const offers = page.locator('[data-item="offer"]');
  await expect(offers).toHaveCount(2);
  const expected = [
    ["Early access", "Free", "Join early access", "/#early-access", "Data contracts, exported as YAML or JSON"],
    ["Coming next", "Later", "Talk to us", "mailto:", "Validation against your contracts"],
  ];
  for (const [i, [name, price, cta, href, item]] of expected.entries()) {
    const offer = offers.nth(i);
    await expect(offer.getByRole("heading", { level: 2 })).toHaveText(name);
    await expect(offer.locator("[data-offer-price]")).toHaveText(price);
    await expect(offer.getByRole("link", { name: cta })).toHaveAttribute("href", new RegExp(`^${href.replace("/", "\\/")}`));
    await expect(offer).toContainText(item);
    await expect(offer.locator("svg.lucide").first()).toHaveAttribute("aria-hidden", "true");
  }
  await expect(page.locator("main")).toContainText("follow real usage");
  for (const path of ["/", "/pricing"]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("$");
  }
});

test("there are no plans or comparison table any more (CFX-WEB-landing AC-46)", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator('[data-item="plan"]')).toHaveCount(0);
  await expect(page.locator("[data-compare]")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Readiness Report");
});

test("early-access FAQ answers open without JavaScript (CFX-WEB-landing AC-47)", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/pricing");
  for (const q of ["Why is it free?", "What happens after early access?", "Where does it run?", "Which AI does it use?"]) {
    const item = page.locator("details", { hasText: q });
    await item.locator("summary").click();
    await expect(item).toHaveAttribute("open", "");
  }
  // The answer promises nothing beyond "pricing follows real usage".
  await expect(page.locator("details", { hasText: "What happens after early access?" })).toContainText("follow real usage");
  await context.close();
});

test("the early-access page shares the site's chrome, is reachable from the header and footer, and never scrolls sideways (CFX-WEB-landing AC-49)", async ({ page }, info) => {
  await page.goto("/");
  const chrome = info.project.name === "desktop" ? page.getByRole("navigation", { name: "Main" }) : page.getByRole("contentinfo");
  await chrome.getByRole("link", { name: "Early access", exact: true }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page).toHaveTitle(/^Early access · /);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(0, 0, 0)");
  await page.setViewportSize({ width: 320, height: 700 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
