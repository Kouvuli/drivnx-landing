import { expect, test, type Page } from "@playwright/test";

// 3D hero, story moments, icons and copy budget (CFX-WEB-landing revision 2).
// Assertions use DOM state exposed by the hero (data-*), never GPU pixels.

const scene = (page: Page) => page.locator("[data-hero-scene]");
const threeLoaded = (page: Page) => page.evaluate(() => "__THREE__" in window);

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps the still graph and never loads three.js (CFX-WEB-landing AC-19, CFX-WEB-landing AC-22)", async ({ page }) => {
    await page.goto("/");
    await expect(scene(page)).toHaveAttribute("role", "img");
    await expect(scene(page)).toHaveAttribute("aria-label", /connected by their relationships/);
    await expect(page.locator("[data-hero-still]")).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(scene(page)).toHaveAttribute("data-state", "still");
    await expect(page.locator("[data-hero-scene] canvas")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Replay" })).toHaveCount(0);
    expect(await threeLoaded(page)).toBe(false);
  });

  test("shows story sections in their final state at once (CFX-WEB-landing AC-25)", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator("#how-it-works [data-reveal]");
    for (const el of await steps.all()) await expect(el).toHaveCSS("opacity", "1");
    const summary = page.locator("[data-exec-summary]").first();
    for (const value of ["12", "184", "2.4M", "3"]) await expect(summary).toContainText(value);
  });
});

test("falls back to the still graph without WebGL (CFX-WEB-landing AC-22)", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error -- simulate a browser without WebGL for this test
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return type.startsWith("webgl") ? null : original.call(this, type as "2d", ...(rest as []));
    };
  });
  await page.goto("/");
  await page.waitForTimeout(2000);
  await expect(scene(page)).toHaveAttribute("data-state", "still");
  await expect(page.locator("[data-hero-scene] canvas")).toHaveCount(0);
  expect(await threeLoaded(page)).toBe(false);
});

test("assembles the 3D graph without shifting the layout, then replays (CFX-WEB-landing AC-20, CFX-WEB-landing AC-21)", async ({ page }) => {
  await page.goto("/");
  const before = await scene(page).boundingBox();
  await expect(scene(page)).toHaveAttribute("data-state", "canvas", { timeout: 10_000 });
  await expect(page.locator("[data-hero-scene] canvas")).toHaveCount(1);
  await expect(scene(page)).toHaveAttribute("data-phase", "assembling");
  await expect(scene(page)).toHaveAttribute("data-phase", "settled", { timeout: 6_000 });
  expect(await threeLoaded(page)).toBe(true);
  expect(await scene(page).boundingBox()).toEqual(before);
  // The canvas replaces the still image: only one graph is visible once the scene is ready.
  await expect(page.locator("[data-hero-still]")).toHaveCSS("opacity", "0");

  const replay = page.getByRole("button", { name: "Replay" });
  await replay.focus();
  await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-phase", "assembling");
  await expect(scene(page)).toHaveAttribute("data-phase", "settled", { timeout: 6_000 });
});

test("uses the light tier on phones (CFX-WEB-landing AC-23)", async ({ page }, info) => {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-state", "canvas", { timeout: 10_000 });
  const s = scene(page);
  if (info.project.name === "mobile") {
    await expect(s).toHaveAttribute("data-quality", "low");
    expect(Number(await s.getAttribute("data-points"))).toBeLessThanOrEqual(24);
    expect(Number(await s.getAttribute("data-dpr-max"))).toBeLessThanOrEqual(1.5);
    await expect(s).toHaveAttribute("data-pointer", "off");
  } else {
    await expect(s).toHaveAttribute("data-quality", "high");
    expect(Number(await s.getAttribute("data-dpr-max"))).toBeLessThanOrEqual(2);
  }
});

test("stops rendering off-screen and resumes when visible (CFX-WEB-landing AC-24)", async ({ page }) => {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-active", "true", { timeout: 10_000 });
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect(scene(page)).toHaveAttribute("data-active", "false");
  await scene(page).scrollIntoViewIfNeeded();
  await expect(scene(page)).toHaveAttribute("data-active", "true");
});

