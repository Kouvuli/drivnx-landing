// @vitest-environment node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "./site";

const root = join(__dirname, "..", "..");
const siteFile = join(root, "src", "config", "site.ts");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("brand details live only in site config (CFX-WEB-landing AC-16)", () => {
  it("no other source file hard-codes the name, domain or contact email", () => {
    const offenders = sourceFiles(join(root, "src"))
      .filter((file) => file !== siteFile)
      .filter((file) => {
        const text = readFileSync(file, "utf8");
        return [site.name, site.domain, site.email].some((value) => text.includes(value));
      });
    expect(offenders).toEqual([]);
  });
});

describe("launch check (CFX-WEB-landing AC-17)", () => {
  const run = (...args: string[]) => spawnSync(process.execPath, [join(root, "scripts", "check-launch.mjs"), ...args], { encoding: "utf8" });

  it("fails and names each placeholder while .example values remain", () => {
    const result = run(siteFile);
    expect(result.status).toBe(1);
    for (const key of ["domain", "url", "email"]) expect(result.stderr).toContain(`${key}: "`);
  });

  it("passes once real values are set", () => {
    const real = join(mkdtempSync(join(tmpdir(), "site-")), "site.ts");
    writeFileSync(real, readFileSync(siteFile, "utf8").replaceAll("drivnx.example", "drivnx.com"));
    const result = run(real);
    expect(result.status).toBe(0);
  });
});
