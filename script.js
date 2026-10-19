// AI vv
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

const SPARKLE_COLORS = [
  "255, 223, 130", // classic gold[cite: 2]
  "255, 214, 110", // slightly deeper gold[cite: 2]
  "255, 235, 170", // pale champagne gold[cite: 2]
  "230, 180, 80", // richer, muted amber-gold[cite: 2]
  "255, 200, 60", // warm, saturated gold[cite: 2]
  "140, 85, 45", // warm brown
  "255, 250, 230", // soft cream
];

const SPARKLE_PRESETS = [
  {
    name: "small",
    size: 3,
    blurPct: 0,
    colorStrength: 1.0,
    peakOpacity: 1.0,
    weight: 10,
  },
  {
    name: "smallish",
    size: 6,
    blurPct: 0,
    colorStrength: 0.8,
    peakOpacity: 1.0,
    weight: 50,
  },
  {
    name: "medium",
    size: 12,
    blurPct: 0,
    colorStrength: 0.6,
    peakOpacity: 0.9,
    weight: 20,
  },
  {
    name: "large",
    size: 24,
    blurPct: 0.2,
    colorStrength: 0.4,
    peakOpacity: 0.3,
    weight: 15,
  },
  {
    name: "huge",
    size: 28,
    blurPct: 0.8,
    colorStrength: 0.1,
    peakOpacity: 0.2,
    weight: 5,
  },
];

function pickPreset() {
  const roll = rand(0, 100);
  let cumulative = 0;
  for (const preset of SPARKLE_PRESETS) {
    cumulative += preset.weight;
    if (roll <= cumulative) return preset;
  }
  return SPARKLE_PRESETS[SPARKLE_PRESETS.length - 1];
}

function createSparkle(x, y) {
  const el = document.createElement("div");
  el.className = "sparkle";

  const preset = pickPreset();
  const size = preset.size * rand(0.85, 1.15);
  const blur = size * preset.blurPct;

  const rgb = SPARKLE_COLORS[Math.floor(rand(0, SPARKLE_COLORS.length))];

  el.style.left = x + "%";
  el.style.top = y + "%";
  el.style.width = size + "px";
  el.style.height = size + "px";
  el.style.setProperty(
    "--fill-color",
    `rgba(${rgb}, ${preset.colorStrength.toFixed(2)})`,
  );
  el.style.setProperty("--peak", preset.peakOpacity.toFixed(2));
  el.style.setProperty("--blur", blur.toFixed(1) + "px");
  el.style.setProperty("--dx", rand(-10, 10).toFixed(1) + "px");
  el.style.setProperty("--dy", rand(-10, 10).toFixed(1) + "px");

  el.style.animationDuration = `${rand(3, 7).toFixed(2)}s, ${rand(6, 12).toFixed(2)}s`;
  el.style.animationDelay = `${rand(0, 6).toFixed(2)}s, ${rand(0, 8).toFixed(2)}s`;

  return el;
}

const CURVE_START = { x: -5, y: 100 };
const CURVE_CONTROL_1 = { x: 60, y: 85 };
const CURVE_CONTROL_2 = { x: 20, y: 30 };
const CURVE_END = { x: 100, y: 70 };

function pointOnDiagonal(t) {
  const mt = 1 - t;
  const x =
    mt ** 3 * CURVE_START.x +
    3 * mt ** 2 * t * CURVE_CONTROL_1.x +
    3 * mt * t ** 2 * CURVE_CONTROL_2.x +
    t ** 3 * CURVE_END.x;

  const y =
    mt ** 3 * CURVE_START.y +
    3 * mt ** 2 * t * CURVE_CONTROL_1.y +
    3 * mt * t ** 2 * CURVE_CONTROL_2.y +
    t ** 3 * CURVE_END.y;

  return { x, y };
}

const field = document.getElementById("sparkleField");
const NUM_SPARKLES = 300;
const NUM_SCATTERED = 25; // random sparkles placed anywhere on the screen

for (let i = 0; i < NUM_SPARKLES + NUM_SCATTERED; i++) {
  let x, y;

  if (i < NUM_SPARKLES) {
    // original behaviour: follow the curve
    const t = rand(0, 1);
    const center = pointOnDiagonal(t);
    const spread = rand(10, 22);
    x = center.x + (rand(-spread, spread) + rand(-spread, spread)) / 2;
    y = center.y + (rand(-spread, spread) + rand(-spread, spread)) / 2;
  } else {
    // scattered: anywhere on the screen
    x = rand(0, 100);
    y = rand(0, 100);
  }

  const el = createSparkle(
    Math.min(Math.max(x, -5), 105),
    Math.min(Math.max(y, 0), 105),
  );

  if (i >= NUM_SPARKLES) el.style.setProperty("--peak", "0.4"); // scattered ones are dimmer
  field.appendChild(el);
}

const wrap = document.querySelector(".button-wrap");

if (wrap) {
  const button = document.querySelector(".button-start");
  const rings = wrap.querySelectorAll(".ring:not(.button-start)");

  wrap.addEventListener("mouseleave", () => {
    [button, ...rings].forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  });
}
window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".start-info-large").classList.add("appear");
  }, 200);

  setTimeout(() => {
    document.querySelector(".start-info-text").classList.add("appear");
  }, 700);
});

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  document.getElementById("clock").textContent = `${hours}:${minutes} ${ampm}`;
}

updateClock();
setInterval(updateClock, 1000);

// ---------- zvukovi ----------
const SOUNDS = {
  move: new Audio("../assets/sounds/move.mp3"),
  click: new Audio("../assets/sounds/click.mp3"),
  trophy: new Audio("../assets/sounds/Trophy.mp3"),
};
SOUNDS.move.volume = 0.4;
SOUNDS.click.volume = 0.5;
SOUNDS.trophy.volume = 0.5;

