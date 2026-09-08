// AI vv
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

const SPARKLE_COLORS = [
  "255, 223, 130", // classic gold
  "255, 214, 110", // slightly deeper gold
  "255, 235, 170", // pale champagne gold
  "230, 180, 80", // richer, muted amber-gold
  "255, 200, 60", // warm, saturated gold
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
    peakOpacity: 0.9,
    weight: 20,
  },
  {
    name: "medium",
    size: 10,
    blurPct: 0,
    colorStrength: 0.6,
    peakOpacity: 0.6,
    weight: 50,
  },
  {
    name: "large",
    size: 16,
    blurPct: 0.2,
    colorStrength: 0.4,
    peakOpacity: 0.3,
    weight: 15,
  },
  {
    name: "huge",
    size: 24,
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
const NUM_SPARKLES = 200;

for (let i = 0; i < NUM_SPARKLES; i++) {
  const t = rand(0, 1);
  const center = pointOnDiagonal(t);

  const spread = rand(10, 22);
  const x = center.x + (rand(-spread, spread) + rand(-spread, spread)) / 2;
  const y = center.y + (rand(-spread, spread) + rand(-spread, spread)) / 2;

  const el = createSparkle(
    Math.min(Math.max(x, -5), 105),
    Math.min(Math.max(y, 0), 105),
  );
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
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    moveSelector(1);
  } else if (e.key === "ArrowLeft") {
    moveSelector(-1);
  } else if (e.key === "Enter") {
    const activeCard = cards[currentIndex];
    const activeItem = activeCard.closest(".profile-item");
    const destination = activeItem.dataset.href;

    if (destination) {
      window.location.href = destination;
    }
  }
});

updateSelector();
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
    if (i === currentIndex) {
      // already selected — this click means "open it"
      const item = card.closest(".profile-item");
      const destination = item.dataset.href;
      if (destination) {
        window.location.href = destination;
      }
    } else {
      // not selected yet — this click just moves it to center
      currentIndex = i;
      updateSelector();
    }
  });
});
