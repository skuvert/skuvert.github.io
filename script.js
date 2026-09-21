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

// ===== Auftragstyp (Schritt 0 – NEU) =====
// Steuert unten die verfügbaren Zahlungsmethoden.
const ORDER_TYPES = [
{ key: "single", icon: "icon-cube", title: "Einzelauftrag", desc: "Einzelnes Objekt oder kleine Stückzahl." },
{ key: "series", icon: "icon-boxes", title: "Kleinserie (ab 10 Teilen)", desc: "Grössere Stückzahl – auf Wunsch mit Rechnung (Zahlung nach Erhalt)." },
];
const ORDER_TYPE_LABEL = { single: "Einzelauftrag", series: "Kleinserie (ab 10 Teilen)" };

// ===== Zahlungsmethoden =====
// Basis gilt für Einzelaufträge; Kleinserien erhalten zusätzlich "Rechnung".
const PAY_BASE = [
{ key: "twint", label: "TWINT" },
{ key: "revolut", label: "Revolut" },
{ key: "paypal", label: "PayPal" },
{ key: "bank", label: "Banküberweisung" },
{ key: "card", label: "Kreditkarte (Stripe-Link nach Bestätigung)" },
];
const PAY_INVOICE = { key: "invoice", label: "Rechnung (Zahlung nach Erhalt)" };
const INVOICE_TEXT = "Ich bestätige verbindlich, dass ich mich mit Absenden dieser Anfrage zur Zahlung der Rechnung nach Erhalt der Ware verpflichte, sofern das Angebot von mir bestätigt wurde. Zahlungsziel: 14 Tage nach Rechnungsstellung.";
function paymentOptions() { return s.orderType === "series" ? [...PAY_BASE, PAY_INVOICE] : PAY_BASE; }
function payLabel(key) { const f = [...PAY_BASE, PAY_INVOICE].find((p) => p.key === key); return f ? f.label : "-"; }

const PRICE_DATA = {
design: {
label: "Komplexität", mc: false, note: "",
options: [
{ level: 1, label: "Einfach", sub: "Halter, flache Teile", min: 10, max: 20 },
{ level: 2, label: "Mittel", sub: "Gewinde, Clips, mehrteilig", min: 20, max: 35 },
{ level: 3, label: "Komplex", sub: "Mechanik, organische Formen", min: 35, max: 65 },
{ level: 4, label: "Sehr Komplex", sub: "Baugruppen, Ingenieur", min: 65, max: 125 },
],
},
print: {
label: "Druckgrösse", mc: true, note: "Versandkosten werden separat kalkuliert.",
options: [
{ level: 1, label: "Klein", sub: "bis 5 × 5 × 5 cm", min: 5, max: 10 },
{ level: 2, label: "Mittel", sub: "bis 10 × 10 × 10 cm", min: 10, max: 20 },
{ level: 3, label: "Gross", sub: "bis 15 × 15 × 15 cm", min: 20, max: 45 },
{ level: 4, label: "Riesig", sub: "bis 25 × 25 × 25 cm", min: 45, max: 70 },
],
},
both: {
label: "Komplexität", mc: true, note: "",
options: [
{ level: 1, label: "Einfach", sub: "Halter, flache Teile", min: 15, max: 30 },
{ level: 2, label: "Mittel", sub: "Gewinde, Clips, mehrteilig", min: 30, max: 55 },
{ level: 3, label: "Komplex", sub: "Mechanik, organische Formen", min: 55, max: 75 },
{ level: 4, label: "Sehr Komplex", sub: "Baugruppen, Ingenieur", min: 75, max: 145 },
],
},
};

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
if (s.orderType === "series") return all;
const mats = effectiveMaterials();
const inStock = all.filter((m) => mats[m].colors.length > 0);
return inStock.length ? inStock : all;
}
const CUSTOM_COLOR_NOTE = "Nicht-Lagerfarben bestelle ich extra für dich – die Lieferung kann dadurch 3–7 Arbeitstage länger dauern.";

