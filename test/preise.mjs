// Preis-Selbsttest: laedt script.js in eine Minimal-Umgebung und prueft die
// Eckpreise, die Simon vorgegeben hat.
import { readFileSync } from "node:fs";
const src = readFileSync(process.argv[2], "utf8");

// nur die Preis-Sektion ausschneiden, der Rest braucht ein DOM
const from = src.indexOf("const SERIES_MIN");
const to = src.indexOf("const SERVICES = [");
const code = src.slice(from, to);

const s = { service: "print", sizeIdx: null, complexIdx: null, qty: "1", material: "PLA", colors: ["Grau"] };
const fn = new Function("s", code + `
return { priceBreakdown, SIZES, rangeOf, minPrice };`);

// priceBreakdown liegt weiter unten in der Datei -> den Teil nachladen
const from2 = src.indexOf("const ON_REQUEST");
const to2 = src.indexOf("// Sanfter Hinweis auf die naechste".replace("naechste","nächste"));
const code2 = src.slice(from2, to2);
const api = new Function("s", code + "\n" + code2 + `
return { priceBreakdown, rangeOf, SIZES };`)(s);

const price = (service, sizeIdx, qty = "1") => {
  s.service = service; s.sizeIdx = sizeIdx; s.qty = qty; s.complexIdx = 0;
  return api.priceBreakdown().total;
};

const cases = [
  ["nur Druck, Mini",   price("print", 0), 7],
  ["nur Druck, Klein",  price("print", 1), 12],
  ["nur Druck, Mittel", price("print", 2), 18],
  ["nur Druck, Gross",  price("print", 3), 40],
  ["nur Druck, Riesig", price("print", 4), 90],
];
let bad = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(20)} ${got}  (erwartet ${want})`);
}
// Komplett-Paket darf nie unter den Mindestauftragswert fallen
s.service = "both"; s.sizeIdx = 0; s.complexIdx = 0; s.qty = "1";
const both = api.priceBreakdown().total;
console.log(`${both >= 15 ? "ok  " : "FAIL"} Komplett-Paket Minimum ${both} (>= 15)`);
if (both < 15) bad++;
process.exit(bad ? 1 : 0);
