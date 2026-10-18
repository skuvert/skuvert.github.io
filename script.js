// ---------- hero marquee background ----------
// Fünf Zeilen mit Beispiel-Ideen, abwechselnd nach links/rechts laufend.
// Jede Zeile enthält die Begriffe doppelt -> nahtlose Endlosschleife (translateX 50%).
(function initHeroMarquee() {
const wrap = document.querySelector(".hero-marquee");
if (!wrap) return;

// Eine Zeile pro Kategorie – abwechselnd nach rechts/links.
const rows = [
// Halter & Ständer
["Zahnbürstenhalter", "Handyständer", "Kopfhörerhalter", "Tabletständer", "Fernbedienungshalter", "Brillenhalter", "Flaschenhalter", "Stifthalter", "Kopfhörerständer", "Ladekabel-Halter"],
// Organizer & Ordnung
["Schreibtisch-Organizer", "Schubladen-Einsatz", "Sortierbox", "Kabelbox", "Werkzeug-Organizer", "Kosmetik-Organizer", "Besteckeinsatz", "Schraubensortierer", "Briefablage", "Make-up-Halter"],
// Ersatzteile & Reparatur
["Ersatzknopf", "Möbelgleiter", "Schubladengriff", "Gehäusedeckel", "Ersatzclip", "Ersatz-Zahnrad", "Batteriefachdeckel", "Standfuss", "Distanzhalter", "Kurbelgriff"],
// Küche & Haushalt
["Gewürzregal", "Küchenrollenhalter", "Eierbecher", "Untersetzer", "Serviettenhalter", "Tubenquetscher", "Flaschenöffner", "Vorratsdosen-Deckel", "Messerhalter", "Kaffeekapsel-Halter"],
// Büro & Technik
["Monitorerhöhung", "Laptopständer", "Ladestation", "Kabeldurchführung", "Kabelhalter", "Handyhalter fürs Auto", "Webcam-Halter", "Headset-Haken", "USB-Hub-Halter", "Notizzettel-Box"],
// Hobby & Gaming
["Würfelturm", "Brettspiel-Organizer", "Kartenhalter", "Controller-Halter", "Miniatur-Figuren", "Cosplay-Teile", "Modellbau-Teile", "Displayständer", "Vinyl-Halter", "Würfel-Tablett"],
// Garten & Deko
["Pflanzenschild", "Übertopf", "Vogelhaus", "Kräutertopf", "Rankhilfe", "Gartenwerkzeug-Halter", "Vase", "Bilderrahmen", "Windlicht", "Untersetzer-Set"],
// Persönliches & Geschenke
["Schlüsselanhänger", "Namensschild", "Keksausstecher", "Lesezeichen", "Initialen-Deko", "Schmuckständer", "Geschenkbox", "Tischkartenhalter", "Foto-Würfel", "Ringschale"],
];
const durations = [60, 72, 64, 78, 66, 74, 62, 70];

rows.forEach((terms, i) => {
const row = document.createElement("div");
row.className = "marquee-row";
const track = document.createElement("div");
// gerade Zeilen (0,2,4) nach rechts, ungerade (1,3) nach links
track.className = "marquee-track" + (i % 2 === 0 ? " rtl" : "");
track.style.setProperty("--dur", durations[i] + "s");
const group = terms.map((t) => `<span class="mq-item">${t}</span>`).join("");
track.innerHTML = group + group; // verdoppeln für nahtlose Schleife
row.appendChild(track);
wrap.appendChild(row);
});
})();

// ---------- FAQ accordion ----------
(function initFaq() {
document.querySelectorAll(".faq-item").forEach((item) => {
const btn = item.querySelector(".faq-question");
const answer = item.querySelector(".faq-answer");
answer.style.height = "0px";
btn.addEventListener("click", () => {
const opening = !item.classList.contains("open");
item.classList.toggle("open", opening);
answer.style.height = opening ? answer.scrollHeight + "px" : "0px";
});
});
})();

// ---------- scroll reveal ----------
(function initReveal() {
const targets = document.querySelectorAll(".reveal");
if (!("IntersectionObserver" in window) || targets.length === 0) {
targets.forEach((el) => el.classList.add("in-view"));
return;
}
const observer = new IntersectionObserver(
(entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add("in-view");
observer.unobserve(entry.target);
}
});
},
{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
targets.forEach((el) => observer.observe(el));
})();

// ---------- hero: zwei Timelapses abwechselnd, mit Crossfade ----------
(function initHeroClips() {
const clips = document.querySelectorAll("#hero-media .hero-clip");
if (clips.length < 2) return;

let current = 0;
const next = () => (current + 1) % clips.length;

// den naechsten Clip laden, sobald der laufende zur Haelfte durch ist
clips.forEach((clip) => {
clip.addEventListener("timeupdate", () => {
if (!clip.duration || clip.currentTime < clip.duration / 2) return;
const upcoming = clips[next()];
if (upcoming.preload === "none") {
upcoming.preload = "auto";
upcoming.load();
}
});

clip.addEventListener("ended", () => {
const upcoming = clips[next()];
upcoming.currentTime = 0;
const play = upcoming.play();
if (play) play.catch(() => {});
upcoming.classList.add("is-current");
clip.classList.remove("is-current");
current = next();
});
});
})();

