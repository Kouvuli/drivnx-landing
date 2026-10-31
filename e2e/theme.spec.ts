import { expect, test, type Page } from "@playwright/test";

// Pure mono theme, dark by default (CFX-WEB-landing revision 4).
const bg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const LIGHT_PAPER = "rgb(255, 255, 255)";
const DARK_PAPER = "rgb(0, 0, 0)";

test("is dark for first-time visitors whatever their system setting, even without JavaScript (CFX-WEB-landing AC-28)", async ({ browser }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ colorScheme, javaScriptEnabled });
      const page = await context.newPage();
      for (const path of ["/", "/privacy"]) {
        await page.goto(path);
        expect(await bg(page), `system ${colorScheme} js=${javaScriptEnabled} ${path}`).toBe(DARK_PAPER);
      }
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");
      await context.close();
    }
  }
});

test("a stored light choice is applied before first paint, without a flash (CFX-WEB-landing AC-28)", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  await context.addInitScript(() => {
    localStorage.setItem("theme", "light");
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { firstBg: string }).firstBg = getComputedStyle(document.body).backgroundColor;
    });
  });
  const page = await context.newPage();
  await page.goto("/");
  expect(await page.evaluate(() => (window as unknown as { firstBg: string }).firstBg)).toBe(LIGHT_PAPER);
  await context.close();
});

test("the toggle switches theme, is remembered, and recolours the 3D hero (CFX-WEB-landing AC-29)", async ({ page }) => {
  await page.goto("/");
  const scene = page.locator("[data-hero-scene]");
  await expect(scene).toHaveAttribute("data-state", "canvas", { timeout: 10_000 });
  await expect(scene).toHaveAttribute("data-ink", "rgb(255, 255, 255)");

  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(await bg(page)).toBe(LIGHT_PAPER);
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  await expect(scene).toHaveAttribute("data-ink", "rgb(10, 10, 10)");

  await page.reload();
  expect(await bg(page)).toBe(LIGHT_PAPER);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(await bg(page)).toBe(DARK_PAPER);
});

test("text uses Geist, labels Geist Mono, both self-hosted (CFX-WEB-landing AC-44)", async ({ page }) => {
  const fontHosts: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) fontHosts.push(r.url());
  });
  await page.goto("/");
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Geist/);
  // A stable element (the pinned story replaces the static one after hydration).
  const mono = page.locator("#demo .font-mono").first();
  await mono.scrollIntoViewIfNeeded();
  expect(await mono.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Geist Mono/);
  expect(await page.evaluate(() => document.fonts.check('16px "Geist"') || [...document.fonts].some((f) => /Geist/.test(f.family)))).toBe(true);
  expect(fontHosts).toEqual([]);
});

test("orange marks the main Join buttons and the highlights; nothing else is orange or indigo (CFX-WEB-landing AC-53)", async ({ page }, info) => {
  const orange = "rgb(254, 127, 45)"; // #FE7F2D (dark is the default)
  const card = "rgb(24, 24, 27)"; // dark cards, graphite #18181B
  await page.goto("/");
  const bg = (el: import("@playwright/test").Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);

  // The hero's and the form's "Join early access" are orange with black text; the header's is white (dark theme).
  const heroJoin = page.getByRole("main").getByRole("link", { name: "Join early access" }).first();
  expect(await bg(heroJoin)).toBe(orange);
  expect(await heroJoin.evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
  expect(await bg(page.getByRole("banner").getByRole("link", { name: "Join early access" }))).toBe("rgb(255, 255, 255)");
  expect(await bg(page.locator("#early-access").getByRole("button", { name: "Join early access" }))).toBe(orange);
  expect(await bg(page.locator("[data-brand-dot]").first())).toBe(orange);
  expect(await page.locator("#who [data-item='audience'] p").first().evaluate((e) => getComputedStyle(e).color)).toBe(orange);
  if (info.project.name === "desktop") {
    const active = page.locator('#how-it-works [aria-current="step"]');
    await expect(active).toHaveCount(1);
    expect(await active.evaluate((e) => getComputedStyle(e).borderLeftColor)).toBe(orange);
  }

  // No other button or link is orange, and no indigo is left anywhere on the page.
  const colours = await page.locator("main a, main button, header a, header button").evaluateAll((els) =>
    els.filter((el) => !el.matches("[data-brand-cta]") && !el.querySelector("[data-brand-dot]")).flatMap((el) => {
      const s = getComputedStyle(el);
      return [s.color, s.backgroundColor, s.borderTopColor];
    }),
  );
  expect(colours).not.toContain(orange);
  expect(colours).not.toContain("rgb(165, 180, 252)");

  // Sections are never tinted, so the cards on them stand out.
  for (const id of ["how-it-works", "trust", "early-access"]) expect(await bg(page.locator(`#${id}`)), id).toBe("rgba(0, 0, 0, 0)");
  expect(await bg(page.locator("#how-it-works [data-art-box]").first())).toBe(card);

  // The graphs never use orange.
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-ink", /.+/, { timeout: 10_000 });
  expect(await page.locator("[data-hero-scene]").getAttribute("data-ink")).not.toBe(orange);
  await page.locator("#demo").scrollIntoViewIfNeeded();
  await expect(page.locator("#demo .react-flow__edge-path").first()).toBeAttached({ timeout: 10_000 });
  const edgeColours = await page.locator("#demo .react-flow__edge-path").evaluateAll((els) =>
    els.flatMap((el) => [getComputedStyle(el).stroke, getComputedStyle(el).fill]),
  );
  expect(edgeColours).not.toContain(orange);
});

test("light theme: orange hero and early-access Join buttons, black header button (CFX-WEB-landing AC-53)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto("/");
  const style = (name: string, el: import("@playwright/test").Locator) => el.evaluate((e, n) => getComputedStyle(e).getPropertyValue(n), name);
  const heroJoin = page.getByRole("main").getByRole("link", { name: "Join early access" }).first();
  expect(await style("background-color", heroJoin)).toBe("rgb(231, 113, 35)"); // #E77123, dimmer and darker than dark's #FE7F2D
  expect(await style("color", heroJoin)).toBe("rgb(0, 0, 0)");
  // The header's Join button is black in light (white in dark).
  const headerJoin = page.getByRole("banner").getByRole("link", { name: "Join early access" });
  expect(await style("background-color", headerJoin)).toBe("rgb(10, 10, 10)");
  expect(await style("color", headerJoin)).toBe("rgb(255, 255, 255)");
  await page.goto("/pricing");
  const join = page.locator('[data-item="offer"]').first().getByRole("link", { name: "Join early access" });
  expect(await style("background-color", join)).toBe("rgb(231, 113, 35)");
});
