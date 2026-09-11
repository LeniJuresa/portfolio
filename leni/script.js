
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

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
    }
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
      } else {
        currentIndex = i;
        updateSelector();
      }
    });
  });

  function reset() {
    currentIndex = defaultIndex;
    updateSelector();
  }

  updateSelector();

  return { updateSelector, moveSelector, activateCurrent, reset };
}

const cardDetail = document.getElementById("cardDetail");
const cardDetailTitle = document.getElementById("cardDetailTitle");
const cardDetailText = document.getElementById("cardDetailText");
const widgetsPanel = document.getElementById("widgetsPanel");
const cardBgLayers = [
  document.getElementById("cardBgLayerA"),
  document.getElementById("cardBgLayerB"),
].filter(Boolean);
let visibleBgLayerIndex = -1; // -1 = neither painted yet

function updateCardBackground(item) {
  if (!cardBgLayers.length) return;
  const src = item && item.dataset.bg;

  const nextIndex =
    visibleBgLayerIndex === -1 ? 0 : (visibleBgLayerIndex + 1) % cardBgLayers.length;
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

let activeView = "projects";

selectors[activeView].updateSelector();

document.addEventListener("keydown", (e) => {
  // don't hijack arrow/enter presses meant for a focused widget tile or popup
  if (e.target.closest(".widget-tile, .widget-popup")) return;

  const controller = selectors[activeView];
  if (e.key === "ArrowRight") {
    controller.moveSelector(1);
  } else if (e.key === "ArrowLeft") {
    controller.moveSelector(-1);
  } else if (e.key === "Enter") {
    controller.activateCurrent();
  }
});

// Nav bar — Projects / Media tabs
const navTabs = Array.from(document.querySelectorAll(".nav-tab"));
const views = Array.from(document.querySelectorAll(".view"));

navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.view;
    if (target === activeView) return;

    navTabs.forEach((t) => t.classList.toggle("active", t === tab));
    views.forEach((v) =>
      v.classList.toggle("active-view", v.dataset.view === target),
    );

    activeView = target;

    selectors[activeView].reset();
  });
});

// Profile switcher dropdown
const profileNavButton = document.getElementById("profileNavButton");
const profileMenu = document.getElementById("profileMenu");

if (profileNavButton && profileMenu) {
  const setMenuOpen = (open) => {
    profileMenu.classList.toggle("open", open);
    profileNavButton.setAttribute("aria-expanded", String(open));
  };

  profileNavButton.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!profileMenu.classList.contains("open"));
  });

  // click anywhere outside the menu closes it
  document.addEventListener("click", (e) => {
    if (!profileMenu.classList.contains("open")) return;
    if (!profileMenu.contains(e.target) && e.target !== profileNavButton) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

function fitScene() {
  const wrapper = document.querySelector(".scene-wrapper");
  const scaleX = window.innerWidth / 1920;

  const scaleY = window.innerHeight / 1080;
  const scale = Math.min(scaleX, scaleY);

  wrapper.style.transform = `translate(-50%, 0) scale(${scale})`;
}

fitScene();
window.addEventListener("resize", fitScene);

// AI ^^

window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".ease-in");

  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("appear");
    }, i * 120);
  });
});

// ==========================================================

const widgetPopupContent = {
  welcome: {
    title: "Welcome to my portfolio! ",
    body: `
      <p>You've probably noticed by now, making this site i used inspiration from the PlayStation 5 UI. Browse it the same way: arrow keys work for switching between profiles just as well as your mouse, and everything clickable actually does something.</p>

      <p>There are a few different profiles built for different people. They all cover my projects, but some go further into my personal or professional side, like hobbies and other things outside of work. Worth switching between them to see what's different.</p>

      <p>A few things on this page do more than they let on. I won't say what... finding them is half the fun. ;)</p>

      <p>I built this over a summer as a way to show off my projects without falling back on another plain list of links and screenshots. Hope you enjoy poking around.  </p>


    `,
  },
  fact: {
    title: "fact ",
    body: `hello

    `,
  },
  trophies: {
    title: "Trophies",
    body: `
      <ul>
        <li><strong>Platinum</strong> — built a Java app in real, everyday use by my church community.</li>
        <li><strong>Gold</strong> — 2nd place, [hackathon name].</li>
        <li><strong>Silver</strong> — [certification / course].</li>
        <li><strong>Bronze</strong> — first finished solo project.</li>
      </ul>
    `,
  },
  storage: {
    title: "Storage",
    body: `
      <p>What's actually taking up space — the languages and tools I use most, roughly ordered by how much I reach for them.</p>
      <ul>
        <li>Java — most real-world project experience</li>
        <li>Python</li>
        <li>HTML / CSS / JavaScript</li>
        <li>[other tools]</li>
      </ul>
    `,
  },
  messages: {
    title: "Messages",
    body: `
      <p>"Placeholder feedback quote — from a professor, classmate, or someone who actually uses one of my projects."</p>
      <p>— [name, role]</p>
    `,
  },
  activity: {
    title: "Latest activity",
    body: `
      <p>Connected github to this widget. Shows my github map aswell as my last updated repo.</p>
    `,
  },
};

const widgetPopupOverlay = document.getElementById("widgetPopupOverlay");
const widgetPopupTitle = document.getElementById("widgetPopupTitle");
const widgetPopupBody = document.getElementById("widgetPopupBody");
const widgetPopupClose = document.getElementById("widgetPopupClose");

if (widgetPopupOverlay && widgetPopupTitle && widgetPopupBody) {
  let lastFocusedTile = null;

  function openWidgetPopup(key, triggerEl) {
    const content = widgetPopupContent[key];
    if (!content) return;

    widgetPopupTitle.textContent = content.title;
    widgetPopupBody.innerHTML = content.body;
    widgetPopupOverlay.classList.add("open");
    lastFocusedTile = triggerEl || null;
    widgetPopupClose.focus();
  }

  function closeWidgetPopup() {
    widgetPopupOverlay.classList.remove("open");
    if (lastFocusedTile) lastFocusedTile.focus();
  }


  document.addEventListener("click", (e) => {
    const tile = e.target.closest(".widget-tile[data-popup]");
    if (tile) openWidgetPopup(tile.dataset.popup, tile);
  });

  document.addEventListener("keydown", (e) => {
    const tile = e.target.closest(".widget-tile[data-popup]");
    if (tile && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openWidgetPopup(tile.dataset.popup, tile);
    }
  });

  widgetPopupClose.addEventListener("click", closeWidgetPopup);

  // click on the dark backdrop (not the card itself) closes it
  widgetPopupOverlay.addEventListener("click", (e) => {
    if (e.target === widgetPopupOverlay) closeWidgetPopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widgetPopupOverlay.classList.contains("open")) {
      closeWidgetPopup();
    }
  });
}