Object.values(SOUNDS).forEach((a) => (a.preload = "auto"));

let soundOn = true;

function playSound(name) {
  if (!soundOn) return;
  const base = SOUNDS[name];
  if (!base) return;
  const s = base.cloneNode();
  s.volume = base.volume;
  s.play().catch(() => {});
}

const track = document.getElementById("profileTrack");
cards = Array.from(track.querySelectorAll(".profile-card"));

const CARD_WIDTH = 240;
const GAP = 40;
const STEP = CARD_WIDTH + GAP;

let currentIndex = 1;

function updateSelector() {
  const offset = -currentIndex * STEP - CARD_WIDTH / 2;
  track.style.transform = `translateX(${offset}px)`;

  cards.forEach((card, i) => {
    card.classList.toggle("active", i === currentIndex);
  });
}

function moveSelector(direction) {
  const newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < cards.length) {
    currentIndex = newIndex;
    updateSelector();
    playSound("move");
  }
}

let isNavigating = false;

function selectProfile(item, card) {
  if (isNavigating) return;

  if (item.dataset.achievement) {
    showAchievement(item.dataset.achievement);
    return;
  }

  const destination = item.dataset.href;
  if (!destination) return;

  isNavigating = true;
  playSound("click");

  const scene = document.querySelector(".scene-wrapper");
  const overlay = document.getElementById("transitionOverlay");
  const name = item.querySelector(".profile-name");

  // Mark this profile as the selected one
  item.classList.add("selected");
  scene.classList.add("selection-active");

  // Phase 1: Card and Name grow in easeOutExpo; everything else shrinks in easeInExpo
  card.classList.add("grow-expo");
  if (name) name.classList.add("grow-expo");

  // Phase 2: After growth (450ms), both shrink down in easeInExpo
  setTimeout(() => {
    card.classList.remove("grow-expo");
    card.classList.add("shrink-expo");

    if (name) {
      name.classList.remove("grow-expo");
      name.classList.add("shrink-expo");
    }

    // Black screen fades in over the entire display
    setTimeout(() => {
      if (overlay) overlay.classList.add("show");
    }, 150);
  }, 450);

  // Navigate after transition completes
  setTimeout(() => {
    window.location.href = destination;
  }, 1000);
}

// Reset when using browser Back/Forward navigation
window.addEventListener("pageshow", () => {
  isNavigating = false;

  const overlay = document.getElementById("transitionOverlay");
  if (overlay) overlay.classList.remove("show");

  const scene = document.querySelector(".scene-wrapper");
  if (scene) scene.classList.remove("selection-active");

  document.querySelectorAll(".profile-item").forEach((item) => {
    item.classList.remove("selected");
    const card = item.querySelector(".profile-card");
    const name = item.querySelector(".profile-name");
    if (card) card.classList.remove("grow-expo", "shrink-expo");
    if (name) name.classList.remove("grow-expo", "shrink-expo");
  });
});

document.addEventListener("keydown", (e) => {
  if (isNavigating) return;

  if (e.key === "ArrowRight") {
    moveSelector(1);
  } else if (e.key === "ArrowLeft") {
    moveSelector(-1);
  } else if (e.key === "Enter") {
    const activeCard = cards[currentIndex];
    const activeItem = activeCard.closest(".profile-item");
    selectProfile(activeItem, activeCard);
  }
});

updateSelector();
const TROPHY_SVG = `
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M7 3h10v5a5 5 0 0 1-10 0V3z"/>
  <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"
        fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M11 13h2v4h-2z"/>
  <path d="M8 21v-2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V21z"/>
</svg>`;

// tier colors: bronze #cd7f32, silver #c0c4cc, gold #f2b632, platinum #7fd3ff
const ACHIEVEMENTS = {
  "add-user": {
    title: '"i will add this later" - Leni',
    color: "#cd7f32",
  },
};

const earnedAchievements = new Set(); // in memory only, so a page reload resets it
let toastActive = false;

function showAchievement(id) {
  const data = ACHIEVEMENTS[id];
  if (!data || toastActive || earnedAchievements.has(id)) return;
  earnedAchievements.add(id);
  toastActive = true;

  playSound("trophy");

  const toast = document.createElement("div");
  toast.className = "trophy-toast";
  toast.setAttribute("role", "status");
  toast.style.setProperty("--tier", data.color);
  toast.innerHTML = `
    <div class="trophy-art">${TROPHY_SVG}</div>
    <div class="trophy-text">
      <div class="trophy-title">${TROPHY_SVG}<span>${data.title}</span></div>
      <div class="trophy-sub">Trophy earned!</div>
    </div>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add("show")),
  );

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
      toastActive = false;
    }, 700);
  }, 4500);
}

function fitScene() {
  const wrapper = document.querySelector(".scene-wrapper");
  const scaleX = window.innerWidth / 1920;
  const scaleY = window.innerHeight / 1080;
  const scale = Math.max(scaleX, scaleY); // was Math.min — this is the key change

  wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

fitScene();
window.addEventListener("resize", fitScene);

// AI ^^

window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".ease-in");

  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("appear");
    }, i * 120); // each one starts 120ms after the previous
  });
});

cards.forEach((card, i) => {
  card.addEventListener("click", () => {
    if (isNavigating) return;
    const item = card.closest(".profile-item");

    if (i === currentIndex) {
      selectProfile(item, card);
    } else {
      currentIndex = i;
      updateSelector();
      playSound("move");
    }
  });
});
