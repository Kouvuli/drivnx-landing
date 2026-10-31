import { expect, test, type Page } from "@playwright/test";
import { E2E_ENDPOINT } from "../playwright.config";

const demoStatus = (page: Page) => page.locator("#demo").getByRole("status");

test("hero headline and call to action are visible without scrolling (CFX-WEB-landing AC-01)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Understand your data before you use it.");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(page.getByRole("main").getByRole("link", { name: "Join early access" }).first()).toBeInViewport();
});

test("sections follow the vision's narrative, and the header links to them (CFX-WEB-landing AC-11)", async ({ page }, info) => {
  await page.goto("/");
  const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["connects", "problem", "how-it-works", "demo", "trust", "lifecycle", "ai-privacy", "who", "about", "faq", "early-access"]);
  if (info.project.name === "desktop") {
    const nav = page.getByRole("navigation", { name: "Main" });
    const links = { "How it works": "/#how-it-works", Pricing: "/pricing", "AI & privacy": "/#ai-privacy", FAQ: "/#faq" };
    for (const [name, href] of Object.entries(links)) await expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    await expect(page.getByRole("banner").getByRole("link", { name: "Join early access" })).toHaveAttribute("href", "/#early-access");
  }
});

test("pricing is not on the home page; AI & privacy says what was agreed (CFX-WEB-landing AC-12, CFX-WEB-landing AC-13)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#pricing")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("$");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  const privacy = page.locator("#ai-privacy");
  for (const text of [
    "everything still works with AI switched off",
    "Metadata-only mode",
    "Local engine on request",
    "In transit and at rest",
    "Deleted on request",
    "You approve consequential changes",
  ]) {
    await expect(privacy).toContainText(text);
  }
  await expect(page.locator("body")).not.toContainText(/never leaves/i);
});

test("trust model and lifecycle follow the vision (CFX-WEB-landing AC-48)", async ({ page }) => {
  await page.goto("/");
  const trust = page.locator("#trust");
  for (const state of ["Observed", "Inferred", "Confirmed", "Defined", "Validated"]) await expect(trust).toContainText(state);
  await expect(trust).toContainText("customer_id is 99.8% unique");
  await expect(trust).toContainText("customer_id must be non-null and unique");
  const lifecycle = page.locator("#lifecycle");
  await expect(lifecycle).toContainText("Changes → Impact → Rebuild → Revalidate → Republish");
  await expect(lifecycle).toContainText("scheduled sync and drift alerts");
  for (const dimension of ["Knowledge impact", "Contract impact", "Pipeline impact", "Output impact"]) {
    await expect(lifecycle).toContainText(dimension);
  }
});

test("accepting the suggestion links the records, and reset restores it (CFX-WEB-landing AC-06, CFX-WEB-landing AC-07, CFX-WEB-landing AC-09, CFX-WEB-landing AC-10)", async ({ page }) => {
  await page.goto("/");
  await page.locator("#demo").scrollIntoViewIfNeeded();
  const status = demoStatus(page);
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toContainText("312 orders have no matching customer");
  await expect(status).toContainText("cust_no → customer_id (94% match)");
  await expect(page.getByTestId("rf__edge-link")).toContainText("94%");

  // Keyboard path: focus the button and press Enter.
  await page.getByRole("button", { name: "Accept suggestion" }).focus();
  await page.keyboard.press("Enter");
  await expect(status).toHaveText("Link approved. All 4,812 orders matched to a customer");
  await expect(page.getByTestId("rf__edge-link")).toContainText("Approved");
  await expect(page.locator('[data-issue="link"]')).toHaveAttribute("data-fixed", "true");

  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Enter");
  await expect(status).toContainText("312 orders have no matching customer");
  await expect(page.locator('[data-issue="link"]')).toHaveAttribute("data-fixed", "false");
});

