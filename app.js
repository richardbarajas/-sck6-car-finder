// SCK6 lot layout matching the Google Maps view
// 3 main sections, entrance lanes between section 1/2 and 2/3
// Each section has row groups separated by horizontal aisles
// Each row group has paired columns of spots with a vertical aisle

const SECTIONS = [
  {
    name: "Zone 1",
    groups: [
      [["1A","1B"],["1C","1D"],["1E","1F"]],
      [["1G","1H"],["1I","1J"],["1K","1L"]],
    ],
    spots: 16
  },
  {
    name: "Zone 2",
    groups: [
      [["2A","2B"],["2C","2D"],["2E","2F"],["2G","2H"]],
      [["2I","2J"],["2K","2L"],["2M","2N"],["2O","2P"]],
    ],
    spots: 16
  },
  {
    name: "Zone 3",
    groups: [
      [["3A","3B"],["3C","3D"],["3E","3F"],["3G","3H"]],
      [["3I","3J"],["3K","3L"],["3M","3N"],["3O","3P"]],
    ],
    spots: 16
  },
];

// Lane types between sections: "entrance" or "drive"
const LANES = ["entrance", "entrance"];

const KEY = "sck6-car-spot";
const lot = document.getElementById("parking-lot");
const banner = document.getElementById("saved-banner");
const locEl = document.getElementById("saved-loc");
const timeEl = document.getElementById("saved-time");

function load() { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : null; }

function save(sec, row, spot) {
  const d = { sec, row, spot, t: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(d));
  showBanner(d);
  render();
}

function clear() { localStorage.removeItem(KEY); banner.style.display = "none"; render(); }

