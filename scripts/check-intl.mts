import { readFileSync } from "fs";
import { join } from "path";

const fr = JSON.parse(readFileSync(join(process.cwd(), "messages/fr.json"), "utf-8"));
const en = JSON.parse(readFileSync(join(process.cwd(), "messages/en.json"), "utf-8"));
const eo = JSON.parse(readFileSync(join(process.cwd(), "messages/eo.json"), "utf-8"));

function getKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object"
      ? getKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

const frKeys = getKeys(fr).sort();
const enKeys = getKeys(en).sort();
const eoKeys = getKeys(eo).sort();

let hasError = false;

for (const key of frKeys) {
  if (!enKeys.includes(key)) {
    console.error(`❌ Missing in en.json: ${key}`);
    hasError = true;
  }
  if (!eoKeys.includes(key)) {
    console.error(`❌ Missing in eo.json: ${key}`);
    hasError = true;
  }
}

for (const key of enKeys) {
  if (!frKeys.includes(key)) {
    console.error(`❌ Extra key in en.json: ${key}`);
    hasError = true;
  }
}

for (const key of eoKeys) {
  if (!frKeys.includes(key)) {
    console.error(`❌ Extra key in eo.json: ${key}`);
    hasError = true;
  }
}

if (!hasError) console.log("🦅 Nothing to fix youpi !");
else process.exit(1);