test("three issues, a dry run, then sending (CFX-WEB-landing AC-35, CFX-WEB-landing AC-36)", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator("#demo");
  await demo.scrollIntoViewIfNeeded();
  const progress = demo.locator("[data-demo-progress]");
  const odoo = page.getByRole("button", { name: "Odoo", exact: true });
  const dryRun = page.getByRole("button", { name: "Run dry run" });

  await expect(demo.locator("[data-issue]")).toHaveCount(3);
  await expect(progress).toHaveText("0 of 3 fixed");
  await expect(dryRun).toBeDisabled();

  await page.getByRole("button", { name: "Accept suggestion" }).click();
  await expect(progress).toHaveText("1 of 3 fixed");
  await expect(odoo).toBeDisabled();
  await page.getByRole("button", { name: "Merge" }).click();
  await expect(demoStatus(page)).toContainText("Merged “ACME, Inc.” into “Acme Inc.”");
  await page.getByRole("button", { name: "Convert dates" }).click();
  await expect(progress).toHaveText("3 of 3 fixed");
  await expect(odoo).toBeDisabled();

  await dryRun.click();
  await expect(demo.locator("[data-dry-run]")).toHaveAttribute("data-dry-run", "running");
  await expect(demo.locator("[data-dry-run]")).toHaveAttribute("data-dry-run", "passed");
  await expect(demo.locator("[data-dry-run]")).toContainText("0 violations");
  await expect(demoStatus(page)).toHaveText("Dry run passed: 0 violations. Ready to send.");
  for (const name of ["Odoo", "Files", "Cloud storage", "Warehouse"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
  }
  await odoo.click();
  await expect(page.getByText("Ready for Odoo: 4,812 orders")).toBeVisible();

  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(progress).toHaveText("0 of 3 fixed");
  await expect(odoo).toBeDisabled();
  await expect(demo.locator("[data-dry-run]")).toHaveCount(0);
});

async function dragHandle(page: Page, from: string, to: string) {
  const source = page.locator(`.react-flow__handle[data-handleid="${from}"]`);
  const target = page.locator(`.react-flow__handle[data-handleid="${to}"]`);
  const a = (await source.boundingBox())!;
  const b = (await target.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
}

test("drawing the link by hand resolves the demo; a wrong link gives a hint (CFX-WEB-landing AC-08)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Dragging is the pointer path; phones use Accept suggestion (CFX-WEB-landing AC-07).");
  await page.goto("/");
  const status = demoStatus(page);
  await page.locator("#demo").scrollIntoViewIfNeeded();
  // React Flow draws edges only after measuring nodes on the client: the demo is interactive from here.
  await expect(page.getByTestId("rf__edge-link")).toBeVisible();

  await dragHandle(page, "order_id", "customer_id");
  await expect(status).toHaveText("Those columns don't match. Try cust_no → customer_id.");

  await dragHandle(page, "cust_no", "customer_id");
  await expect(status).toHaveText("Link approved. All 4,812 orders matched to a customer");
});

test("a visitor joins early access (CFX-WEB-landing AC-02)", async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route(E2E_ENDPOINT, async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/#early-access");
  await page.getByLabel("Work email").fill("sam@shop.com");
  await page.getByLabel("Consultant or partner").check();
  await page.getByLabel(/free Readiness Report/).check();
  await page.getByRole("button", { name: "Join early access" }).click();

  await expect(page.getByText("You're on the list")).toBeVisible();
  expect(bodies).toEqual([{ email: "sam@shop.com", segment: "consultant", readinessReport: true, source: "landing" }]);
});

test("FAQ answers open without JavaScript (CFX-WEB-landing AC-14)", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const q = "Does my data leave my environment?";
  await page.getByText(q).click();
  await expect(page.locator("details", { hasText: q })).toHaveAttribute("open", "");
  // Revision 8: the ChatGPT item came from competition notes kept out of v2.
  await expect(page.locator("#faq")).not.toContainText("ChatGPT");
  await context.close();
});

