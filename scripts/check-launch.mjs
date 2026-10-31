// CFX-WEB-landing AC-17: refuse to launch while src/config/site.ts still holds placeholder values.
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? new URL("../src/config/site.ts", import.meta.url);
const placeholders = [];
readFileSync(file, "utf8")
  .split("\n")
  .forEach((line, i) => {
    for (const [, key, value] of line.matchAll(/(\w+):\s*"([^"]*\.example\b[^"]*)"/g)) {
      placeholders.push(`  src/config/site.ts:${i + 1}  ${key}: "${value}"`);
    }
  });

if (placeholders.length > 0) {
  console.error(`Not ready to launch: replace these placeholder values first:\n${placeholders.join("\n")}`);
  process.exit(1);
}
console.log("Launch check passed: no placeholder values in src/config/site.ts");
