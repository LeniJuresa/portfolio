// ---------- shared keyboard helpers ----------

// Every closable layer registers here. z matches the CSS z-index,
// so Escape always closes the topmost open layer first.
const escapeLayers = [];
function registerEscape(z, isOpen, close) {
  escapeLayers.push({ z, isOpen, close });
}

document.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Escape") return;
    const top = escapeLayers
      .filter((layer) => layer.isOpen())
      .sort((a, b) => b.z - a.z)[0];
    if (!top) return;
    e.preventDefault();
    top.close();
  },
  true, // capture, so the store's stopPropagation() can't block it
);

function onActivate(selector, handler, root = document) {
  root.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target.closest(selector);
      if (!el) return;
      e.preventDefault();
      handler(el, e);
    },
    true,
  );
}

// ---------- block ctrl+scroll zoom ----------
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

// ---------- clock ----------
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

// ---------- shared elements ----------
const widgetsPanel = document.getElementById("widgetsPanel");

// ---------- scene scaling ----------
function fitScene() {
  const wrapper = document.querySelector(".scene-wrapper");
  const scaleX = window.innerWidth / 1920;

  const scaleY = window.innerHeight / 1080;
  const scale = Math.min(scaleX, scaleY);

  wrapper.style.transform = `translate(-50%, 0) scale(${scale})`;
  widgetsPanel.style.zoom = Math.max(1, scale);
}

fitScene();
window.addEventListener("resize", fitScene);

// ---------- page load: fade in + stagger ----------
window.addEventListener("load", () => {
  const overlay = document.getElementById("pageTransitionOverlay");
  if (overlay) {
    overlay.classList.add("fade-in");
  }

  const elements = document.querySelectorAll(".ease-in");

  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("appear");
    }, i * 120);
  });
});

// ==========================================================
// IMAGE LIGHTBOX
// ==========================================================
const imagePopupOverlay = document.getElementById("imagePopupOverlay");
const imagePopupImg = document.getElementById("imagePopupImg");
const imagePopupClose = document.getElementById("imagePopupClose");
const imagePopupPrev = document.getElementById("imagePopupPrev");
const imagePopupNext = document.getElementById("imagePopupNext");