test("who it's for starts with businesses moving onto an ERP, then data teams (CFX-WEB-landing AC-52)", async ({ page }) => {
  await page.goto("/");
  const audiences = page.locator('#who [data-item="audience"]');
  await expect(audiences.nth(0)).toContainText("Starting with");
  await expect(audiences.nth(0)).toContainText("Businesses moving onto an ERP");
  await expect(audiences.nth(1)).toContainText("Growing into");
  await expect(audiences.nth(1)).toContainText("Data analysts and engineers");
});

const SUPPORTING_LINE =
  "Profiling, documentation, contracts, transformation, and validation in one workspace — with Claude assistance you can switch off.";

test("the hero carries v2's supporting line under the subhead (CFX-WEB-landing AC-51, CFX-WEB-landing AC-01)", async ({ page }) => {
  await page.goto("/");
  const line = page.getByRole("main").getByText(SUPPORTING_LINE);
  await expect(line).toBeVisible();
  const subhead = (await page.locator("[data-hero-subhead]").boundingBox())!;
  expect((await line.boundingBox())!.y).toBeGreaterThan(subhead.y);
  await expect(page.getByRole("main").getByRole("link", { name: "Join early access" }).first()).toBeInViewport();
});

test("the hero shows an example status card, as text, without JavaScript too (CFX-WEB-landing AC-50)", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const card = page.locator("[data-hero-status]");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Example");
  for (const text of ["58% documented, 11 to confirm", "9 of 12 rules defined", "Dry run waiting on 1 approval", "Confirm the customer identifier"]) {
    await expect(card).toContainText(text);
  }
  await expect(card.locator("dt")).toHaveCount(5);
  await context.close();
});

test("the status card never covers the hero's text or controls (CFX-WEB-landing AC-50)", async ({ page }, info) => {
  await page.goto("/");
  const scene = page.locator("[data-hero-scene]");
  await expect(scene).toHaveAttribute("data-phase", "settled", { timeout: 15_000 });
  const card = (await page.locator("[data-hero-status]").boundingBox())!;
  const main = page.getByRole("main");
  const others = [
    page.locator("h1"),
    page.locator("[data-hero-subhead]"),
    main.getByText(SUPPORTING_LINE),
    main.getByRole("link", { name: "Join early access" }).first(),
    main.getByRole("link", { name: "See how it works" }),
    main.getByText("Early sign-ups get a free Readiness Report"),
    page.getByRole("button", { name: "Replay" }),
    page.getByRole("button", { name: "Approve suggested link" }),
    main.getByRole("link", { name: "Scroll to explore" }),
  ];
  for (const other of others) {
    const b = (await other.boundingBox())!;
    const overlaps = card.x < b.x + b.width && b.x < card.x + card.width && card.y < b.y + b.height && b.y < card.y + card.height;
    expect(overlaps, await other.innerText()).toBe(false);
  }
  if (info.project.name !== "desktop") {
    // Phones: below the graph block and its controls, before "Scroll to explore".
    const replay = (await page.getByRole("button", { name: "Replay" }).boundingBox())!;
    expect(card.y).toBeGreaterThanOrEqual(replay.y + replay.height - 1);
  }
});

test("privacy page explains the form data and is linked from the footer and the form (CFX-WEB-landing AC-15)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#early-access").getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy policy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  const main = page.getByRole("main");
  for (const text of ["your email address", "Formspree", "no analytics and no tracking cookies", "How long we keep it", "delete"]) {
    await expect(main).toContainText(text);
  }
});

test("share metadata and image are in place (CFX-WEB-landing AC-18)", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/understand your data before you use it/i);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  const res = await request.get("/opengraph-image");
  expect(res.headers()["content-type"]).toBe("image/png");
  const png = await res.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test("no horizontal scrolling at 320px (CFX-WEB-landing non-functional)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ["/", "/privacy"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