test("plays the story moments once when they scroll into view (CFX-WEB-landing AC-25)", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    // On desktop, how-it-works is the pinned scroll story instead (CFX-WEB-landing AC-34).
    const steps = page.locator("#how-it-works [data-reveal]");
    await expect(steps.first()).toHaveCSS("opacity", "0");
    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    for (const el of await steps.all()) await expect(el).toHaveCSS("opacity", "1");
  }

  const trust = page.locator("#trust [data-reveal]");
  await expect(trust.first()).not.toHaveCSS("opacity", "1");
  await page.locator("#trust").scrollIntoViewIfNeeded();
  for (const el of await trust.all()) await expect(el).toHaveCSS("opacity", "1");

  // The executive summary (Understand stage) counts up once it scrolls into view.
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  const summary = page.locator("[data-exec-summary]").first();
  await summary.scrollIntoViewIfNeeded();
  for (const value of ["12", "184", "2.4M"]) await expect(summary).toContainText(value);
});

test("every listed item has a decorative icon (CFX-WEB-landing AC-26)", async ({ page }) => {
  await page.goto("/");
  const expected = { problem: 3, step: 3, trust: 4, audience: 2, privacy: 6 };
  for (const [kind, count] of Object.entries(expected)) {
    const items = page.locator(`[data-item="${kind}"]`);
    await expect(items, kind).toHaveCount(count);
    for (const item of await items.all()) {
      await expect(item.locator("svg.lucide").first()).toHaveAttribute("aria-hidden", "true");
    }
  }
});

test("keeps the main sections within the word budget (CFX-WEB-landing AC-27)", async ({ page }) => {
  await page.goto("/");
  const words = await page.evaluate(() =>
    ["problem", "how-it-works", "trust", "ai-privacy", "who", "about", "early-access"]
      .map((id) => document.getElementById(id)!.innerText.split(/\s+/).filter(Boolean).length)
      .reduce((a, b) => a + b, 0),
  );
  expect(words).toBeLessThanOrEqual(850);
});

// Revision 3: interactive hero, scroll story, micro-interactions, cursor effect.

async function settledHero(page: Page) {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-phase", "settled", { timeout: 15_000 });
  await expect(scene(page)).toHaveAttribute("data-probe", /;/);
  const box = (await scene(page).boundingBox())!;
  return (fx: number, fy: number) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy });
}
/** Screen fractions of hub 0 (Customers) and record 4 (ACME, Inc.), reported by the scene once settled. */
async function probe(page: Page) {
  const [hub, record] = (await scene(page).getAttribute("data-probe"))!.split(";").map((p) => p.split(",").map(Number));
  return { hub, record };
}
const tooltip = (page: Page) => page.locator("[data-hero-tooltip]");

test("dragging rotates the hero graph; vertical swipes still scroll on phones (CFX-WEB-landing AC-31)", async ({ page }, info) => {
  const at = await settledHero(page);
  await expect(scene(page)).toHaveCSS("touch-action", "pan-y");
  if (info.project.name !== "desktop") return;
  await expect(scene(page)).toHaveAttribute("data-rotated", "false");
  await page.mouse.move(at(0.3, 0.1).x, at(0.3, 0.1).y);
  await page.mouse.down();
  // Few steps: headless Chromium renders WebGL in software, so each move waits ~0.3 s for the main thread.
  await page.mouse.move(at(0.7, 0.1).x, at(0.7, 0.1).y, { steps: 3 });
  await page.mouse.up();
  await expect(scene(page)).toHaveAttribute("data-rotated", "true");
});

test("hovering a hub or a record shows what it is (CFX-WEB-landing AC-32)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Hover is the pointer path; the tap path is covered below.");
  const at = await settledHero(page);
  const { hub, record } = await probe(page);
  await page.mouse.move(at(hub[0], hub[1]).x, at(hub[0], hub[1]).y);
  await expect(tooltip(page)).toHaveText("Customers, 1,204 records");
  await page.mouse.move(at(record[0], record[1]).x, at(record[0], record[1]).y);
  await expect(tooltip(page)).toHaveText("customer_id: 99.8% unique, possible identifier");
  await page.mouse.move(at(0.5, 1.2).x, at(0.5, 1.2).y);
  await expect(tooltip(page)).toHaveCount(0);
});

test("tapping a hub on a phone shows what it is (CFX-WEB-landing AC-32)", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "Tap path.");
  await settledHero(page);
  const { hub } = await probe(page);
  const box = (await scene(page).boundingBox())!;
  await scene(page).tap({ position: { x: hub[0] * box.width, y: hub[1] * box.height }, force: true });
  await expect(tooltip(page)).toHaveText("Customers, 1,204 records");
});