if (
  imagePopupOverlay &&
  imagePopupImg &&
  imagePopupClose &&
  imagePopupPrev &&
  imagePopupNext
) {
  let lastFocusedGalleryItem = null;
  let galleryItems = [];
  let currentGalleryIndex = -1;

  const imagePopupCaption = document.getElementById("imagePopupCaption");
  const imagePopupDate = document.getElementById("imagePopupDate");
  const imagePopupText = document.getElementById("imagePopupText");

  function setGalleryCaption(item) {
    if (!imagePopupCaption) return;
    const date = (item && item.dataset.date) || "";
    const text = (item && item.dataset.caption) || "";
    imagePopupDate.textContent = date;
    imagePopupText.textContent = text;
    imagePopupCaption.hidden = !date && !text;
  }

  function showGalleryImage(index) {
    const item = galleryItems[index];
    const img = item && item.querySelector("img");
    if (!img) return;

    currentGalleryIndex = index;
    setGalleryCaption(item); 
    imagePopupImg.src = img.src;
    imagePopupImg.alt = img.alt || "";
    imagePopupImg.classList.remove("slide-from-left", "slide-from-right");
  }

  function openImagePopup(src, alt, triggerEl) {
    imagePopupImg.src = src;
    imagePopupImg.alt = alt || "";
    imagePopupImg.classList.remove("slide-from-left", "slide-from-right");
    galleryItems = triggerEl
      ? Array.from(
          triggerEl
            .closest(".gallery-grid")
            ?.querySelectorAll(".gallery-item") || [],
        )
      : [];
    currentGalleryIndex = galleryItems.indexOf(triggerEl);
    setGalleryCaption(triggerEl);
    const canNavigate = galleryItems.length > 1;
    imagePopupPrev.disabled = !canNavigate;
    imagePopupNext.disabled = !canNavigate;
    imagePopupOverlay.classList.add("open");
    lastFocusedGalleryItem = triggerEl || null;
    imagePopupClose.focus();
  }

  function closeImagePopup() {
    imagePopupOverlay.classList.remove("open");
    imagePopupImg.src = "";
    galleryItems = [];
    currentGalleryIndex = -1;
    if (lastFocusedGalleryItem) lastFocusedGalleryItem.focus();
  }

  function moveGalleryImage(direction) {
    if (galleryItems.length < 2) return;
    const nextIndex =
      (currentGalleryIndex + direction + galleryItems.length) %
      galleryItems.length;
    showGalleryImage(nextIndex);
    void imagePopupImg.offsetWidth;
    imagePopupImg.classList.add(
      direction > 0 ? "slide-from-right" : "slide-from-left",
    );
  }

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    const img = item.querySelector("img");
    if (img) openImagePopup(img.src, img.alt, item);
  });

  document.addEventListener("keydown", (e) => {
    if (!imagePopupOverlay.classList.contains("open")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveGalleryImage(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveGalleryImage(1);
    }
  });

  onActivate(".gallery-item", (item) => {
    const img = item.querySelector("img");
    if (img) openImagePopup(img.src, img.alt, item);
  });

  registerEscape(
    13,
    () => imagePopupOverlay.classList.contains("open"),
    closeImagePopup,
  );

  imagePopupClose.addEventListener("click", closeImagePopup);
  imagePopupPrev.addEventListener("click", () => moveGalleryImage(-1));
  imagePopupNext.addEventListener("click", () => moveGalleryImage(1));

  // klik na tamnu pozadinu (ne na sliku) zatvara
  imagePopupOverlay.addEventListener("click", (e) => {
    if (e.target === imagePopupOverlay) closeImagePopup();
  });
}

// ==========================================================
// BACKGROUND DARKENS ON SCROLL
// ==========================================================
(function () {
  // Cards that should NOT darken. Match the card's data-title or data-project.
  const DARKEN_IGNORE = ["Discover", "Welcome"];

  const DISTANCE = 0.8; // screens of scrolling until fully dark (smaller = faster)
  const MAX_DARK = 0.9; // 1 = fully black

  const root = document.documentElement;

  // the selected card in the currently visible tab
  function activeItem() {
    const card = document.querySelector(
      ".profile-selector.active-view .profile-card.active",
    );
    return card ? card.closest(".profile-item") : null;
  }

  function isIgnored(item) {
    if (!item) return true;
    return (
      DARKEN_IGNORE.includes(item.dataset.title) ||
      DARKEN_IGNORE.includes(item.dataset.project)
    );
  }

  function update() {
    if (isIgnored(activeItem())) {
      root.style.setProperty("--scroll-dark", "0");
      return;
    }
    const progress = Math.min(
      1,
      Math.max(0, window.scrollY / (window.innerHeight * DISTANCE)),
    );
    root.style.setProperty("--scroll-dark", (progress * MAX_DARK).toFixed(3));
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  // re-check whenever the selected card or the Projects/Media tab changes
  const hero = document.querySelector(".hero");
  if (hero) {
    new MutationObserver(update).observe(hero, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  update();
})();

// ==========================================================
// temp fix: clicking a dark backdrop closes the top layer
// ==========================================================
document.addEventListener(
  "click",
  (e) => {
    if (
      !e.target.matches(
        ".widget-popup-overlay, .ps-overlay, .image-popup-overlay, .tr-pop-overlay",
      )
    )
      return;
    const top = escapeLayers
      .filter((layer) => layer.isOpen())
      .sort((a, b) => b.z - a.z)[0];
    if (!top) return;
    e.stopPropagation(); // stops the old per-popup listeners from also firing
    top.close();
  },
  true,
);