// ---------- request form ----------
(function initRequestForm() {
const mount = document.getElementById("request-form");
if (!mount) return;

const INK = "#1A2233";
const MUTED = "#5B6675";
const ACCENT = "#2E5E8F";

// ===== Auftragsnummer-Konfiguration =====
// Nach dem Deployen des Google Apps Scripts (siehe auftragsnummer.gs) hier die
// Web-App-URL eintragen. Solange dieses Feld leer ist ODER der Server nicht
// erreichbar ist, wird eine klar markierte provisorische Nummer (SKV-JAHR-Pxxx)
// erzeugt – diese ist NICHT fortlaufend und dient nur als Notlösung.
const ORDER_NUMBER_ENDPOINT = "https://script.google.com/macros/s/AKfycbytNMII6Emuk3LqKDG3DLNKBRjD94b5UcWeX1wN2PHt6UuQQl2_pcY7AsJ4Dj_pE5f5ww/exec";

// ===== Filament-Bestand (Sync mit dem Dashboard) =====
// Read-only Endpoint des Dashboards. Liefert nur vorrätige Farben je Material.
// Ist er erreichbar, ersetzen seine Farben die unten hardcodierten Defaults;
// sonst bleiben die Defaults (MATERIALS) als Fallback bestehen.
const FILAMENT_ENDPOINT = "https://skuvert-dashboard.vercel.app/api/filament";
let inventory = null; // { PLA:[{n,h}], PETG:[...], ... } sobald geladen

function loadInventory() {
if (!FILAMENT_ENDPOINT) return;
fetch(FILAMENT_ENDPOINT)
.then((r) => (r.ok ? r.json() : null))
.then((d) => {
if (d && d.materials) {
inventory = d.materials;
if (s.stepId === "material") render(); // schon offen? aktualisieren
}
})
.catch(() => {}); // offline -> Fallback auf Defaults
}

// kleiner Helfer: Inline-SVG-Icon aus dem Sprite (kein Emoji mehr)
function svg(id) { return `<svg class="icon"><use href="#${id}"/></svg>`; }

// ===== Auftragstyp =====
// Kein eigener Schritt mehr – wird direkt aus der Menge abgeleitet
// (ab SERIES_MIN Stück = Kleinserie: Rechnung möglich, alle Farben bestellbar).
const SERIES_MIN = 7;
function qtyNum() { const n = parseInt(s.qty, 10); return Number.isFinite(n) && n > 0 ? n : 1; }
function isSeries() { return qtyNum() >= SERIES_MIN; }
function orderTypeLabel() { return isSeries() ? `Kleinserie (${qtyNum()} Stück)` : "Einzelauftrag"; }

// ===== Zahlungsmethoden =====
// Basis gilt für Einzelaufträge; Kleinserien erhalten zusätzlich "Rechnung".
// Eine einfache Sammel-Option: nach der Bestätigung kommt ein Zahlungslink,
// über den mit Karte, TWINT, Apple/Google Pay u.a. bezahlt werden kann
// (Anbietername bewusst nicht genannt – Kunden kennen ihn oft nicht).
const PAY_BASE = [
{ key: "link", label: "Zahlungslink – Karte, TWINT, Apple/Google Pay u. a. (nach Bestätigung)" },
];
const PAY_INVOICE = { key: "invoice", label: "Rechnung (Zahlung nach Erhalt)" };
const INVOICE_TEXT = "Ich bestätige verbindlich, dass ich mich mit Absenden dieser Anfrage zur Zahlung der Rechnung nach Erhalt der Ware verpflichte, sofern das Angebot von mir bestätigt wurde. Zahlungsziel: 14 Tage nach Rechnungsstellung.";
function paymentOptions() { return isSeries() ? [...PAY_BASE, PAY_INVOICE] : PAY_BASE; }
function payLabel(key) { const f = [...PAY_BASE, PAY_INVOICE].find((p) => p.key === key); return f ? f.label : "-"; }

// Preisbausteine: Konstruktionsaufwand (einmalig) + Druckkosten (pro Stück).
// "Komplett-Paket" = beides, deshalb werden dort beide Stufen abgefragt.
const COMPLEXITY = [
{ level: 1, label: "Einfach", sub: "Halter, flache Teile", price: 15 },
{ level: 2, label: "Mittel", sub: "Gewinde, Clips, mehrteilig", price: 25 },
{ level: 3, label: "Komplex", sub: "Mechanik, organische Formen", price: 45 },
{ level: 4, label: "Sehr Komplex", sub: "Baugruppen, Ingenieur", price: 85 },
];
// Druckpreis pro Stück. Die Stufen folgen dem realen Materialverbrauch
// (Kantenlänge verdoppelt -> rund vier- bis achtfaches Gewicht).
const SIZES = [
{ level: 1, label: "Mini", sub: "bis 3 cm – Anhänger, Clips", price: 0.5 },
{ level: 2, label: "Klein", sub: "bis 6 × 6 × 6 cm", price: 3 },
{ level: 3, label: "Mittel", sub: "bis 12 × 12 × 12 cm", price: 12 },
{ level: 4, label: "Gross", sub: "bis 18 × 18 × 18 cm", price: 34 },
{ level: 5, label: "Riesig", sub: "bis 25 × 25 × 25 cm", price: 85 },
// Ein Teil, das grösser als das Druckbett ist -> wird geteilt gedruckt und
// verklebt. Kein Richtpreis, sondern Einzelprüfung.
{ level: 0, label: "Variabel / Übergrösse", sub: "ein Teil über 25 cm – auf Anfrage", custom: true },
];

// ===== Preisformel =====
// Total = max(Mindestpreis, Konstruktion + Rüstpauschale + Druck × Menge − Mengenrabatt)
const MIN_PRICE = 15;   // Mindestauftragswert, egal wie klein
const SETUP_FEE = 12;   // Rüsten, Slicen, Verpacken – einmal pro Druckauftrag
const MATERIAL_FACTOR = { PLA: 1, PETG: 1.15, ABS: 1.2, TPU: 1.35 };
const COLOR_FACTOR = 0.15; // je zusätzliche Farbe (Filamentwechsel + Purge-Abfall)
// Rabatt steigt mit der Stückzahl, gedeckelt bei 15 %. Gilt nur auf den Druckanteil.
function qtyDiscount(q) { return q >= 11 ? 0.15 : q >= 6 ? 0.1 : q >= 3 ? 0.05 : 0; }

function needsSize() { return s.service !== "design"; }
function needsComplexity() { return s.service !== "print"; }
function selSize() { return s.sizeIdx === null ? null : SIZES[s.sizeIdx]; }
function selComplexity() { return s.complexIdx === null ? null : COMPLEXITY[s.complexIdx]; }
// Übergrösse gewählt -> kein berechneter Preis, sondern "auf Anfrage".
function isCustomSize() { const z = selSize(); return !!(needsSize() && z && z.custom); }
// Alle preisrelevanten Stufen gewählt?
function priceKnown() {
if (!s.service) return false;
if (needsSize() && s.sizeIdx === null) return false;
if (needsComplexity() && s.complexIdx === null) return false;
return true;
}

const SERVICES = [
{ key: "design", icon: "icon-pen", title: "Nur Design", desc: "Ich erstelle ein 3D-Modell nach deinen Vorgaben inklusive kommerzieller Lizenz. Du erhältst die fertigen Dateien zum selbst Drucken." },
{ key: "print", icon: "icon-printer", title: "Nur 3D-Druck", desc: "Du lieferst das 3D-Modell, ich drucke es auf meinem Bambu Lab-System in Topqualität und schicke es dir zu." },
{ key: "both", icon: "icon-layers", title: "Komplett-Paket", desc: "Von der Skizze zum fertigen Druck, ich übernehme Design und Produktion. Du erhältst das fertige Objekt direkt zu dir nach Hause." },
];

const SVC_LABEL = {
design: "Nur Design (inkl. kommerz. Lizenz)",
print: "Nur 3D-Druck",
both: "Komplett-Paket (Design + Druck)",
};

const MATERIALS = {
PLA: {
desc: "Universalmaterial – ideal für Dekoartikel, Prototypen und Alltagsgegenstände. Grosse Farbauswahl, einfach zu drucken.",
colors: [
{ n: "Schwarz", h: "#1a1a1a" }, { n: "Grau", h: "#9ca3af" }, { n: "Weiss", h: "#f0f0f0" },
{ n: "Blau", h: "#2563eb" }, { n: "Dunkelblau", h: "#1e3a8a" }, { n: "Hellblau", h: "#7dd3fc" },
{ n: "Türkis", h: "#14b8a6" },
{ n: "Rot", h: "#e02020" }, { n: "Orange", h: "#f97316" }, { n: "Hellorange", h: "#fdba74" },
{ n: "Gelb", h: "#facc15" }, { n: "Braun", h: "#92400e" }, { n: "Grün", h: "#16a34a" },
{ n: "Silber", h: "#c8c8c8" }, { n: "Gold", h: "#d4af37" },
],
},
PETG: {
desc: "Stabiler, leicht flexibler Kunststoff mit guter Hitze- und Feuchtigkeitsbeständigkeit. Ideal für funktionale Teile.",
colors: [
{ n: "Grau", h: "#9ca3af" }, { n: "Schwarz", h: "#1a1a1a" }, { n: "Dunkelgrün", h: "#14532d" },
{ n: "Durchsichtig", h: "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 10px 10px" },
{ n: "Misty Blue", h: "#9db4c0" },
],
},
TPU: { desc: "Flexibles, gummiartiges Material – ideal für Schutzhüllen, Dichtungen, Griffstücke und alles was Nachgeben soll.", colors: [{ n: "Schwarz", h: "#1a1a1a" }, { n: "Grau", h: "#9ca3af" }] },
ABS: { desc: "UV- und wetterbeständig – für Aussenanwendungen, Schilder und alles, was Sonne, Regen und Temperaturwechsel standhält.", colors: [{ n: "Schwarz", h: "#1a1a1a" }, { n: "Weiss", h: "#f0f0f0" }] },
};

// Effektive Materialliste: vorrätige Farben aus dem Dashboard, sonst Defaults.
// Beschreibung (desc) bleibt immer statisch aus MATERIALS.
function effectiveMaterials() {
const out = {};
for (const m of Object.keys(MATERIALS)) {
const colors = inventory && Array.isArray(inventory[m]) ? inventory[m] : MATERIALS[m].colors;
out[m] = { desc: MATERIALS[m].desc, colors };
}
return out;
}
// Welche Material-Chips im Formular sichtbar sind:
// Einzelauftrag -> nur Materialien mit vorrätiger Farbe; Kleinserie -> alle
// (Wunschfarbe kann bestellt werden, auch wenn nichts am Lager ist).
function materialList() {
const all = Object.keys(MATERIALS);
if (isSeries()) return all;
const mats = effectiveMaterials();
const inStock = all.filter((m) => mats[m].colors.length > 0);
return inStock.length ? inStock : all;
}

// Bestellbare Farbpalette je Material (deutsche Namen, offizielle Hex-Werte).
// Bei Kleinserie: alles hieraus, was NICHT am Lager ist, erscheint als
// "auf Bestellung". Beim Einzelauftrag gilt nur der Lagerbestand.
const PALETTE = {
PLA: [
{ n: "Weiss", h: "#FFFFFF" }, { n: "Beige", h: "#F7E6DE" }, { n: "Hellgrau", h: "#D1D3D5" },
{ n: "Silber", h: "#A6A9AA" }, { n: "Grau", h: "#8E9089" }, { n: "Blaugrau", h: "#5B6579" },
{ n: "Dunkelgrau", h: "#545454" }, { n: "Schwarz", h: "#000000" }, { n: "Magenta", h: "#EC008C" },
{ n: "Pink", h: "#F55A74" }, { n: "Knallpink", h: "#F5547C" }, { n: "Weinrot", h: "#9D2235" },
{ n: "Rot", h: "#C12E1F" }, { n: "Orange", h: "#FF6A13" }, { n: "Dunkelorange", h: "#FF9016" },
{ n: "Gold", h: "#E4BD68" }, { n: "Sonnengelb", h: "#FEC600" }, { n: "Gelb", h: "#F4EE2A" },
{ n: "Hellgrün", h: "#BECF00" }, { n: "Grün", h: "#00AE42" }, { n: "Tannengrün", h: "#3F8E43" },
{ n: "Türkis", h: "#00B1B7" }, { n: "Cyan", h: "#0086D6" }, { n: "Blau", h: "#0A2989" },
{ n: "Kobaltblau", h: "#0056B8" }, { n: "Violett", h: "#5E43B7" }, { n: "Indigo", h: "#482960" },
{ n: "Bronze", h: "#847D48" }, { n: "Kakaobraun", h: "#6F5034" }, { n: "Braun", h: "#9D432C" },
],
PETG: [
{ n: "Weiss", h: "#FFFFFF" }, { n: "Dunkelbeige", h: "#DBC8B6" }, { n: "Grau", h: "#7F7E83" },
{ n: "Schwarz", h: "#000000" }, { n: "Rot", h: "#D6001C" }, { n: "Orange", h: "#FF671F" },
{ n: "Gelb", h: "#FCE300" }, { n: "Grün", h: "#009639" }, { n: "Tannengrün", h: "#034638" },
{ n: "Nebelblau", h: "#688197" }, { n: "Blau", h: "#0086D6" }, { n: "Dunkelblau", h: "#001489" },
{ n: "Dunkelbraun", h: "#4F2C1D" },
],
ABS: [
{ n: "Weiss", h: "#FFFFFF" }, { n: "Sandbeige", h: "#E8DBB7" }, { n: "Silber", h: "#87909A" },
{ n: "Schwarz", h: "#000000" }, { n: "Rot", h: "#D32941" }, { n: "Orange", h: "#FF6A13" },
{ n: "Gelb", h: "#FFC72C" }, { n: "Olivgrün", h: "#789D4A" }, { n: "Azurblau", h: "#489FDF" },
{ n: "Blau", h: "#0A2CA5" }, { n: "Dunkelblau", h: "#0C2340" }, { n: "Violett", h: "#AF1685" },
],
TPU: [
{ n: "Weiss", h: "#FFFFFF" }, { n: "Grau", h: "#898D8D" }, { n: "Schwarz", h: "#101820" },
{ n: "Rot", h: "#C8102E" }, { n: "Gelb", h: "#F3E600" }, { n: "Blau", h: "#0072CE" },
],
};

// Bestellbare Farben eines Materials = Palette ohne die bereits vorrätigen
// (Abgleich per Name, case-insensitive).
function orderableColors(material, stockColors) {
const inStock = new Set(stockColors.map((c) => c.n.trim().toLowerCase()));
return PALETTE[material].filter((c) => !inStock.has(c.n.toLowerCase()));
}

const initialState = {
stepId: "project", service: null, sizeIdx: null, complexIdx: null,
name: "", description: "", qty: "1", material: "PLA", colors: [],
firstName: "", lastName: "", email: "", phone: "", notes: "",
payment: "link", invoiceConfirmed: false,
agb: false, sent: false, orderNo: null,
};
let s = { ...initialState };

// Reihenfolge der Schritte – "material" entfällt bei "Nur Design".
// "project" fasst Auftragstyp + Service in einem Schritt zusammen (5 -> 4 Schritte).
const STEP_LABEL = { project: "Projekt", model: "Modell", material: "Material", contact: "Kontakt" };
function steps() {
const list = ["project", "model"];
if (s.service !== "design") list.push("material");
list.push("contact");
return list;
}

function esc(str) {
return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ===== Auftragsnummer =====
async function reserveOrderNumber() {
if (s.orderNo) return s.orderNo;
if (ORDER_NUMBER_ENDPOINT) {
try {
const res = await fetch(ORDER_NUMBER_ENDPOINT, { method: "GET" });
const data = await res.json();
if (data && data.orderNo) { s.orderNo = String(data.orderNo); return s.orderNo; }
} catch (err) {
console.warn("Auftragsnummer-Server nicht erreichbar – nutze provisorische Nummer.", err);
}
}
s.orderNo = provisionalOrderNumber();
return s.orderNo;
}
function provisionalOrderNumber() {
const year = new Date().getFullYear();
const rnd = Math.floor(Math.random() * 900 + 100);
return `SKV-${year}-P${rnd}`;
}

// ===== AGB-/Datenschutz-Modal =====
const LEGAL_META = {
agb: { url: "agb.html", title: "Allgemeine Geschäftsbedingungen" },
datenschutz: { url: "datenschutz.html", title: "Datenschutzerklärung" },
};

function ensureLegalModalStyles() {
if (document.getElementById("skv-legal-modal-style")) return;
const st = document.createElement("style");
st.id = "skv-legal-modal-style";
st.textContent = `
.skv-modal-overlay { position: fixed; inset: 0; z-index: 1000; display: flex;
  align-items: center; justify-content: center; padding: 20px;
  background: rgba(26,34,51,0.5); animation: skvFade .18s ease; }
@keyframes skvFade { from { opacity: 0; } to { opacity: 1; } }
.skv-modal { width: min(720px, 100%); max-height: min(84vh, 900px); display: flex;
  flex-direction: column; background: #fff; border-radius: 8px; overflow: hidden;
  box-shadow: 0 24px 70px rgba(26,34,51,0.3); }
.skv-modal-head { display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px 20px; border-bottom: 1px solid #E3E7ED; background: #fff; }
.skv-modal-title { font-weight: 600; font-size: 16px; color: ${INK}; letter-spacing: -0.01em; }
.skv-modal-close { flex: none; width: 34px; height: 34px; border: none; cursor: pointer;
  border-radius: 6px; background: #F5F7F9; color: ${INK}; font-size: 22px; line-height: 1;
  display: flex; align-items: center; justify-content: center; transition: background .15s; }
.skv-modal-close:hover { background: #E3E7ED; }
.skv-modal-body { padding: 22px 24px 26px; overflow-y: auto; -webkit-overflow-scrolling: touch;
  color: #334155; font-size: 14.5px; line-height: 1.65; }
.skv-modal-body h1, .skv-modal-body h2 { font-size: 17px; font-weight: 700; color: ${INK};
  margin: 22px 0 8px; letter-spacing: -0.01em; }
.skv-modal-body h1:first-child, .skv-modal-body h2:first-child { margin-top: 0; }
.skv-modal-body h3 { font-size: 14.5px; font-weight: 700; color: ${INK}; margin: 16px 0 6px; }
.skv-modal-body p { margin: 0 0 12px; }
.skv-modal-body ul, .skv-modal-body ol { padding-left: 20px; margin: 0 0 14px;
  display: flex; flex-direction: column; gap: 6px; }
.skv-modal-body ul { list-style: disc; } .skv-modal-body ol { list-style: decimal; }
.skv-modal-body a { color: ${ACCENT}; font-weight: 600; }
.skv-modal-body strong { color: ${INK}; font-weight: 700; }
.skv-modal-loading { color: ${MUTED}; }
.order-no-badge { display: inline-flex; flex-direction: column; align-items: center; gap: 2px;
  margin: 4px auto 14px; padding: 10px 22px; border-radius: 8px;
  background: #EAF0F6; border: 1px solid #E3E7ED;
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; }
.order-no-badge strong { font-size: 20px; letter-spacing: 0.02em; text-transform: none;
  color: ${ACCENT}; font-weight: 700; }`;
document.head.appendChild(st);
}

function openLegalModal(which) {
const meta = LEGAL_META[which];
if (!meta) return;
ensureLegalModalStyles();

const overlay = document.createElement("div");
overlay.className = "skv-modal-overlay";
overlay.innerHTML = `<div class="skv-modal" role="dialog" aria-modal="true" aria-label="${esc(meta.title)}">
  <div class="skv-modal-head">
    <span class="skv-modal-title">${esc(meta.title)}</span>
    <button class="skv-modal-close" type="button" aria-label="Schliessen">&times;</button>
  </div>
  <div class="skv-modal-body"><p class="skv-modal-loading">Lädt …</p></div>
</div>`;
document.body.appendChild(overlay);
document.body.style.overflow = "hidden";

const bodyEl = overlay.querySelector(".skv-modal-body");
function close() {
overlay.remove();
document.body.style.overflow = "";
document.removeEventListener("keydown", onKey);
}
function onKey(e) { if (e.key === "Escape") close(); }
overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });
overlay.querySelector(".skv-modal-close").addEventListener("click", close);
document.addEventListener("keydown", onKey);
overlay.querySelector(".skv-modal-close").focus();

fetch(meta.url)
.then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
.then((html) => {
const doc = new DOMParser().parseFromString(html, "text/html");
const content = doc.querySelector(".legal-card") || doc.querySelector(".legal-main") || doc.body;
bodyEl.innerHTML = content.innerHTML;
bodyEl.querySelectorAll("a[href]").forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
})
.catch(() => {
bodyEl.innerHTML = `<p>Der Inhalt konnte hier nicht geladen werden.</p>
  <p><a href="${meta.url}" target="_blank" rel="noopener">${esc(meta.title)} in neuem Tab öffnen →</a></p>`;
});
}

const ON_REQUEST = "Preis auf Anfrage";
const extraColors = () => Math.max(0, s.colors.length - 1);
// Beträge im Schweizer Stil: 12.– statt 12.00, 20.50 bleibt 20.50.
function chf(v) { return v.toFixed(2).replace(/\.00$/, ".–"); }

// Aufschlüsselung des Preises – dieselbe Liste, die in der Sidebar und in der
// Anfrage-Mail steht. null, wenn (noch) nicht rechenbar.
function priceBreakdown() {
if (!priceKnown() || isCustomSize()) return null;
const rows = [];
let total = 0;
if (needsComplexity()) {
const c = selComplexity();
rows.push({ k: `Konstruktion (${c.label})`, v: c.price });
total += c.price;
}
if (needsSize()) {
const z = selSize(), q = qtyNum();
const base = z.price * q;
rows.push({ k: `Druck ${q} × ${z.label}`, v: base });
const mat = MATERIAL_FACTOR[s.material] || 1;
const matAdd = base * (mat - 1);
if (matAdd > 0) rows.push({ k: `Material ${s.material} (+${Math.round((mat - 1) * 100)} %)`, v: matAdd });
const colAdd = (base + matAdd) * COLOR_FACTOR * extraColors();
if (colAdd > 0) rows.push({ k: `${s.colors.length} Farben (+${COLOR_FACTOR * 100} % je Zusatzfarbe)`, v: colAdd });
rows.push({ k: "Rüsten & Verpacken", v: SETUP_FEE });
const print = base + matAdd + colAdd;
const disc = qtyDiscount(q);
total += print + SETUP_FEE;
if (disc) {
rows.push({ k: `Mengenrabatt (${disc * 100} %)`, v: -print * disc });
total -= print * disc;
}
}
// Mindestauftragswert: darunter wird nie kalkuliert.
const raised = total < MIN_PRICE;
if (raised) rows.push({ k: `Mindestauftragswert`, v: MIN_PRICE - total });
return { rows, total: Math.max(MIN_PRICE, total), raised };
}

// Angezeigte Spanne: ±20 % um den berechneten Wert, auf 5.– gerundet.
function priceRangeText() {
if (!priceKnown()) return "Wähle Service & Stufe für eine erste Schätzung";
if (isCustomSize()) return ON_REQUEST;
const b = priceBreakdown();
const r5 = (v) => Math.round(v / 5) * 5;
const lo = Math.max(MIN_PRICE, r5(b.total * 0.8));
const hi = Math.max(lo + 5, r5(b.total * 1.2));
return `CHF ${lo}–${hi}` + (needsSize() ? " (exkl. Versand)" : "");
}

function buildMessage(priceText) {
let m = `Neue Bestellung – Skuvert Custom 3D Service\n`;
m += `Auftragsnummer: ${s.orderNo || "-"}\n`;
m += `==========================================\n\n`;
m += `AUFTRAGSTYP: ${orderTypeLabel()}\n`;
m += `SERVICE: ${s.service ? SVC_LABEL[s.service] : "-"}\n\n`;
m += `MODELL\n`;
m += `Bezeichnung : ${s.name}\n`;
if (needsSize()) m += `Druckgrösse : ${selSize() ? selSize().label : "-"}\n`;
if (needsComplexity()) m += `Komplexität : ${selComplexity() ? selComplexity().label : "-"}\n`;
m += `Menge : ${qtyNum()} Stück\n`;
m += `Beschreibung:\n${s.description}\n`;
if (s.service !== "design") {
m += `\nMATERIAL & FARBE\n`;
m += `Material : ${s.material}\n`;
m += `Farbe(n) : ${s.colors.length ? s.colors.join(", ") : "-"}\n`;
if (extraColors() > 0) m += `Mehrfarbig : Ja (${s.colors.length} Farben)\n`;
if (isSeries()) {
const stockNames = new Set((effectiveMaterials()[s.material].colors || []).map((c) => c.n.toLowerCase()));
const toOrder = s.colors.filter((c) => !stockNames.has(c.toLowerCase()));
if (toOrder.length) m += `Auf Bestellung: ${toOrder.join(", ")} (nicht am Lager, +3–7 Arbeitstage)\n`;
}
}
const bk = priceBreakdown();
if (bk) {
m += `\nPREIS – AUFSCHLÜSSELUNG\n`;
bk.rows.forEach((r) => { m += `${r.k.padEnd(32)} ${r.v < 0 ? "−" : ""}${chf(Math.abs(r.v))}\n`; });
m += `${"Berechnet".padEnd(32)} ${chf(bk.total)}\n`;
}
m += `\nGESCHÄTZTE PREISRANGE: ${priceText}\n(Erste Einschätzung – finaler Preis folgt persönlich mit dem Angebot.)\n`;
m += `\nZAHLUNG\n`;
m += `Methode : ${s.payment ? payLabel(s.payment) : "-"}\n`;
if (s.payment === "invoice") {
m += `Rechnung akzeptiert : Ja – verbindliche Zahlungszusage, Zahlungsziel 14 Tage nach Rechnungsstellung.\n`;
}
if (s.notes) m += `\nANMERKUNGEN:\n${s.notes}\n`;
m += `\nKONTAKT\n`;
m += `Name : ${s.firstName} ${s.lastName}\n`;
m += `E-Mail: ${s.email}\n`;
if (s.phone) m += `Tel/WA: ${s.phone}\n`;
m += `\nAGB & Datenschutz akzeptiert: ${s.agb ? "Ja" : "Nein"}\n`;
return m;
}

// Ob die Anfrage abgeschickt werden darf (steuert den disabled-State der Buttons).
function canSend() {
if (!s.agb) return false;
if (!s.payment) return false;
if (s.payment === "invoice" && !s.invoiceConfirmed) return false; // Pflicht-Checkbox Kleinserie/Rechnung
return true;
}

function validateContact() {
if (!s.firstName.trim() || !s.lastName.trim()) { alert("Bitte Vor- und Nachname angeben."); return false; }
if (!s.email.trim() || !s.email.includes("@")) { alert("Bitte eine gültige E-Mail-Adresse angeben."); return false; }
if (!s.payment) { alert("Bitte wähle eine Zahlungsmethode."); return false; }
if (s.payment === "invoice" && !s.invoiceConfirmed) { alert("Bitte bestätige die verbindliche Zahlungszusage für die Rechnung."); return false; }
if (!s.agb) { alert("Bitte akzeptiere die AGB und die Datenschutzerklärung, um deine Anfrage zu senden."); return false; }
return true;
}

async function sendEmail() {
if (!validateContact()) return;
await reserveOrderNumber();
const subject = encodeURIComponent(`Neue Bestellung – ${s.orderNo} – ${s.name}`);
const body = encodeURIComponent(buildMessage(priceRangeText()));
window.location.href = `mailto:skuvert.ch@gmail.com?subject=${subject}&body=${body}`;
setTimeout(() => { s.sent = true; render(); }, 700);
}

async function sendWhatsApp() {
if (!validateContact()) return;
await reserveOrderNumber();
const text = encodeURIComponent(buildMessage(priceRangeText()));
window.open(`https://wa.me/41774646298?text=${text}`, "_blank");
setTimeout(() => { s.sent = true; render(); }, 700);
}

function label(text, required) {
return `<label class="rf-label">${esc(text)} ${required ? '<span class="req">*</span>' : ""}</label>`;
}

function progressHtml() {
const list = steps();
const cur = list.indexOf(s.stepId);
return `<div class="rf-progress">
<div class="rf-bars">${list.map((id, idx) => `<div class="rf-seg ${idx < cur ? "done" : idx === cur ? "cur" : ""}"></div>`).join("")}</div>
<div class="rf-steplabels">${list.map((id, idx) => `<span class="${idx === cur ? "cur" : idx < cur ? "done" : ""}">${STEP_LABEL[id]}</span>`).join("")}</div>
</div>`;
}

// Aufschlüsselung, damit der Preis nachvollziehbar ist (kein Blackbox-Betrag).
function breakdownHtml() {
const b = priceBreakdown();
if (!b) return "";
return `<div class="side-break">
${b.rows.map((r) => `<div class="bk-row${r.v < 0 ? " neg" : ""}"><span>${esc(r.k)}</span><span>${r.v < 0 ? "−" : ""}${chf(Math.abs(r.v))}</span></div>`).join("")}
</div>`;
}

// Mitlaufende Zusammenfassung + Richtpreis (rechte Spalte, immer sichtbar).
function sideSummaryHtml() {
const known = priceKnown();
const val = (v) => (v ? `<span class="v">${esc(v)}</span>` : `<span class="v dim">noch offen</span>`);
const colorSummary = s.colors.join(", ");
const matValue = s.material + (colorSummary ? " · " + colorSummary : "");
return `<div class="side-head">Deine Anfrage</div>
<div class="side-body">
<div class="side-row"><span class="k">Service</span>${val(s.service ? SVC_LABEL[s.service] : "")}</div>
<div class="side-row"><span class="k">Objekt</span>${val(s.name)}</div>
<div class="side-row"><span class="k">Menge</span>${val(qtyNum() + " Stück" + (isSeries() ? " · Kleinserie" : ""))}</div>
${s.service && s.service !== "design" ? `<div class="side-row"><span class="k">Material</span>${val(matValue)}</div>` : ""}
</div>
<div class="side-price">
${breakdownHtml()}
<div class="pl">Geschätzter Preis</div>
<div class="pv${known ? "" : " dim"}">${known ? esc(priceRangeText()) : "CHF –"}</div>
<div class="ph">${isCustomSize() ? "Wir prüfen dein Objekt und melden uns mit einem Preis." : "Erste Einschätzung – finaler Preis folgt persönlich mit dem Angebot."}</div>
</div>
<div class="side-assure">${svg("icon-info")} Antwort meist innert 24 Stunden.</div>`;
}

// ===== SCHRITT 1: Projekt (Service) =====
function stepProjectHtml() {
return `<div>
<div class="rf-title">Was brauchst du?</div>
<div class="rf-subtitle">Wähle den Service – den Rest klären wir Schritt für Schritt.</div>
<div class="service-list">
${SERVICES.map(
(svc) => `<div class="service-option${s.service === svc.key ? " selected" : ""}" data-service="${svc.key}">
<span class="opt-ic">${svg(svc.icon)}</span>
<div><div class="title">${esc(svc.title)}</div><div class="desc">${esc(svc.desc)}</div></div>
</div>`
).join("")}
</div>
<div class="notice-box compact" style="margin-top:18px"><span class="n-ic">${svg("icon-info")}</span><p>Du kannst jederzeit einen Schritt zurück – deine Angaben bleiben erhalten.</p></div>
<div class="nav-row end-only"><button class="glass-btn glass-btn--accent" data-action="next">Weiter →</button></div>
</div>`;
}

// Stufen-Raster (Grösse oder Komplexität) – "attr" ist das data-Attribut für den Klick-Handler.
function tierGrid(options, selected, attr) {
const steps = Math.max(...options.map((o) => o.level)); // Grössen: 5 Balken, Komplexität: 4
return `<div class="tier-grid">
${options.map(
(opt, i) => `<div class="tier-option${selected === i ? " selected" : ""}${opt.custom ? " tier-option--custom" : ""}" data-${attr}="${i}">
<div class="tier-bars">${Array.from({ length: steps }, (_, n) => n + 1).map((b) => `<i class="${b <= opt.level ? "on" : ""}"></i>`).join("")}</div>
<div class="t-label">${esc(opt.label)}</div>
<div class="t-sub">${esc(opt.sub)}</div>
</div>`
).join("")}
</div>`;
}

function stepModelHtml() {
return `<div>
<div class="rf-title">Modell-Details</div>
<div class="rf-subtitle">Je mehr Details, desto präziser mein Angebot.</div>
<div class="rf-field">${label("Bezeichnung / Name des Objekts", true)}
<input class="rf-input" id="f-name" value="${esc(s.name)}" placeholder="z. B. Werkzeughalter, Schlüsselanhänger …">
</div>
${needsSize() ? `<div class="rf-field">${label("Druckgrösse", true)}
${tierGrid(SIZES, s.sizeIdx, "size")}
${isCustomSize() ? `<div class="notice-box compact" style="margin-top:12px"><span class="n-ic">${svg("icon-info")}</span><p><strong>${ON_REQUEST}</strong> – wir melden uns nach Prüfung bei dir. Bitte die ungefähren Masse in der Beschreibung angeben.</p></div>` : ""}
</div>` : ""}
${needsComplexity() ? `<div class="rf-field">${label("Komplexität", true)}
${tierGrid(COMPLEXITY, s.complexIdx, "complex")}
</div>` : ""}
<div class="rf-field">${label("Menge", true)}
<input class="rf-input" id="f-qty" type="number" min="1" step="1" style="max-width:160px" value="${esc(s.qty)}">
<div class="mat-desc" style="margin-top:8px">Ab ${SERIES_MIN} Stück gilt dein Auftrag als Kleinserie – dann ist auch Zahlung per Rechnung möglich.</div>
</div>
<div class="rf-field">${label("Beschreibung & Anforderungen", true)}
<textarea class="rf-input" id="f-description" placeholder="Grösse, Funktion, Toleranzen, Masse, besondere Anforderungen …">${esc(s.description)}</textarea>
</div>
<div class="notice-box"><span class="n-ic">${svg("icon-info")}</span><p>Bitte füge Skizzen, Referenzbilder oder 3D-Dateien <strong>direkt beim Senden</strong> als Anhang hinzu. Formate: Bilder · PDF · STL · OBJ · STEP · 3MF · DXF</p></div>
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="next">Weiter →</button></div>
</div>`;
}

function stepMaterialHtml() {
const mats = effectiveMaterials();
const keys = materialList();
if (!keys.includes(s.material)) { s.material = keys[0]; s.colors = []; } // gewähltes Material nicht (mehr) verfügbar
const series = isSeries();
const desc = mats[s.material].desc;
const stock = mats[s.material].colors;                 // vorrätig (aus Dashboard-Bestand)
const order = series ? orderableColors(s.material, stock) : []; // nur Kleinserie: Rest bestellbar
const swatch = (c) => `<div class="color-swatch-wrap${s.colors.includes(c.n) ? " selected" : ""}" data-color="${esc(c.n)}">
<div class="color-swatch" style="background:${c.h}"></div>
<span>${esc(c.n)}</span>
</div>`;
const surchargeNote = extraColors() > 0
? `<div class="mat-desc" style="margin-top:10px">Mehrfarbig gewählt (+${COLOR_FACTOR * 100} % auf den Druckanteil je Zusatzfarbe): Bitte in der Beschreibung genau angeben, welche Farbe wohin kommt, oder ein Referenzbild mitschicken.</div>`
: "";
const colorBlock = series
? `<div class="cg-label">Ab Lager – sofort verfügbar</div>
${stock.length ? `<div class="color-row">${stock.map(swatch).join("")}</div>` : `<div class="mat-desc">Aktuell nichts an ${esc(s.material)} am Lager.</div>`}
<div class="cg-label" style="margin-top:16px">Weitere Farben – auf Bestellung <span class="cg-note">(+3–7 Arbeitstage)</span></div>
<div class="color-row">${order.map(swatch).join("")}</div>`
: `<div class="color-row">${stock.length ? stock.map(swatch).join("") : `<div class="mat-desc">Aktuell keine ${esc(s.material)}-Farbe am Lager.</div>`}</div>`;
return `<div>
<div class="rf-title">Material &amp; Farbe</div>
<div class="rf-subtitle">Alle Materialien werden auf meinen Bambu Lab-Druckern verarbeitet.</div>
<div class="rf-field">${label("Material", true)}
<div class="chip-row">${keys.map((m) => `<div class="mat-chip${s.material === m ? " selected" : ""}" data-material="${m}">${m}</div>`).join("")}</div>
<div class="mat-desc">${esc(desc)}</div>
</div>
<div class="rf-field">${label("Farbe (Mehrfachauswahl möglich, jede weitere Farbe +15 % auf den Druckanteil)", true)}
${colorBlock}
${surchargeNote}
</div>
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="next">Weiter →</button></div>
</div>`;
}

// Zahlungsmethode – abhängig vom Auftragstyp (Kleinserie => zusätzlich "Rechnung").
function paySelectHtml() {
const opts = paymentOptions();
// Menge nachträglich unter die Kleinserien-Grenze gesenkt -> "Rechnung" fällt weg.
if (s.payment === "invoice" && !isSeries()) { s.payment = "link"; s.invoiceConfirmed = false; }
return `<div class="rf-field">${label("Zahlungsmethode", true)}
<div class="pay-select">
${opts.map(
(o) => `<div class="pay-option${s.payment === o.key ? " selected" : ""}" data-payment="${o.key}">
<span class="dot"></span><span>${esc(o.label)}</span>
</div>`
).join("")}
</div>
${s.payment === "invoice" ? `<label class="invoice-confirm" data-action="toggle-invoice">
<input type="checkbox" ${s.invoiceConfirmed ? "checked" : ""} tabindex="-1" style="pointer-events:none" aria-label="Zahlungsverpflichtung bestätigen">
<span>${esc(INVOICE_TEXT)} <span class="req">*</span></span>
</label>` : ""}
</div>`;
}

function stepContactHtml() {
const ready = canSend();
return `<div>
<div class="rf-title">Fast geschafft</div>
<div class="rf-subtitle">Kontaktdaten ausfüllen, Zahlungsmethode wählen und Anfrage absenden. Deine Angaben &amp; der Richtpreis stehen rechts.</div>
<div class="rf-field tight" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:16px">
<div>${label("Vorname", true)}<input class="rf-input" id="f-firstName" value="${esc(s.firstName)}" placeholder="Max"></div>
<div>${label("Nachname", true)}<input class="rf-input" id="f-lastName" value="${esc(s.lastName)}" placeholder="Muster"></div>
</div>
<div class="rf-field tight">${label("E-Mail", true)}<input class="rf-input" id="f-email" type="email" value="${esc(s.email)}" placeholder="max@example.com"></div>
<div class="rf-field tight">${label("Telefon / WhatsApp")}<input class="rf-input" id="f-phone" value="${esc(s.phone)}" placeholder="+41 79 000 00 00"></div>
<div class="rf-field">${label("Weitere Anmerkungen")}<textarea class="rf-input" id="f-notes" placeholder="Preislimit, Wunschdatum, Sonderwünsche …">${esc(s.notes)}</textarea></div>
${paySelectHtml()}
<div class="notice-box compact"><span class="n-ic">${svg("icon-info")}</span><p>Bitte füge Skizzen, Fotos oder 3D-Dateien <strong>direkt im Mail- oder WhatsApp-Fenster</strong> als Anhang hinzu, bevor du sendest.</p></div>
<label class="agb-check${s.agb ? " on" : ""}" data-action="toggle-agb">
<input type="checkbox" ${s.agb ? "checked" : ""} tabindex="-1" aria-label="AGB und Datenschutzerklärung akzeptieren" style="pointer-events:none">
<span>Ich habe die <a href="agb.html" target="_blank" rel="noopener" data-legal="agb">AGB</a> und die <a href="datenschutz.html" target="_blank" rel="noopener" data-legal="datenschutz">Datenschutzerklärung</a> gelesen und akzeptiere sie. <span class="req">*</span></span>
</label>
<div class="send-grid">
<button class="glass-btn glass-btn--dark send-btn" data-action="send-email" ${ready ? "" : "disabled"}>${svg("icon-mail")} Per E-Mail</button>
<button class="glass-btn glass-btn--whatsapp send-btn" data-action="send-whatsapp" ${ready ? "" : "disabled"}>${svg("icon-whatsapp")} WhatsApp</button>
</div>
<div class="send-hint">Ich melde mich so schnell wie möglich mit einem Angebot.</div>
<div class="nav-row center-only"><button class="glass-btn glass-btn--ghost" data-action="back">← Zurück</button></div>
</div>`;
}

function successHtml() {
return `<div class="success-screen">
<div class="success-check">✓</div>
<h3>Bestellung gesendet!</h3>
${s.orderNo ? `<div class="order-no-badge">Deine Auftragsnummer<strong>${esc(s.orderNo)}</strong></div>` : ""}
<p>Danke für deine Bestellung!<br>Ich melde mich so schnell wie möglich mit einem Angebot bei dir. Bitte gib bei Rückfragen deine Auftragsnummer an.</p>
<button class="glass-btn glass-btn--accent" data-action="restart">Neue Anfrage starten</button>
</div>`;
}

function render() {
// Anker: Scrollposition merken -> kein Springen beim Schritt-Wechsel.
const prevAnchor = mount.querySelector(".rf-shell");
const prevTop = prevAnchor ? prevAnchor.getBoundingClientRect().top : null;

let html;
if (s.sent) {
html = `<div class="rf-shell"><div class="rf-main rf-main--full">${successHtml()}</div></div>`;
} else {
let step;
if (s.stepId === "project") step = stepProjectHtml();
else if (s.stepId === "model") step = stepModelHtml();
else if (s.stepId === "material") step = stepMaterialHtml();
else step = stepContactHtml();
html = `<div class="rf-shell">
${progressHtml()}
<div class="rf-layout">
<div class="rf-main">${step}</div>
<aside class="rf-side">${sideSummaryHtml()}</aside>
</div>
</div>`;
}
mount.innerHTML = html;
attachListeners();

if (prevTop !== null) {
const newAnchor = mount.querySelector(".rf-shell");
if (newAnchor) {
const delta = newAnchor.getBoundingClientRect().top - prevTop;
if (Math.abs(delta) > 1) window.scrollBy(0, delta);
}
}
}

function bindText(id, field) {
const el = mount.querySelector("#" + id);
if (el) el.addEventListener("input", (e) => { s[field] = e.target.value; });
}

// Validierung des aktuellen Schritts vor "Weiter".
function validateStep(id) {
if (id === "project" && !s.service) { alert("Bitte wähle einen Service."); return false; }
if (id === "model") {
if (!s.name.trim() || !s.description.trim()) { alert("Bitte Bezeichnung und Beschreibung ausfüllen."); return false; }
if (needsSize() && s.sizeIdx === null) { alert("Bitte eine Druckgrösse wählen."); return false; }
if (needsComplexity() && s.complexIdx === null) { alert("Bitte eine Komplexitätsstufe wählen."); return false; }
if (!(parseInt(s.qty, 10) >= 1)) { alert("Bitte eine Menge ab 1 Stück angeben."); return false; }
}
if (id === "material") {
if (!s.material || s.colors.length === 0) { alert("Bitte Material und mindestens eine Farbe wählen."); return false; }
}
return true;
}

function nav(dir) {
if (dir > 0 && !validateStep(s.stepId)) return;
const list = steps();
const i = list.indexOf(s.stepId);
const ni = i + dir;
if (ni < 0 || ni >= list.length) return;
s.stepId = list[ni];
render();
}

function attachListeners() {
mount.querySelectorAll("[data-service]").forEach((el) => {
el.addEventListener("click", () => { s.service = el.dataset.service; s.sizeIdx = null; s.complexIdx = null; s.colors = []; render(); });
});
mount.querySelectorAll("[data-size]").forEach((el) => {
el.addEventListener("click", () => { s.sizeIdx = Number(el.dataset.size); render(); });
});
mount.querySelectorAll("[data-complex]").forEach((el) => {
el.addEventListener("click", () => { s.complexIdx = Number(el.dataset.complex); render(); });
});
mount.querySelectorAll("[data-material]").forEach((el) => {
el.addEventListener("click", () => { s.material = el.dataset.material; s.colors = []; render(); });
});
mount.querySelectorAll("[data-color]").forEach((el) => {
el.addEventListener("click", () => {
const c = el.dataset.color;
s.colors = s.colors.includes(c) ? s.colors.filter((x) => x !== c) : [...s.colors, c];
render();
});
});
mount.querySelectorAll("[data-payment]").forEach((el) => {
el.addEventListener("click", () => {
s.payment = el.dataset.payment;
if (s.payment !== "invoice") s.invoiceConfirmed = false;
render();
});
});
const inv = mount.querySelector('[data-action="toggle-invoice"]');
if (inv) inv.addEventListener("click", (e) => { e.preventDefault(); s.invoiceConfirmed = !s.invoiceConfirmed; render(); });

const agb = mount.querySelector('[data-action="toggle-agb"]');
if (agb) agb.addEventListener("click", (e) => {
const link = e.target.closest("a[data-legal]");
if (link) { e.preventDefault(); openLegalModal(link.getAttribute("data-legal")); return; }
e.preventDefault();
s.agb = !s.agb;
render();
});

const act = (name, fn) => { const el = mount.querySelector(`[data-action="${name}"]`); if (el) el.addEventListener("click", fn); };
act("next", () => nav(1));
act("back", () => nav(-1));
act("send-email", sendEmail);
act("send-whatsapp", sendWhatsApp);
act("restart", () => { s = { ...initialState }; render(); });

bindText("f-name", "name");
bindText("f-description", "description");
bindText("f-qty", "qty");
// Menge wirkt auf den Richtpreis -> Sidebar-Preis live nachziehen (ohne
// Re-Render, damit der Cursor im Feld bleibt).
const qtyEl = mount.querySelector("#f-qty");
if (qtyEl) qtyEl.addEventListener("input", () => {
const side = mount.querySelector(".rf-side");
if (side) side.innerHTML = sideSummaryHtml(); // nur die Sidebar, Cursor bleibt im Feld
});
bindText("f-firstName", "firstName");
bindText("f-lastName", "lastName");
bindText("f-email", "email");
bindText("f-phone", "phone");
bindText("f-notes", "notes");

// Auftragsnummer schon beim Betreten des Kontakt-Schritts im Hintergrund reservieren.
if (s.stepId === "contact" && !s.orderNo && !s.sent) { reserveOrderNumber(); }
}

loadInventory(); // Bestand vom Dashboard laden (Fallback: Defaults)
render();
})();
