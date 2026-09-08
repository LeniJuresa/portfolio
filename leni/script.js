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

// Card detail panel (below the hero) — filled from the active card's
// data-title / data-desc placeholder text.
const cardDetailTitle = document.getElementById("cardDetailTitle");
const cardDetailText = document.getElementById("cardDetailText");

function updateCardDetail(item) {
  if (!cardDetailTitle || !cardDetailText || !item) return;
  cardDetailTitle.textContent = item.dataset.title || "";
  cardDetailText.textContent = item.dataset.desc || "";
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
  const scale = Math.min(scaleX, scaleY); // fit entirely inside the viewport, never crop

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
    }, i * 120);
  });
});
