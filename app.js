// SCK6 — 4 sections side by side (like the aerial photo)
// Each section has row-pairs (two horizontal rows facing a shared aisle)
// Each spot is a vertical rectangle
const SECTIONS = [
  { name: "Zone 1", pairs: [["1A","1B"],["1C","1D"],["1E","1F"],["1G","1H"]], spots: 14 },
  { name: "Zone 2", pairs: [["2A","2B"],["2C","2D"],["2E","2F"],["2G","2H"]], spots: 14 },
  { name: "Zone 3", pairs: [["3A","3B"],["3C","3D"],["3E","3F"],["3G","3H"]], spots: 14 },
  { name: "Zone 4", pairs: [["4A","4B"],["4C","4D"],["4E","4F"],["4G","4H"]], spots: 14 },
];

const KEY = "sck6-car-spot";
const area = document.getElementById("parking-area");
const banner = document.getElementById("saved-banner");
const locEl = document.getElementById("saved-loc");
const timeEl = document.getElementById("saved-time");

function load() {
  const d = localStorage.getItem(KEY);
  return d ? JSON.parse(d) : null;
}

function save(sec, row, spot) {
  const d = { sec, row, spot, t: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(d));
  showBanner(d);
  render();
}

function clear() {
  localStorage.removeItem(KEY);
  banner.style.display = "none";
  render();
}

function find() {
  const el = document.querySelector(".spot.selected");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

function showBanner(d) {
  if (!d) { banner.style.display = "none"; return; }
  banner.style.display = "flex";
  locEl.textContent = `${d.sec} → Row ${d.row} → Spot ${d.spot}`;
  const t = new Date(d.t);
  timeEl.textContent = `Parked ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${t.toLocaleDateString()}`;
}

function makeSpotRow(sec, rowName, dir, saved) {
  const row = document.createElement("div");
  row.className = `spot-row ${dir}`;

  const lbl = document.createElement("div");
  lbl.className = "row-label";
  lbl.textContent = rowName;
  row.appendChild(lbl);

  const spots = document.createElement("div");
  spots.className = "spots";

  for (let i = 1; i <= sec.spots; i++) {
    const sp = document.createElement("div");
    sp.className = "spot";
    sp.title = `${sec.name} – Row ${rowName} – Spot ${i}`;
    if (saved && saved.sec === sec.name && saved.row === rowName && saved.spot === i) {
      sp.classList.add("selected");
    }
    sp.addEventListener("click", () => save(sec.name, rowName, i));
    spots.appendChild(sp);
  }

  row.appendChild(spots);
  return row;
}

function render() {
  area.innerHTML = "";
  const saved = load();

  SECTIONS.forEach((sec, si) => {
    if (si > 0) {
      const lane = document.createElement("div");
      lane.className = "drive-lane-v";
      area.appendChild(lane);
    }

    const sEl = document.createElement("div");
    sEl.className = "section";

    const label = document.createElement("div");
    label.className = "section-label";
    label.textContent = sec.name;
    sEl.appendChild(label);

    sec.pairs.forEach(([topRow, botRow]) => {
      const pair = document.createElement("div");
      pair.className = "row-pair";

      pair.appendChild(makeSpotRow(sec, topRow, "top", saved));

      const aisle = document.createElement("div");
      aisle.className = "aisle-h";
      pair.appendChild(aisle);

      pair.appendChild(makeSpotRow(sec, botRow, "bottom", saved));

      sEl.appendChild(pair);
    });

    area.appendChild(sEl);
  });
}

document.getElementById("clear-btn").addEventListener("click", clear);
document.getElementById("find-btn").addEventListener("click", find);

showBanner(load());
render();
