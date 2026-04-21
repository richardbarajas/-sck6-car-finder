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

// Landscape / Portrait toggle
const toggleBtn = document.getElementById("view-toggle");
let isPortrait = window.innerWidth <= 700;

// Apply initial state
if (isPortrait) {
  document.getElementById("parking-area").classList.add("portrait");
  toggleBtn.textContent = "🖥️ Landscape View";
}

toggleBtn.addEventListener("click", () => {
  isPortrait = !isPortrait;
  const pa = document.getElementById("parking-area");
  pa.classList.toggle("portrait", isPortrait);
  toggleBtn.textContent = isPortrait ? "🖥️ Landscape View" : "📱 Portrait View";
});

showBanner(load());
render();

// ── Little cars driving around the lot ──
const CARS = ['🚗', '🚙', '🛻', '🚕', '🏎️'];

function spawnCar() {
  const parkingArea = document.getElementById("parking-area");
  if (!parkingArea) return;

  const w = parkingArea.offsetWidth;
  const h = parkingArea.offsetHeight;
  if (!w || !h) return;

  const car = document.createElement("div");
  car.className = "driving-car";
  car.textContent = CARS[Math.floor(Math.random() * CARS.length)];
  parkingArea.appendChild(car);

  const horizontal = Math.random() > 0.5;
  const duration = 5000 + Math.random() * 4000;

  if (horizontal) {
    const goRight = Math.random() > 0.5;
    const y = Math.floor(Math.random() * (h - 16));
    car.style.top = y + "px";
    car.style.left = "0px";
    const startX = goRight ? -30 : w + 30;
    const endX = goRight ? w + 30 : -30;
    car.style.transform = `translateX(${startX}px)` + (goRight ? '' : ' scaleX(-1)');

    const anim = car.animate([
      { transform: `translateX(${startX}px)${goRight ? '' : ' scaleX(-1)'}` },
      { transform: `translateX(${endX}px)${goRight ? '' : ' scaleX(-1)'}` }
    ], { duration, easing: "linear", fill: "forwards" });

    anim.onfinish = () => car.remove();
  } else {
    const goDown = Math.random() > 0.5;
    const x = Math.floor(Math.random() * (w - 16));
    car.style.left = x + "px";
    car.style.top = "0px";
    const startY = goDown ? -30 : h + 30;
    const endY = goDown ? h + 30 : -30;

    const anim = car.animate([
      { transform: `translateY(${startY}px)` },
      { transform: `translateY(${endY}px)` }
    ], { duration, easing: "linear", fill: "forwards" });

    anim.onfinish = () => car.remove();
  }
}

function carLoop() {
  spawnCar();
  setTimeout(carLoop, 1500 + Math.random() * 1500);
}
carLoop();

// ── GPS Integration ──
const GPS_KEY = "sck6-gps-pin";
const gpsBtn = document.getElementById("gps-btn");
const gpsBanner = document.getElementById("gps-banner");
const gpsLoc = document.getElementById("gps-loc");
const gpsTime = document.getElementById("gps-time");
const navBtn = document.getElementById("nav-btn");
const gpsClearBtn = document.getElementById("gps-clear-btn");

function loadGps() {
  const d = localStorage.getItem(GPS_KEY);
  return d ? JSON.parse(d) : null;
}

function showGpsBanner(d) {
  if (!d) { gpsBanner.style.display = "none"; gpsBtn.classList.remove("active"); return; }
  gpsBanner.style.display = "flex";
  gpsBtn.classList.add("active");
  gpsBtn.textContent = "📍 Pin Saved!";
  gpsLoc.textContent = `${d.lat.toFixed(6)}, ${d.lng.toFixed(6)}`;
  const t = new Date(d.t);
  gpsTime.textContent = `Pinned ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${t.toLocaleDateString()}`;
}

gpsBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("GPS not supported on this browser.");
    return;
  }
  gpsBtn.textContent = "📡 Getting location...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const d = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: new Date().toISOString() };
      localStorage.setItem(GPS_KEY, JSON.stringify(d));
      showGpsBanner(d);
    },
    (err) => {
      alert("Couldn't get your location. Make sure GPS/location is enabled.");
      gpsBtn.textContent = "📍 Drop GPS Pin";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

navBtn.addEventListener("click", () => {
  const d = loadGps();
  if (!d) return;
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&travelmode=walking`, "_blank");
});

gpsClearBtn.addEventListener("click", () => {
  localStorage.removeItem(GPS_KEY);
  gpsBanner.style.display = "none";
  gpsBtn.classList.remove("active");
  gpsBtn.textContent = "📍 Drop GPS Pin";
});

// Show saved GPS on load
showGpsBanner(loadGps());