test("the last suggested link is approved by clicking it or with the button; Replay resets it (CFX-WEB-landing AC-33)", async ({ page }, info) => {
  const at = await settledHero(page);
  await expect(scene(page)).toHaveAttribute("data-suggested", "pending");
  if (info.project.name === "desktop") {
    await page.mouse.click(at(0.5, 0.5).x, at(0.5, 0.5).y);
  } else {
    await page.getByRole("button", { name: "Approve suggested link" }).click();
  }
  await expect(scene(page)).toHaveAttribute("data-suggested", "approved");
  await expect(page.getByText("Relationship confirmed: orders and invoices are connected.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve suggested link" })).toHaveCount(0);

  await page.getByRole("button", { name: "Replay" }).click();
  await expect(scene(page)).toHaveAttribute("data-suggested", "pending");
  await expect(scene(page)).toHaveAttribute("data-phase", "settled", { timeout: 6_000 });
  await page.getByRole("button", { name: "Approve suggested link" }).focus();
  await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-suggested", "approved");
});

test("how it works pins and steps through the three stages on desktop (CFX-WEB-landing AC-34)", async ({ page }, info) => {
  await page.goto("/");
  const story = page.locator("#how-it-works [data-pinned]");
  const stages = ["connect", "understand", "define"];
  if (info.project.name !== "desktop") {
    await expect(story).toHaveCount(0);
    await expect(page.locator('#how-it-works [data-item="step"]')).toHaveCount(3);
    return;
  }
  await expect(story).toHaveAttribute("data-pinned", "true");
  const scrollToStage = (k: number) =>
    page.evaluate((k) => {
      const el = document.querySelector("#how-it-works [data-pinned]") as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (range * (k + 0.5)) / 3, behavior: "instant" });
    }, k);
  await scrollToStage(0);
  await expect(story).toHaveAttribute("data-active-step", "connect");
  const pin = page.locator("#how-it-works [data-pin]");
  const pinTop = (await pin.boundingBox())!.y;
  for (let k = 1; k < stages.length; k++) {
    await scrollToStage(k);
    await expect(story).toHaveAttribute("data-active-step", stages[k]);
    expect(Math.abs((await pin.boundingBox())!.y - pinTop)).toBeLessThan(2);
  }
  await expect(story.locator('[aria-current="step"]')).toContainText("Document & define");
  // Revision 12: the last illustration, with its export line, fits inside the pinned box.
  const box = (await story.locator("[data-art-box]").boundingBox())!;
  const exportLine = (await story.getByText("Export profile, dictionary and contract as YAML or JSON").boundingBox())!;
  expect(exportLine.y + exportLine.height).toBeLessThanOrEqual(box.y + box.height);
});

test.describe("reduced motion: no pinning", () => {
  test.use({ reducedMotion: "reduce" });
  test("shows all three stages with their illustrations, without pinning, then what comes next (CFX-WEB-landing AC-34)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#how-it-works [data-pinned]")).toHaveCount(0);
    const steps = page.locator('#how-it-works [data-item="step"]');
    await expect(steps).toHaveCount(3);
    for (const step of await steps.all()) await expect(step).toBeVisible();
    await expect(page.locator("#how-it-works [data-exec-summary]")).toBeVisible();
    // Revision 12: Phase 2 is named, clearly as later.
    const next = page.locator("#how-it-works [data-coming-next]");
    await expect(next).toContainText("Coming next");
    for (const text of ["Transform", "Validate", "Publish & serve", "Monitor & improve"]) await expect(next.getByText(text, { exact: true })).toBeVisible();
  });
});

test("controls give quiet press, hover, open and success feedback (CFX-WEB-landing AC-37)", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("main").getByRole("link", { name: "Join early access" });
  expect(await cta.evaluate((el) => getComputedStyle(el).transitionProperty)).toContain("transform");
  const faq = page.locator("details").first();
  expect(await faq.evaluate((el) => getComputedStyle(el, "::details-content").transitionProperty)).toContain("block-size");

  await page.route("https://forms.test/f/e2e", (route) => route.fulfill({ status: 200, body: "{}" }));
  await page.goto("/#early-access");
  await page.getByLabel("Work email").fill("sam@shop.com");
  await page.getByRole("button", { name: "Join early access" }).click();
  const check = page.locator("[data-success-check] path");
  await expect(check).toBeVisible();
  expect(await check.evaluate((el) => getComputedStyle(el).animationName)).toBe("draw");
});

test.describe("reduced motion: instant feedback", () => {
  test.use({ reducedMotion: "reduce" });
  test("press and open feedback are instant (CFX-WEB-landing AC-37)", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("main").getByRole("link", { name: "Join early access" });
    expect(await cta.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
    const faq = page.locator("details").first();
    expect(await faq.evaluate((el) => getComputedStyle(el, "::details-content").transitionDuration)).toMatch(/^0s/);
  });
});