function find() {
  const el = document.querySelector(".spot.selected");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

function showBanner(d) {
  if (!d) { banner.style.display = "none"; return; }
  banner.style.display = "flex";
  locEl.textContent = `${d.sec} → Row ${d.row} → Spot ${d.spot}`;
  const t = new Date(d.t);
  timeEl.textContent = `Parked ${t.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} · ${t.toLocaleDateString()}`;
}

function makeSpotCol(sec, rowName, dir, saved) {
  const col = document.createElement("div");
  col.className = `spot-col ${dir}`;

  const lbl = document.createElement("div");
  lbl.className = "col-label";
  lbl.textContent = rowName;
  col.appendChild(lbl);

  for (let i = 1; i <= sec.spots; i++) {
    const sp = document.createElement("div");
    sp.className = "spot";
    sp.title = `${sec.name} – Row ${rowName} – Spot ${i}`;
    if (saved && saved.sec === sec.name && saved.row === rowName && saved.spot === i) {
      sp.classList.add("selected");
    }
    sp.addEventListener("click", () => save(sec.name, rowName, i));
    col.appendChild(sp);
  }
  return col;
}

function render() {
  lot.innerHTML = "";
  const saved = load();

  const sectionsRow = document.createElement("div");
  sectionsRow.className = "lot-sections";

  SECTIONS.forEach((sec, si) => {
    // Add lane between sections
    if (si > 0) {
      const lane = document.createElement("div");
      lane.className = LANES[si - 1] === "entrance" ? "entrance-lane" : "drive-lane";
      if (LANES[si - 1] === "entrance") {
        const lbl = document.createElement("div");
        lbl.className = "lane-label";
        lbl.textContent = "▼ IN";
        lane.appendChild(lbl);
      }
      sectionsRow.appendChild(lane);
    }

    const secEl = document.createElement("div");
    secEl.className = "lot-section";

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = sec.name;
    secEl.appendChild(title);

    sec.groups.forEach((group, gi) => {
      if (gi > 0) {
        const aisle = document.createElement("div");
        aisle.className = "h-aisle";
        secEl.appendChild(aisle);
      }

      // Split row pairs into two halves with a mid-road
      const half = Math.ceil(group.length / 2);
      const firstHalf = group.slice(0, half);
      const secondHalf = group.slice(half);

      const groupRow = document.createElement("div");
      groupRow.style.display = "flex";
      groupRow.style.flexDirection = "row";

      // First half of pairs
      const leftBlock = document.createElement("div");
      leftBlock.style.flex = "1";
      firstHalf.forEach(([leftRow, rightRow]) => {
        const pair = document.createElement("div");
        pair.className = "row-pair";
        pair.appendChild(makeSpotCol(sec, leftRow, "left", saved));
        const va = document.createElement("div");
        va.className = "v-aisle";
        pair.appendChild(va);
        pair.appendChild(makeSpotCol(sec, rightRow, "right", saved));
        leftBlock.appendChild(pair);
      });
      groupRow.appendChild(leftBlock);

      // Mid road
      const midRoad = document.createElement("div");
      midRoad.className = "mid-road";
      groupRow.appendChild(midRoad);

      // Second half of pairs
      const rightBlock = document.createElement("div");
      rightBlock.style.flex = "1";
      secondHalf.forEach(([leftRow, rightRow]) => {
        const pair = document.createElement("div");
        pair.className = "row-pair";
        pair.appendChild(makeSpotCol(sec, leftRow, "left", saved));
        const va = document.createElement("div");
        va.className = "v-aisle";
        pair.appendChild(va);
        pair.appendChild(makeSpotCol(sec, rightRow, "right", saved));
        rightBlock.appendChild(pair);
      });
      groupRow.appendChild(rightBlock);

      secEl.appendChild(groupRow);
    });

    sectionsRow.appendChild(secEl);
  });

  lot.appendChild(sectionsRow);
}

// Event listeners
document.getElementById("clear-btn").addEventListener("click", clear);
document.getElementById("find-btn").addEventListener("click", find);

// Portrait toggle
const toggleBtn = document.getElementById("view-toggle");
let isPortrait = window.innerWidth <= 700;

if (isPortrait) {
  lot.classList.add("portrait");
  toggleBtn.textContent = "🖥️ Landscape View";
}

toggleBtn.addEventListener("click", () => {
  isPortrait = !isPortrait;
  lot.classList.toggle("portrait", isPortrait);
  toggleBtn.textContent = isPortrait ? "🖥️ Landscape View" : "📱 Portrait View";
});

// Init
showBanner(load());
render();

// ── GPS ──
const GPS_KEY = "sck6-gps-pin";
const gpsBtn = document.getElementById("gps-btn");
const gpsBanner = document.getElementById("gps-banner");
const gpsLoc = document.getElementById("gps-loc");
const gpsTime = document.getElementById("gps-time");
const navBtn = document.getElementById("nav-btn");
const gpsClearBtn = document.getElementById("gps-clear-btn");

function loadGps() { const d = localStorage.getItem(GPS_KEY); return d ? JSON.parse(d) : null; }

function showGpsBanner(d) {
  if (!d) { gpsBanner.style.display = "none"; gpsBtn.classList.remove("active"); return; }
  gpsBanner.style.display = "flex";
  gpsBtn.classList.add("active");
  gpsBtn.textContent = "📍 Pin Saved!";
  gpsLoc.textContent = `${d.lat.toFixed(6)}, ${d.lng.toFixed(6)}`;
  const t = new Date(d.t);
  gpsTime.textContent = `Pinned ${t.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} · ${t.toLocaleDateString()}`;
}

gpsBtn.addEventListener("click", () => {
  if (!navigator.geolocation) { alert("GPS not supported."); return; }
  gpsBtn.textContent = "📡 Getting location...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const d = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: new Date().toISOString() };
      localStorage.setItem(GPS_KEY, JSON.stringify(d));
      showGpsBanner(d);
    },
    () => { alert("Couldn't get location. Enable GPS."); gpsBtn.textContent = "📍 Drop GPS Pin"; },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

navBtn.addEventListener("click", () => {
  const d = loadGps();
  if (d) window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&travelmode=walking`, "_blank");
});

gpsClearBtn.addEventListener("click", () => {
  localStorage.removeItem(GPS_KEY);
  gpsBanner.style.display = "none";
  gpsBtn.classList.remove("active");
  gpsBtn.textContent = "📍 Drop GPS Pin";
});

showGpsBanner(loadGps());

// ── Floating particles ──
for (let i = 0; i < 15; i++) {
  const p = document.createElement("div");
  p.className = "particle";
  p.style.left = Math.random() * 100 + "vw";
  p.style.animationDuration = (6 + Math.random() * 10) + "s";
  p.style.animationDelay = (Math.random() * 10) + "s";
  p.style.opacity = 0.2 + Math.random() * 0.4;
  document.body.appendChild(p);
}

// ── Driving cars ──
const CARS = ['🚗','🚙','🛻','🚕','🏎️'];
function spawnCar() {
  const pa = document.querySelector(".lot-sections");
  if (!pa) return;
  const w = pa.offsetWidth, h = pa.offsetHeight;
  if (!w || !h) return;
  const car = document.createElement("div");
  car.className = "driving-car";
  car.textContent = CARS[Math.floor(Math.random() * CARS.length)];
  pa.style.position = "relative";
  pa.appendChild(car);
  const horiz = Math.random() > 0.5;
  const dur = 5000 + Math.random() * 4000;
  if (horiz) {
    const goR = Math.random() > 0.5;
    car.style.top = Math.floor(Math.random() * h) + "px";
    car.style.left = "0px";
    const s = goR ? -20 : w + 20, e = goR ? w + 20 : -20;
    const a = car.animate([{transform:`translateX(${s}px)`},{transform:`translateX(${e}px)`}],{duration:dur,easing:"linear",fill:"forwards"});
    a.onfinish = () => car.remove();
  } else {
    car.style.left = Math.floor(Math.random() * w) + "px";
    car.style.top = "0px";
    const goD = Math.random() > 0.5;
    const s = goD ? -20 : h + 20, e = goD ? h + 20 : -20;
    const a = car.animate([{transform:`translateY(${s}px)`},{transform:`translateY(${e}px)`}],{duration:dur,easing:"linear",fill:"forwards"});
    a.onfinish = () => car.remove();
  }
}
function carLoop() { spawnCar(); setTimeout(carLoop, 2000 + Math.random() * 2000); }
carLoop();