const initialState = {
stepId: "project", orderType: "single", service: null, priceIdx: null,
name: "", description: "", qty: "", material: "PLA", colors: [], customColor: "",
firstName: "", lastName: "", email: "", phone: "", notes: "",
payment: null, invoiceConfirmed: false,
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

function extraColorSurcharge(data) {
return data.mc ? Math.max(0, s.colors.length - 1) * 3 : 0;
}

function priceRangeText() {
if (!s.service || s.priceIdx === null) return "Wähle Service & Komplexität für eine erste Schätzung";
const data = PRICE_DATA[s.service];
const opt = data.options[s.priceIdx];
const surcharge = extraColorSurcharge(data);
let min = opt.min + surcharge, max = opt.max + surcharge;
let text = `CHF ${min}–${max}`;
if (s.service === "print" || s.service === "both") text += " (exkl. Versand)";
return text;
}

function buildMessage(priceText) {
const data = s.service ? PRICE_DATA[s.service] : null;
const opt = data && s.priceIdx !== null ? data.options[s.priceIdx] : null;
let m = `Neue Bestellung – Skuvert Custom 3D Service\n`;
m += `Auftragsnummer: ${s.orderNo || "-"}\n`;
m += `==========================================\n\n`;
m += `AUFTRAGSTYP: ${s.orderType ? ORDER_TYPE_LABEL[s.orderType] : "-"}\n`;
m += `SERVICE: ${s.service ? SVC_LABEL[s.service] : "-"}\n\n`;
m += `MODELL\n`;
m += `Bezeichnung : ${s.name}\n`;
m += `${data ? data.label : "Komplexität"} : ${opt ? opt.label : "-"}\n`;
m += `Menge : ${s.qty || "1 Stück"}\n`;
m += `Beschreibung:\n${s.description}\n`;
if (s.service !== "design") {
const surcharge = extraColorSurcharge(data);
m += `\nMATERIAL & FARBE\n`;
m += `Material : ${s.material}\n`;
m += `Farbe(n) : ${s.colors.length ? s.colors.join(", ") : "-"}\n`;
if (surcharge > 0) m += `Mehrfarbig : Ja (${s.colors.length} Farben, +${surcharge} CHF)\n`;
if (s.orderType === "series" && s.customColor.trim()) {
m += `Wunschfarbe : ${s.customColor.trim()} (nicht am Lager – wird bestellt, Lieferung +3–7 Arbeitstage)\n`;
}
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

// Mitlaufende Zusammenfassung + Richtpreis (rechte Spalte, immer sichtbar).
function sideSummaryHtml() {
const priceKnown = s.service !== null && s.priceIdx !== null;
const val = (v) => (v ? `<span class="v">${esc(v)}</span>` : `<span class="v dim">noch offen</span>`);
const colorSummary = [s.colors.join(", "), s.orderType === "series" && s.customColor.trim() ? "Wunsch: " + s.customColor.trim() : ""].filter(Boolean).join(" · ");
const matValue = s.material + (colorSummary ? " · " + colorSummary : "");
return `<div class="side-head">Deine Anfrage</div>
<div class="side-body">
<div class="side-row"><span class="k">Auftragstyp</span>${val(s.orderType ? ORDER_TYPE_LABEL[s.orderType] : "")}</div>
<div class="side-row"><span class="k">Service</span>${val(s.service ? SVC_LABEL[s.service] : "")}</div>
<div class="side-row"><span class="k">Objekt</span>${val(s.name)}</div>
${s.service && s.service !== "design" ? `<div class="side-row"><span class="k">Material</span>${val(matValue)}</div>` : ""}
</div>
<div class="side-price">
<div class="pl">Geschätzter Preis</div>
<div class="pv${priceKnown ? "" : " dim"}">${priceKnown ? esc(priceRangeText()) : "CHF –"}</div>
<div class="ph">Erste Einschätzung – finaler Preis folgt persönlich mit dem Angebot.</div>
</div>
<div class="side-assure">${svg("icon-info")} Antwort meist innert 24 Stunden.</div>`;
}

// ===== SCHRITT 1: Projekt (Auftragstyp-Umschalter + Service) =====
const TYPE_TOGGLE = [{ key: "single", label: "Einzelauftrag" }, { key: "series", label: "Kleinserie (ab 10)" }];
function stepProjectHtml() {
return `<div>
<div class="seg-toggle">
${TYPE_TOGGLE.map((o) => `<button type="button" class="seg-opt${s.orderType === o.key ? " on" : ""}" data-ordertype="${o.key}">${esc(o.label)}</button>`).join("")}
</div>
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

function stepModelHtml() {
const data = PRICE_DATA[s.service];
return `<div>
<div class="rf-title">Modell-Details</div>
<div class="rf-subtitle">Je mehr Details, desto präziser mein Angebot.</div>
<div class="rf-field">${label("Bezeichnung / Name des Objekts", true)}
<input class="rf-input" id="f-name" value="${esc(s.name)}" placeholder="z. B. Werkzeughalter, Schlüsselanhänger …">
</div>
<div class="rf-field">${label(data.label, true)}
<div class="tier-grid">
${data.options.map(
(opt, i) => `<div class="tier-option${s.priceIdx === i ? " selected" : ""}" data-tier="${i}">
<div class="tier-bars">${[1, 2, 3, 4].map((b) => `<i class="${b <= opt.level ? "on" : ""}"></i>`).join("")}</div>
<div class="t-label">${esc(opt.label)}</div>
<div class="t-sub">${esc(opt.sub)}</div>
</div>`
).join("")}
</div>
</div>
<div class="rf-field">${label("Beschreibung & Anforderungen", true)}
<textarea class="rf-input" id="f-description" placeholder="Grösse, Funktion, Toleranzen, Masse, besondere Anforderungen …">${esc(s.description)}</textarea>
</div>
<div class="rf-field">${label("Menge")}
<input class="rf-input" id="f-qty" style="max-width:240px" value="${esc(s.qty)}" placeholder="z. B. 1 Stück · 10 Stück">
</div>
<div class="notice-box"><span class="n-ic">${svg("icon-info")}</span><p>Bitte füge Skizzen, Referenzbilder oder 3D-Dateien <strong>direkt beim Senden</strong> als Anhang hinzu. Formate: Bilder · PDF · STL · OBJ · STEP · 3MF · DXF</p></div>
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="next">Weiter →</button></div>
</div>`;
}

function stepMaterialHtml() {
const mats = effectiveMaterials();
const keys = materialList();
if (!keys.includes(s.material)) { s.material = keys[0]; s.colors = []; } // gewähltes Material nicht (mehr) verfügbar
const mat = mats[s.material];
const surcharge = extraColorSurcharge(PRICE_DATA[s.service]);
const series = s.orderType === "series";
const colorLabel = series
? "Farbe (vorrätige anklickbar – oder Wunschfarbe unten)"
: "Farbe (Mehrfachauswahl möglich, jede weitere Farbe +3 CHF)";
return `<div>
<div class="rf-title">Material &amp; Farbe</div>
<div class="rf-subtitle">Alle Materialien werden auf meinen Bambu Lab-Druckern verarbeitet.</div>
<div class="rf-field">${label("Material", true)}
<div class="chip-row">${keys.map((m) => `<div class="mat-chip${s.material === m ? " selected" : ""}" data-material="${m}">${m}</div>`).join("")}</div>
<div class="mat-desc">${esc(mat.desc)}</div>
</div>
<div class="rf-field">${label(colorLabel, !series)}
<div class="color-row">${mat.colors.length ? mat.colors.map(
(c) => `<div class="color-swatch-wrap${s.colors.includes(c.n) ? " selected" : ""}" data-color="${esc(c.n)}">
<div class="color-swatch" style="background:${c.h}"></div>
<span>${esc(c.n)}</span>
</div>`
).join("") : `<div class="mat-desc">Aktuell keine ${esc(s.material)}-Farbe am Lager – gib unten deine Wunschfarbe an.</div>`}</div>
${surcharge > 0 ? `<div class="mat-desc" style="margin-top:10px">Mehrfarbig gewählt (+${surcharge} CHF): Bitte in der Beschreibung genau angeben, welche Farbe wohin kommt, oder ein Referenzbild mitschicken.</div>` : ""}
</div>
${series ? `<div class="rf-field">${label("Wunschfarbe (optional – nicht am Lager)")}
<input class="rf-input" id="f-customColor" value="${esc(s.customColor)}" placeholder="z. B. RAL 5010 Enzianblau, Pantone 2925 C …">
<div class="notice-box compact" style="margin-top:10px"><span class="n-ic">${svg("icon-info")}</span><p>${esc(CUSTOM_COLOR_NOTE)}</p></div>
</div>` : ""}
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="next">Weiter →</button></div>
</div>`;
}

// Zahlungsmethode – abhängig vom Auftragstyp (Kleinserie => zusätzlich "Rechnung").
function paySelectHtml() {
const opts = paymentOptions();
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
if (id === "model" && !(s.name.trim() && s.priceIdx !== null && s.description.trim())) { alert("Bitte Bezeichnung, Stufe und Beschreibung ausfüllen."); return false; }
if (id === "material") {
const hasColor = s.colors.length > 0 || (s.orderType === "series" && s.customColor.trim());
if (!s.material || !hasColor) { alert("Bitte Material und mindestens eine Farbe (oder eine Wunschfarbe) wählen."); return false; }
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
mount.querySelectorAll("[data-ordertype]").forEach((el) => {
el.addEventListener("click", () => {
s.orderType = el.dataset.ordertype;
// Wechsel auf Einzelauftrag: "Rechnung" ist dort nicht verfügbar -> zurücksetzen.
if (s.orderType !== "series" && s.payment === "invoice") { s.payment = null; s.invoiceConfirmed = false; }
render();
});
});
mount.querySelectorAll("[data-service]").forEach((el) => {
el.addEventListener("click", () => { s.service = el.dataset.service; s.priceIdx = null; s.colors = []; render(); });
});
mount.querySelectorAll("[data-tier]").forEach((el) => {
el.addEventListener("click", () => { s.priceIdx = Number(el.dataset.tier); render(); });
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
bindText("f-customColor", "customColor");
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