// Revision 10: fill-sweep hover and press + ripple click on every button-style control.

const sweepScale = (el: import("@playwright/test").Locator) =>
  el.evaluate((e) => {
    const m = getComputedStyle(e, "::before").transform;
    return m === "none" ? 1 : Number(m.slice(7).split(",")[0]);
  });

test("button-style controls sweep a fill across on hover (CFX-WEB-landing AC-54)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Hover is the pointer path.");
  await page.goto("/");
  const main = page.getByRole("main");
  const controls = [
    main.getByRole("link", { name: "Join early access" }).first(),
    main.getByRole("link", { name: "See how it works" }),
    page.getByRole("banner").getByRole("link", { name: "Join early access" }),
  ];
  for (const el of controls) {
    expect(await el.evaluate((e) => e.classList.contains("fx"))).toBe(true);
    expect(await sweepScale(el)).toBe(0);
    await el.hover();
    await expect.poll(() => sweepScale(el)).toBe(1);
  }
  // The hero's orange button sweeps to a deeper orange (#F96D10 in dark), keeping black text.
  const hero = controls[0];
  expect(await hero.evaluate((e) => getComputedStyle(e, "::before").backgroundColor)).toBe("rgb(249, 109, 16)");
  expect(await hero.evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
  for (const name of ["Accept suggestion", "Export contract"]) {
    expect(await page.locator("#demo").getByRole("button", { name }).evaluate((e) => e.classList.contains("fx")), name).toBe(true);
  }
});

test("clicking a button presses it in and spreads a ripple from the click point (CFX-WEB-landing AC-55)", async ({ page }) => {
  await page.goto("/pricing");
  const talk = page.getByRole("link", { name: "Talk to us" });
  await talk.evaluate((e) => e.addEventListener("click", (ev) => ev.preventDefault()));
  await talk.scrollIntoViewIfNeeded();
  expect(await talk.evaluate((e) => e.classList.contains("fx"))).toBe(true);
  const box = (await talk.boundingBox())!;
  await page.mouse.move(box.x + 12, box.y + box.height / 2);
  await page.mouse.down();
  await expect(talk.locator("[data-ripple]")).toHaveCount(1);
  const ripple = (await talk.locator("[data-ripple]").boundingBox())!;
  // The ripple is centred on the click point, near the left edge, measured on the button (which is scaling in).
  const pressed = (await talk.boundingBox())!;
  expect(Math.abs((ripple.x + ripple.width / 2 - pressed.x) / pressed.width - 12 / box.width)).toBeLessThan(0.02);
  expect(await talk.evaluate((e) => getComputedStyle(e).transform)).not.toBe("none");
  await page.mouse.up();
  await expect(talk.locator("[data-ripple]")).toHaveCount(0, { timeout: 2_000 });
});

