// ---------- pixel ripple hero background ----------
(function initPixelBackground() {
const canvas = document.getElementById("pixel-bg");
const hero = document.getElementById("top");
if (!canvas || !hero) return;
const ctx = canvas.getContext("2d");

const BLUE = "rgba(37, 99, 235, 0.9)";
const GRAY = "rgba(100, 116, 139, 0.55)";
const ACCENT_WEIGHT = 1;
const GAP = 7;
const SPEED = 30;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let pixels = [];
let raf = 0;
let lastFrame = 0;

function palette() {
const list = [];
for (let i = 0; i < 6; i++) list.push(i < ACCENT_WEIGHT ? BLUE : GRAY);
return list;
}

function createPixel(x, y, color, baseSpeed, delay) {
const rand = (min, max) => Math.random() * (max - min) + min;
return {
x, y, color,
speed: rand(0.08, 0.4) * baseSpeed,
size: 0,
sizeStep: rand(0.12, 0.28),
minSize: 0.5,
maxSizeInt: 2,
maxSize: rand(0.5, 2),
delay,
counter: 0,
counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
isReverse: false,
isShimmer: false,
draw() {
const offset = this.maxSizeInt * 0.5 - this.size * 0.5;
ctx.fillStyle = this.color;
ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size);
},
appear() {
if (this.counter <= this.delay) {
this.counter += this.counterStep;
return;
}
if (this.size >= this.maxSize) this.isShimmer = true;
if (this.isShimmer) this.shimmer();
else this.size += this.sizeStep;
this.draw();
},
shimmer() {
if (this.size >= this.maxSize) this.isReverse = true;
else if (this.size <= this.minSize) this.isReverse = false;
if (this.isReverse) this.size -= this.speed;
else this.size += this.speed;
},
};
}

function init() {
const { width, height } = hero.getBoundingClientRect();
const w = Math.max(1, Math.floor(width));
const h = Math.max(1, Math.floor(height));
canvas.width = w;
canvas.height = h;
canvas.style.width = w + "px";
canvas.style.height = h + "px";

const effectiveSpeed = reducedMotion ? 0 : Math.min(SPEED, 100) * 0.001;
const pal = palette();
const list = [];
for (let x = 0; x < w; x += GAP) {
for (let y = 0; y < h; y += GAP) {
const color = pal[Math.floor(Math.random() * pal.length)];
const dx = x - w / 2;
const dy = y - h / 2;
const delay = reducedMotion ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.55;
list.push(createPixel(x, y, color, effectiveSpeed, delay));
}
}
pixels = list;
}

function loop() {
raf = requestAnimationFrame(loop);
const now = performance.now();
const frameInterval = 1000 / 60;
const elapsed = now - lastFrame;
if (elapsed < frameInterval) return;
lastFrame = now - (elapsed % frameInterval);
ctx.clearRect(0, 0, canvas.width, canvas.height);
for (const p of pixels) p.appear();
}

init();
raf = requestAnimationFrame(loop);
const ro = new ResizeObserver(() => init());
ro.observe(hero);
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

const INK = "#0F172A";
const MUTED = "#64748B";
const ACCENT = "#2563EB";

// ===== Auftragsnummer-Konfiguration =====
// Nach dem Deployen des Google Apps Scripts (siehe auftragsnummer.gs) hier die
// Web-App-URL eintragen. Solange dieses Feld leer ist ODER der Server nicht
// erreichbar ist, wird eine klar markierte provisorische Nummer (SKV-JAHR-Pxxx)
// erzeugt – diese ist NICHT fortlaufend und dient nur als Notlösung.
const ORDER_NUMBER_ENDPOINT = "https://script.google.com/macros/s/AKfycbytNMII6Emuk3LqKDG3DLNKBRjD94b5UcWeX1wN2PHt6UuQQl2_pcY7AsJ4Dj_pE5f5ww/exec";

const PRICE_DATA = {
design: {
label: "Komplexität", mc: false, note: "",
options: [
{ icon: "◻️", label: "Einfach", sub: "Halter, flache Teile", min: 10, max: 20 },
{ icon: "🔷", label: "Mittel", sub: "Gewinde, Clips, mehrteilig", min: 20, max: 35 },
{ icon: "⚙️", label: "Komplex", sub: "Mechanik, organische Formen", min: 35, max: 65 },
{ icon: "🏗️", label: "Sehr Komplex", sub: "Baugruppen, Ingenieur", min: 65, max: 125 },
],
},
print: {
label: "Druckgrösse", mc: true, note: "Versandkosten werden separat kalkuliert.",
options: [
{ icon: "🔹", label: "Klein", sub: "bis ~10 cm", min: 5, max: 10 },
{ icon: "🔶", label: "Mittel", sub: "bis ~20 cm", min: 10, max: 20 },
{ icon: "📦", label: "Gross", sub: "bis ~35 cm", min: 20, max: 45 },
{ icon: "🏭", label: "Riesig", sub: "über 35 cm", min: 45, max: 70 },
],
},
both: {
label: "Komplexität", mc: true, note: "",
options: [
{ icon: "◻️", label: "Einfach", sub: "Halter, flache Teile", min: 15, max: 30 },
{ icon: "🔷", label: "Mittel", sub: "Gewinde, Clips, mehrteilig", min: 30, max: 55 },
{ icon: "⚙️", label: "Komplex", sub: "Mechanik, organische Formen", min: 55, max: 75 },
{ icon: "🏗️", label: "Sehr Komplex", sub: "Baugruppen, Ingenieur", min: 75, max: 145 },
],
},
};

const SERVICES = [
{ key: "design", icon: "✏️", title: "Nur Design", desc: "Ich erstelle ein 3D-Modell nach deinen Vorgaben inklusive kommerzieller Lizenz. Du erhältst die fertigen Dateien zum selbst Drucken." },
{ key: "print", icon: "🖨️", title: "Nur 3D-Druck", desc: "Du lieferst das 3D-Modell, ich drucke es auf meinem Bambu Lab-System in Topqualität und schicke es dir zu." },
{ key: "both", icon: "⚡", title: "Komplett-Paket", desc: "Von der Skizze zum fertigen Druck, ich übernehme Design und Produktion. Du erhältst das fertige Objekt direkt zu dir nach Hause." },
];

const SVC_LABEL = {
design: "✏️ Nur Design (inkl. kommerz. Lizenz)",
print: "🖨️ Nur 3D-Druck",
both: "⚡ Komplett-Paket (Design + Druck)",
};

const MATERIALS = {
PLA: {
desc: "Universalmaterial – ideal für Dekoartikel, Prototypen und Alltagsgegenstände. Grosse Farbauswahl, einfach zu drucken.",
colors: [
{ n: "Schwarz", h: "#1a1a1a" }, { n: "Grau", h: "#9ca3af" }, { n: "Weiss", h: "#f0f0f0" },
{ n: "Blau", h: "#2563eb" }, { n: "Dunkelblau", h: "#1e3a8a" }, { n: "Hellblau", h: "#7dd3fc" },
{ n: "Rot", h: "#e02020" }, { n: "Orange", h: "#f97316" }, { n: "Hellorange", h: "#fdba74" },
{ n: "Gelb", h: "#facc15" }, { n: "Braun", h: "#92400e" }, { n: "Grün", h: "#16a34a" },
{ n: "Silber", h: "#c8c8c8" }, { n: "Gold", h: "#d4af37" },
],
},
PETG: { desc: "Stabiler, leicht flexibler Kunststoff mit guter Hitze- und Feuchtigkeitsbeständigkeit. Ideal für funktionale Teile.", colors: [{ n: "Grau", h: "#9ca3af" }] },
TPU: { desc: "Flexibles, gummiartiges Material – ideal für Schutzhüllen, Dichtungen, Griffstücke und alles was Nachgeben soll.", colors: [{ n: "Schwarz", h: "#1a1a1a" }, { n: "Dunkelgrau", h: "#4b5563" }] },
ABS: { desc: "UV- und wetterbeständig – für Aussenanwendungen, Schilder und alles, was Sonne, Regen und Temperaturwechsel standhält.", colors: [{ n: "Schwarz", h: "#1a1a1a" }] },
};

const initialState = {
step: 1, service: null, priceIdx: null, multicolor: false,
name: "", description: "", qty: "", material: "PLA", color: null,
firstName: "", lastName: "", email: "", phone: "", notes: "", agb: false, sent: false,
orderNo: null,
};
let s = { ...initialState };

function esc(str) {
return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ===== Auftragsnummer =====
// Reserviert genau EINE Auftragsnummer pro Anfrage. Bevorzugt serverseitig
// (fortlaufend, eindeutig) über das Apps Script; fällt bei fehlender URL oder
// Netzwerkfehler auf eine provisorische Nummer zurück.
async function reserveOrderNumber() {
if (s.orderNo) return s.orderNo; // pro Anfrage nur einmal vergeben
if (ORDER_NUMBER_ENDPOINT) {
try {
// Einfacher GET-Request (kein Preflight) -> vermeidet CORS-Probleme.
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

// Notlösung ohne Backend: NICHT fortlaufend, pro Gerät/Browser verschieden.
// Das "P" kennzeichnet die Nummer klar als provisorisch.
function provisionalOrderNumber() {
const year = new Date().getFullYear();
const rnd = Math.floor(Math.random() * 900 + 100); // 3-stellig
return `SKV-${year}-P${rnd}`;
}

// ===== AGB-/Datenschutz-Modal =====
// Lädt den echten Inhalt aus agb.html bzw. datenschutz.html in ein schliessbares
// Overlay (X-Button, Klick ausserhalb, ESC). Fällt bei Ladefehler auf das Öffnen
// der jeweiligen Seite in einem neuen Tab zurück.
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
  background: rgba(15,23,42,0.55); backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px); animation: skvFade .18s ease; }
@keyframes skvFade { from { opacity: 0; } to { opacity: 1; } }
.skv-modal { width: min(720px, 100%); max-height: min(84vh, 900px); display: flex;
  flex-direction: column; background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 24px 70px rgba(15,23,42,0.35); }
.skv-modal-head { display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px 20px; border-bottom: 1px solid #e5e9f0;
  background: rgba(255,255,255,0.9); }
.skv-modal-title { font-weight: 800; font-size: 16px; color: ${INK}; letter-spacing: -0.01em; }
.skv-modal-close { flex: none; width: 34px; height: 34px; border: none; cursor: pointer;
  border-radius: 50%; background: #eef1f6; color: ${INK}; font-size: 22px; line-height: 1;
  display: flex; align-items: center; justify-content: center; transition: background .15s; }
.skv-modal-close:hover { background: #dde3ec; }
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
  margin: 4px auto 14px; padding: 10px 22px; border-radius: 14px;
  background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25);
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; }
.order-no-badge strong { font-size: 20px; letter-spacing: 0.02em; text-transform: none;
  color: ${ACCENT}; font-weight: 800; }`;
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
document.body.style.overflow = "hidden"; // Hintergrund nicht scrollen

const bodyEl = overlay.querySelector(".skv-modal-body");
function close() {
overlay.remove();
document.body.style.overflow = "";
document.removeEventListener("keydown", onKey);
}
function onKey(e) { if (e.key === "Escape") close(); }
overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); }); // Klick ausserhalb
overlay.querySelector(".skv-modal-close").addEventListener("click", close);
document.addEventListener("keydown", onKey);
overlay.querySelector(".skv-modal-close").focus();

fetch(meta.url)
.then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
.then((html) => {
const doc = new DOMParser().parseFromString(html, "text/html");
const content = doc.querySelector(".legal-card") || doc.querySelector(".legal-main") || doc.body;
bodyEl.innerHTML = content.innerHTML;
// Interne Links (z. B. auf impressum.html) in neuem Tab öffnen.
bodyEl.querySelectorAll("a[href]").forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
})
.catch(() => {
bodyEl.innerHTML = `<p>Der Inhalt konnte hier nicht geladen werden.</p>
  <p><a href="${meta.url}" target="_blank" rel="noopener">${esc(meta.title)} in neuem Tab öffnen →</a></p>`;
});
}

function priceRangeText() {
if (!s.service || s.priceIdx === null) return "Wähle Service & Komplexität für eine erste Schätzung";
const data = PRICE_DATA[s.service];
const opt = data.options[s.priceIdx];
let min = opt.min, max = opt.max;
if (s.multicolor && data.mc) { min += 3; max += 3; }
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
m += `SERVICE: ${s.service ? SVC_LABEL[s.service] : "-"}\n\n`;
m += `MODELL\n`;
m += `Bezeichnung : ${s.name}\n`;
m += `${data ? data.label : "Komplexität"} : ${opt ? opt.label : "-"}\n`;
m += `Menge : ${s.qty || "1 Stück"}\n`;
m += `Beschreibung:\n${s.description}\n`;
if (s.service !== "design") {
m += `\nMATERIAL & FARBE\n`;
m += `Material : ${s.material}\n`;
m += `Farbe : ${s.color || "-"}\n`;
m += `Mehrfarbig : ${s.multicolor ? "Ja" : "Nein"}\n`;
}
m += `\nGESCHÄTZTE PREISRANGE: ${priceText}\n(Erste Einschätzung – finaler Preis folgt persönlich mit dem Angebot.)\n`;
if (s.notes) m += `\nANMERKUNGEN:\n${s.notes}\n`;
m += `\nKONTAKT\n`;
m += `Name : ${s.firstName} ${s.lastName}\n`;
m += `E-Mail: ${s.email}\n`;
if (s.phone) m += `Tel/WA: ${s.phone}\n`;
m += `\nAGB & Datenschutz akzeptiert: ${s.agb ? "Ja" : "Nein"}\n`;
return m;
}

function validateContact() {
if (!s.firstName.trim() || !s.lastName.trim()) { alert("Bitte Vor- und Nachname angeben."); return false; }
if (!s.email.trim() || !s.email.includes("@")) { alert("Bitte eine gültige E-Mail-Adresse angeben."); return false; }
if (!s.agb) { alert("Bitte akzeptiere die AGB und die Datenschutzerklärung, um deine Anfrage zu senden."); return false; }
return true;
}

async function sendEmail() {
if (!validateContact()) return;
await reserveOrderNumber(); // meist bereits beim Betreten von Schritt 4 vorreserviert
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
const labels = ["Service", "Modell", "Material", "Kontakt"];
return `<div class="progress-row">${labels
.map((l, i) => {
const n = i + 1;
const cls = n === s.step ? "active" : n < s.step ? "done" : "";
return `<div class="progress-step ${cls}"><div class="progress-bar"></div><span class="progress-label">${n} ${l}</span></div>`;
})
.join("")}</div>`;
}

function priceBannerHtml() {
const known = s.service !== null && s.priceIdx !== null;
return `<div class="price-banner">
<div><div class="label">Geschätzter Preis</div><div class="value${known ? " known" : ""}">${priceRangeText()}</div></div>
<div class="tag-icon">🏷️</div>
</div>`;
}

function step1Html() {
return `<div>
<div class="rf-title">Was benötigst du?</div>
<div class="rf-subtitle">Wähle den Service, der zu deinem Projekt passt.</div>
<div class="service-list">
${SERVICES.map(
(svc) => `<div class="service-option${s.service === svc.key ? " selected" : ""}" data-service="${svc.key}">
<div class="emoji">${svc.icon}</div>
<div><div class="title">${esc(svc.title)}</div><div class="desc">${esc(svc.desc)}</div></div>
</div>`
).join("")}
</div>
<div class="nav-row end-only"><button class="glass-btn glass-btn--accent" data-action="step1-next">Weiter →</button></div>
</div>`;
}

function step2Html() {
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
<div class="emoji">${opt.icon}</div>
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
<div class="notice-box"><span style="font-size:20px">📎</span><p>Bitte füge Skizzen, Referenzbilder oder 3D-Dateien <strong>direkt beim Senden</strong> als Anhang hinzu. Formate: Bilder · PDF · STL · OBJ · STEP · 3MF · DXF</p></div>
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="step2-back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="step2-next">Weiter →</button></div>
</div>`;
}

function step3Html() {
const mat = MATERIALS[s.material];
const showMc = PRICE_DATA[s.service].mc;
return `<div>
<div class="rf-title">Material &amp; Farbe</div>
<div class="rf-subtitle">Alle Materialien werden auf meinen Bambu Lab-Druckern verarbeitet.</div>
<div class="rf-field">${label("Material", true)}
<div class="chip-row">${Object.keys(MATERIALS).map((m) => `<div class="mat-chip${s.material === m ? " selected" : ""}" data-material="${m}">${m}</div>`).join("")}</div>
<div class="mat-desc">${esc(mat.desc)}</div>
</div>
<div class="rf-field">${label("Farbe", true)}
<div class="color-row">${mat.colors.map(
(c) => `<div class="color-swatch-wrap${s.color === c.n ? " selected" : ""}" data-color="${esc(c.n)}">
<div class="color-swatch" style="background:${c.h}"></div>
<span>${esc(c.n)}</span>
</div>`
).join("")}</div>
</div>
${showMc ? `<div class="mc-toggle" data-action="toggle-mc">
<div class="mc-track${s.multicolor ? " on" : ""}"><div class="mc-thumb"></div></div>
<div><div class="mc-title">Mehrfarbig / Multicolor (+3 CHF)</div><div class="mc-sub">Zwei oder mehr Farben im selben Druck</div></div>
</div>` : ""}
<div class="nav-row"><button class="glass-btn glass-btn--ghost" data-action="step3-back">← Zurück</button><button class="glass-btn glass-btn--accent" data-action="step3-next">Weiter →</button></div>
</div>`;
}

function step4Html() {
const data = s.service ? PRICE_DATA[s.service] : null;
const opt = data && s.priceIdx !== null ? data.options[s.priceIdx] : null;
const priceText = priceRangeText();
const dim = s.agb ? "" : "opacity:0.45;";
return `<div>
<div class="rf-title">Fast geschafft!</div>
<div class="rf-subtitle">Kontaktdaten ausfüllen, prüfen und Anfrage absenden.</div>
<div class="rf-field tight" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:16px">
<div>${label("Vorname", true)}<input class="rf-input" id="f-firstName" value="${esc(s.firstName)}" placeholder="Max"></div>
<div>${label("Nachname", true)}<input class="rf-input" id="f-lastName" value="${esc(s.lastName)}" placeholder="Muster"></div>
</div>
<div class="rf-field tight">${label("E-Mail", true)}<input class="rf-input" id="f-email" type="email" value="${esc(s.email)}" placeholder="max@example.com"></div>
<div class="rf-field tight">${label("Telefon / WhatsApp")}<input class="rf-input" id="f-phone" value="${esc(s.phone)}" placeholder="+41 79 000 00 00"></div>
<div class="rf-field">${label("Weitere Anmerkungen")}<textarea class="rf-input" id="f-notes" placeholder="Preislimit, Wunschdatum, Sonderwünsche …">${esc(s.notes)}</textarea></div>
<div class="summary-box">
<div class="s-title">Überblick</div>
<div class="sum-row"><span class="k">Service</span><span class="v">${esc(s.service ? SVC_LABEL[s.service] : "-")}</span></div>
<div class="sum-row"><span class="k">Objekt</span><span class="v">${esc(s.name)}</span></div>
<div class="sum-row"><span class="k">${esc(data ? data.label : "Stufe")}</span><span class="v">${esc(opt ? opt.label : "-")}</span></div>
${s.service !== "design" ? `<div class="sum-row"><span class="k">Material</span><span class="v">${esc(s.material)} · ${esc(s.color || "-")}${s.multicolor ? " · mehrfarbig" : ""}</span></div>` : ""}
</div>
<div class="price-final">
<div class="label">Geschätzte Preisrange</div>
<div class="value">${priceText}</div>
<div class="hint">Diese Angabe dient nur zur ersten Einschätzung – der finale Preis folgt persönlich mit dem Angebot.</div>
</div>
<div class="notice-box compact"><span style="font-size:18px">⚠️</span><p>Bitte füge Skizzen, Fotos oder 3D-Dateien <strong>direkt im Mail- oder WhatsApp-Fenster</strong> als Anhang hinzu, bevor du sendest.</p></div>
<label class="agb-check${s.agb ? " on" : ""}" data-action="toggle-agb">
<input type="checkbox" ${s.agb ? "checked" : ""} tabindex="-1" aria-label="AGB und Datenschutzerklärung akzeptieren" style="pointer-events:none">
<span>Ich habe die <a href="agb.html" target="_blank" rel="noopener" data-legal="agb">AGB</a> und die <a href="datenschutz.html" target="_blank" rel="noopener" data-legal="datenschutz">Datenschutzerklärung</a> gelesen und akzeptiere sie. <span class="req">*</span></span>
</label>
<div class="send-grid" style="${dim}">
<button class="glass-btn glass-btn--dark send-btn" data-action="send-email">✉️ Per E-Mail</button>
<button class="glass-btn glass-btn--whatsapp send-btn" data-action="send-whatsapp">💬 WhatsApp</button>
</div>
<div class="send-hint">Ich melde mich so schnell wie möglich mit einem Angebot.</div>
<div class="send-hint">💳 Bezahlung bequem und sicher per Stripe</div>
<div class="nav-row center-only"><button class="glass-btn glass-btn--ghost" data-action="step4-back">← Zurück</button></div>
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
// Anker: Position der Formular-Karte vor dem Neuaufbau merken,
// damit die Seite beim Schritt-Wechsel (Weiter/Zurück) nicht springt.
const prevCard = mount.querySelector(".request-card");
const prevTop = prevCard ? prevCard.getBoundingClientRect().top : null;

let inner;
if (s.sent) {
inner = successHtml();
} else {
inner = progressHtml() + priceBannerHtml();
if (s.step === 1) inner += step1Html();
else if (s.step === 2) inner += step2Html();
else if (s.step === 3) inner += step3Html();
else inner += step4Html();
}
mount.innerHTML = `<div class="request-card">${inner}</div>`;
attachListeners();

// Karte wieder an dieselbe Bildschirmposition setzen -> kein Springen.
if (prevTop !== null) {
const newCard = mount.querySelector(".request-card");
if (newCard) {
const delta = newCard.getBoundingClientRect().top - prevTop;
if (Math.abs(delta) > 1) window.scrollBy(0, delta);
}
}
}

function bindText(id, field) {
const el = mount.querySelector("#" + id);
if (el) el.addEventListener("input", (e) => { s[field] = e.target.value; });
}

function attachListeners() {
mount.querySelectorAll("[data-service]").forEach((el) => {
el.addEventListener("click", () => { s.service = el.dataset.service; s.priceIdx = null; s.multicolor = false; render(); });
});
mount.querySelectorAll("[data-tier]").forEach((el) => {
el.addEventListener("click", () => { s.priceIdx = Number(el.dataset.tier); render(); });
});
mount.querySelectorAll("[data-material]").forEach((el) => {
el.addEventListener("click", () => { s.material = el.dataset.material; s.color = null; render(); });
});
mount.querySelectorAll("[data-color]").forEach((el) => {
el.addEventListener("click", () => { s.color = el.dataset.color; render(); });
});
const mc = mount.querySelector('[data-action="toggle-mc"]');
if (mc) mc.addEventListener("click", () => { s.multicolor = !s.multicolor; render(); });
const agb = mount.querySelector('[data-action="toggle-agb"]');
if (agb) agb.addEventListener("click", (e) => {
// Klick auf einen AGB-/Datenschutz-Link -> Modal öffnen, Checkbox NICHT umschalten.
const link = e.target.closest("a[data-legal]");
if (link) { e.preventDefault(); openLegalModal(link.getAttribute("data-legal")); return; }
// Klick auf den Rest des Labels -> Checkbox umschalten (Bestätigung bleibt Pflicht).
e.preventDefault();
s.agb = !s.agb;
render();
});

const act = (name, fn) => { const el = mount.querySelector(`[data-action="${name}"]`); if (el) el.addEventListener("click", fn); };

act("step1-next", () => { if (s.service !== null) { s.step = 2; render(); } });
act("step2-back", () => { s.step = 1; render(); });
act("step2-next", () => {
if (!(s.name.trim().length > 0 && s.priceIdx !== null && s.description.trim().length > 0)) {
alert("Bitte Bezeichnung, Stufe und Beschreibung ausfüllen.");
return;
}
s.step = s.service === "design" ? 4 : 3;
render();
});
act("step3-back", () => { s.step = 2; render(); });
act("step3-next", () => {
if (!(s.material && s.color)) { alert("Bitte Material und Farbe wählen."); return; }
s.step = 4;
render();
});
act("step4-back", () => { s.step = s.service === "design" ? 2 : 3; render(); });
act("send-email", sendEmail);
act("send-whatsapp", sendWhatsApp);
act("restart", () => { s = { ...initialState }; render(); });

bindText("f-name", "name");
bindText("f-description", "description");
bindText("f-qty", "qty");
bindText("f-firstName", "firstName");
bindText("f-lastName", "lastName");
bindText("f-email", "email");
bindText("f-phone", "phone");
bindText("f-notes", "notes");

// Auftragsnummer schon beim Betreten von Schritt 4 im Hintergrund reservieren,
// damit sie beim Klick auf "Senden" ohne Wartezeit bereitsteht (verhindert auch,
// dass der WhatsApp-Tab durch Popup-Blocker geblockt wird).
if (s.step === 4 && !s.orderNo && !s.sent) { reserveOrderNumber(); }
}

render();
})();
