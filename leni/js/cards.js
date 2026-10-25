function createSelector(track, onSelect) {
  const cards = Array.from(track.querySelectorAll(".profile-card"));
  const defaultIndex = Math.min(1, cards.length - 1);
  let currentIndex = defaultIndex;

  function updateSelector() {
    cards.forEach((card, i) => {
      card.classList.toggle("active", i === currentIndex);
    });

    const activeCard = cards[currentIndex];
    const activeItem = activeCard.closest(".profile-item");

    const offset = -(
      activeItem.offsetLeft +
      activeCard.offsetLeft +
      activeCard.offsetWidth / 2
    );
    track.style.transform = `translateX(${offset}px)`;

    if (onSelect) {
      onSelect(activeItem);
    }
  }

  function moveSelector(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < cards.length) {
      currentIndex = newIndex;
      updateSelector();
      playSound("move");
    }
  }

  function selectItem(item) {
    const index = cards.findIndex(
      (card) => card.closest(".profile-item") === item,
    );
    if (index < 0) return false;

    currentIndex = index;
    updateSelector();
    return true;
  }

  function activateCurrent() {
    const activeCard = cards[currentIndex];
    const activeItem = activeCard.closest(".profile-item");
    const destination = activeItem.dataset.href;
    if (destination) {
      window.location.href = destination;
    }
  }

  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (i === currentIndex) {
        activateCurrent();
        playSound("click");
      } else {
        currentIndex = i;
        updateSelector();
        playSound("move");
      }
    });
  });

  function reset() {
    currentIndex = defaultIndex;
    updateSelector();
  }

  updateSelector();

  return { updateSelector, moveSelector, selectItem, activateCurrent, reset };
}

const cardDetail = document.getElementById("cardDetail");
const cardDetailTitle = document.getElementById("cardDetailTitle");
const cardDetailText = document.getElementById("cardDetailText");
const cardBgLayers = [
  document.getElementById("cardBgLayerA"),
  document.getElementById("cardBgLayerB"),
].filter(Boolean);
let visibleBgLayerIndex = -1;

const BG_INTERVAL = 8000;
let bgTimer = null;

// crossfades to one image using the two background layers
function showBackground(src) {
  if (!cardBgLayers.length) return;

  const nextIndex =
    visibleBgLayerIndex === -1
      ? 0
      : (visibleBgLayerIndex + 1) % cardBgLayers.length;
  const nextLayer = cardBgLayers[nextIndex];
  const currentLayer =
    visibleBgLayerIndex === -1 ? null : cardBgLayers[visibleBgLayerIndex];

  nextLayer.style.setProperty(
    "--card-bg-image",
    src ? `url("${src}")` : "none",
  );
  nextLayer.classList.add("is-visible");
  if (currentLayer) currentLayer.classList.remove("is-visible");

  visibleBgLayerIndex = nextIndex;
}

function updateCardBackground(item) {
  clearInterval(bgTimer); // stop the previous card's rotation

  const list = ((item && item.dataset.bg) || "")
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  showBackground(list[0] || "");
  if (list.length < 2) return; // if one image: nothing to rotate

  list.forEach((src) => {
    new Image().src = src;
  });

  let i = 0;
  bgTimer = setInterval(() => {
    if (document.hidden) return; // pause while the tab is in the background
    i = (i + 1) % list.length;
    showBackground(list[i]);
  }, BG_INTERVAL);
}

function updateCardDetail(item) {
  if (!item) return;

  updateCardBackground(item);

  const widgetsTemplate = item.querySelector(".card-widgets");
  if (widgetsTemplate) {
    if (cardDetail) cardDetail.classList.add("is-hidden");
    if (widgetsPanel) {
      widgetsPanel.innerHTML = widgetsTemplate.innerHTML;
      widgetsPanel.classList.remove("is-hidden");
    }
    return;
  }

  if (widgetsPanel) widgetsPanel.classList.add("is-hidden");
  if (cardDetail) cardDetail.classList.remove("is-hidden");
  if (!cardDetailTitle || !cardDetailText) return;
  cardDetailTitle.textContent = item.dataset.title || "";

  const descTemplate = item.querySelector(".profile-desc");
  if (descTemplate) {
    cardDetailText.innerHTML = descTemplate.innerHTML;
  } else {
    cardDetailText.textContent = item.dataset.desc || "";
  }
}

widgetsPanel.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-scroll]");
  if (!btn) return;
  const el = widgetsPanel.querySelector(btn.dataset.scroll);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
});

const selectors = {
  projects: createSelector(
    document.getElementById("profileTrack-projects"),
    updateCardDetail,
  ),
  media: createSelector(
    document.getElementById("profileTrack-media"),
    updateCardDetail,
  ),
};

// now top-level, so popups.js can call it safely
function navigateToWidgetTarget(target) {
  const item = Array.from(
    document.querySelectorAll("#profileTrack-projects .profile-item"),
  ).find(
    (candidate) =>
      candidate.dataset.title === target ||
      candidate.dataset.project === target,
  );

  if (!item || !selectors.projects.selectItem(item)) {
    console.error(`Could not find project card for widget target "${target}".`);
  }
}

if (widgetsPanel) {
  widgetsPanel.addEventListener("click", (e) => {
    const target = e.target.closest("[data-nav-target]");
    if (!target || !widgetsPanel.contains(target)) return;
    playSound("move");
    navigateToWidgetTarget(target.dataset.navTarget);
  });

  onActivate(
    ".widget-tile[data-nav-target]",
    (tile) => navigateToWidgetTarget(tile.dataset.navTarget),
    widgetsPanel,
  );
}

let activeView = "projects";

selectors[activeView].updateSelector();

document.addEventListener("keydown", (e) => {
  if (
    e.target.closest(".widget-tile, .widget-popup, .gallery-item, .image-popup")
  )
    return;

  const controller = selectors[activeView];
  if (e.key === "ArrowRight") {
    controller.moveSelector(1);
  } else if (e.key === "ArrowLeft") {
    controller.moveSelector(-1);
  } else if (e.key === "Enter") {
    controller.activateCurrent();
  }
});