test.describe("reduced motion: no sweep or ripple", () => {
  test.use({ reducedMotion: "reduce" });
  test("hover and click feedback change instantly, without a ripple (CFX-WEB-landing AC-54, CFX-WEB-landing AC-55)", async ({ page }) => {
    await page.goto("/pricing");
    const talk = page.getByRole("link", { name: "Talk to us" });
    await talk.evaluate((e) => e.addEventListener("click", (ev) => ev.preventDefault()));
  await talk.scrollIntoViewIfNeeded();
    expect(await talk.evaluate((e) => getComputedStyle(e, "::before").transitionDuration)).toBe("0s");
    const box = (await talk.boundingBox())!;
    await page.mouse.move(box.x + 12, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await expect(talk.locator("[data-ripple]")).toHaveCount(0);
    expect(await talk.evaluate((e) => getComputedStyle(e).transform)).toBe("none");
    await page.mouse.up();
  });
});

test("the cursor effect is on for desktop pointers and off for touch (CFX-WEB-landing AC-38)", async ({ page }, info) => {
  await settledHero(page);
  await expect(scene(page)).toHaveAttribute("data-cursor-effect", info.project.name === "desktop" ? "on" : "off");
});

// Revision 4: full-bleed hero, smooth scroll, heading reveals, hover zoom, "Connects to" marquee.

test("the hero is full-bleed with a centred headline; on phones the graph sits below the text (CFX-WEB-landing AC-39)", async ({ page }, info) => {
  await page.goto("/");
  const viewport = page.viewportSize()!;
  const box = (await scene(page).boundingBox())!;
  const h1 = (await page.locator("h1").boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(Math.abs(h1.x + h1.width / 2 - viewport.width / 2)).toBeLessThan(4);
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
  const explore = page.getByRole("link", { name: "Scroll to explore" });
  await expect(explore).toHaveAttribute("href", "#connects");
  if (info.project.name === "desktop") {
    expect(box.height).toBeGreaterThanOrEqual(viewport.height - 64 - 1);
    expect(box.y).toBeLessThan(h1.y);
    await expect(explore).toBeInViewport();
  } else {
    // Text first, then the graph, then its controls, then "Scroll to explore": nothing overlaps.
    const cta = (await page.getByRole("main").getByRole("link", { name: "See how it works" }).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(cta.y + cta.height);
    await expect(scene(page)).toHaveAttribute("data-phase", "settled", { timeout: 15_000 });
    const replay = (await page.getByRole("button", { name: "Replay" }).boundingBox())!;
    expect(replay.y).toBeGreaterThanOrEqual(box.y + box.height - 1);
    expect((await explore.boundingBox())!.y).toBeGreaterThanOrEqual(replay.y + replay.height - 1);
  }
});

test("scrolling is smooth on desktop pointers and native on touch (CFX-WEB-landing AC-40)", async ({ page }, info) => {
  await page.goto("/");
  const lenis = page.locator("html.lenis");
  if (info.project.name === "desktop") {
    await expect(lenis).toHaveCount(1);
    // Wait until hydration has swapped in the pinned story, which changes the page height.
    await expect(page.locator("#how-it-works [data-pinned]")).toHaveCount(1);
    await page.getByRole("banner").getByRole("link", { name: "FAQ" }).click();
    await expect.poll(async () => (await page.locator("#faq").boundingBox())!.y, { timeout: 5_000 }).toBeLessThan(140);
    expect((await page.locator("#faq").boundingBox())!.y).toBeGreaterThan(40);
    const before = await page.evaluate(() => scrollY);
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  } else {
    await expect(lenis).toHaveCount(0);
  }
});

test.describe("reduced motion: native scroll, still headings and marquee", () => {
  test.use({ reducedMotion: "reduce" });
  test("no smooth scroll, headings shown at once, marquee still and wrapped (CFX-WEB-landing AC-40, CFX-WEB-landing AC-41, CFX-WEB-landing AC-43)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html.lenis")).toHaveCount(0);
    const heading = page.locator("#ai-privacy-title");
    await expect(heading).not.toHaveAttribute("data-heading-reveal", "armed");
    expect(await heading.locator("[data-word] > span").first().evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    expect(await page.locator("[data-marquee-track]").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await expect(page.getByRole("button", { name: "Pause" })).toBeHidden();
  });
});

test("section headings reveal line by line, once, and stay whole for screen readers (CFX-WEB-landing AC-41)", async ({ page }) => {
  await page.goto("/");
  const heading = page.locator("#ai-privacy-title");
  await expect(heading).toHaveAttribute("data-heading-reveal", "armed");
  await expect(heading).toHaveText("AI assists. You approve. Boundaries stay explicit.");
  await expect(page.getByRole("heading", { level: 2, name: "AI assists. You approve. Boundaries stay explicit." })).toHaveCount(1);
  const inner = heading.locator("[data-word] > span").first();
  expect(await inner.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("data-heading-reveal", "played");
  await expect.poll(() => inner.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)).toBe(0);
});

test("cards respond to hover (CFX-WEB-landing AC-42)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Hover is a pointer interaction.");
  for (const [path, selector] of [["/pricing", '[data-item="offer"]']]) {
    await page.goto(path);
    const card = page.locator(selector).first();
    await card.scrollIntoViewIfNeeded();
    const before = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  }
});

test("the Connects to marquee moves, pauses, and hides its duplicate row (CFX-WEB-landing AC-43)", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#connects");
  const track = section.locator("[data-marquee-track]");
  await expect(section.getByRole("heading", { name: "Connects to" })).toBeVisible();
  for (const name of ["CSV", "Excel (XLSX)", "Parquet", "PostgreSQL, read-only", "Coming next", "MySQL", "SQL Server"]) {
    await expect(section.locator("ul:not([aria-hidden])").getByText(name, { exact: true })).toHaveCount(1);
  }
  await expect(section.locator('ul[aria-hidden="true"]')).toHaveCount(3);
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe("marquee");
  expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("running");
  await section.getByRole("button", { name: "Pause" }).click();
  expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");
  await section.getByRole("button", { name: "Play" }).click();
  await section.locator("[tabindex='0']").focus();
  expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");
});
