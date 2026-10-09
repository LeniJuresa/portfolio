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
  // don't hijack arrow/enter presses meant for a focused widget tile,
  // gallery photo, or an open popup
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
    title: "Lorem ipsum",
    body: `<p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ex velit dui risus nisl nunc. Duis justo felis auctor quisque sem. Lacus ligula justo ex leo justo ut.
      Mauris justo est malesuada sollicitudin erat eu lectus nulla. Arcu volutpat vestibulum nulla suspendisse augue massa tortor pellentesque. Morbi vestibulum tellus iaculis ut diam rutrum vehicula ac neque id ligula. A porttitor sapien mi volutpat commodo tellus et lacinia eget eget. Consectetur donec mauris sodales scelerisque eleifend sit sed aenean in mollis lorem lectus. Id nisi vestibulum auctor amet in ac laoreet non nam viverra fermentum condimentum. Et vel vivamus sem viverra tempor tempor quam sit sed commodo nulla consectetur vel. Quis consectetur mauris at mauris.

    </p>
    <p>
      In faucibus feugiat amet ut quam a sapien at dolor suspendisse euismod quam. Luctus tellus nunc vitae ut diam felis. Proin aliquam magna ac eleifend vel egestas. Placerat et at lorem proin ut sagittis suspendisse varius neque eleifend nunc nisi.

      Rhoncus sit quisque lacus egestas. Egestas libero donec euismod purus consectetur scelerisque at suscipit et mauris. Et sed eget consequat posuere. Nisi suscipit amet nisl porttitor condimentum et.
    </p>
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
const widgetPopupCover = document.getElementById("widgetPopupCover");

// ---------- GitHub activity ----------
const ghCache = {};

function ghEsc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function ghAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + " min ago";
  if (s < 86400) return Math.round(s / 3600) + " h ago";
  if (s < 2592000) return Math.round(s / 86400) + " days ago";
  return new Date(iso).toLocaleDateString();
}

async function ghJson(url) {
  if (ghCache[url]) return ghCache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return (ghCache[url] = await res.json());
}

function loadGithubActivity(root) {
  const box = root.querySelector("[data-gh-user]");
  if (!box) return;
  const user = box.dataset.ghUser;
  const q = (sel) => box.querySelector(sel);

  ghJson(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
    .then((data) => {
      const days = data.contributions;
      q("[data-gh-total]").textContent = days.reduce((n, d) => n + d.count, 0);
      const pad = new Date(days[0].date + "T00:00:00").getDay();
      const map = q("[data-gh-map]");
      map.innerHTML =
        '<div class="gh-grid">' +
        '<span class="gh-cell pad"></span>'.repeat(pad) +
        days
          .map(
            (d) =>
              `<span class="gh-cell" data-l="${d.level}" title="${d.count} on ${d.date}"></span>`,
          )
          .join("") +
        "</div>";
      map.scrollLeft = map.scrollWidth;
    })
    .catch(() => {
      q("[data-gh-map]").innerHTML =
        '<p class="gh-loading">Could not load the contribution map.</p>';
    });

  ghJson(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=1`)
    .then((r) => {
      q("[data-gh-repo]").textContent = r[0] ? r[0].name : "–";
    })
    .catch(() => {
      q("[data-gh-repo]").textContent = "–";
    });

  ghJson(`https://api.github.com/users/${user}/events/public?per_page=50`)
    .then((events) => {
      const commits = [];
      events
        .filter((e) => e.type === "PushEvent")
        .forEach((e) => {
          (e.payload.commits || [])
            .slice()
            .reverse()
            .forEach((c) => {
              commits.push({
                repo: e.repo.name,
                sha: c.sha,
                at: e.created_at,
                msg: c.message.split("\n")[0],
              });
            });
        });
      q("[data-gh-commits]").innerHTML =
        commits
          .slice(0, 8)
          .map(
            (c) => `
          <li><a class="gh-commit" href="https://github.com/${c.repo}/commit/${c.sha}" target="_blank" rel="noopener noreferrer">
            <b>${ghEsc(c.msg)}</b><time>${ghAgo(c.at)}</time>
            <small>${ghEsc(c.repo)} · ${c.sha.slice(0, 7)}</small>
          </a></li>`,
          )
          .join("") || '<li class="gh-loading">No recent public commits.</li>';
    })
    .catch(() => {
      q("[data-gh-commits]").innerHTML =
        '<li class="gh-loading">Could not load commits.</li>';
    });
}

// ---------- popup open / close ----------
if (widgetPopupOverlay && widgetPopupTitle && widgetPopupBody) {
  let lastFocusedTile = null;
  const popupBox = widgetPopupOverlay.querySelector(".widget-popup");

  function openWidgetPopup(key, triggerEl) {
    const tpl = document.querySelector(`template[data-popup-key="${key}"]`);
    const legacy = widgetPopupContent[key];
    if (!tpl && !legacy) return;

    widgetPopupTitle.textContent = tpl ? tpl.dataset.title || "" : legacy.title;
    widgetPopupBody.innerHTML = tpl ? tpl.innerHTML : legacy.body;
    widgetPopupOverlay.dataset.size = tpl ? tpl.dataset.size || "lg" : "lg";

    const cover = tpl ? tpl.dataset.cover || "" : "";
    if (widgetPopupCover) {
      widgetPopupCover.style.backgroundImage = cover ? `url("${cover}")` : "";
      widgetPopupCover.classList.toggle("has-cover", !!cover);
    }

    if (key === "activity") loadGithubActivity(widgetPopupBody);

    if (popupBox) popupBox.scrollTop = 0;
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

  widgetPopupOverlay.addEventListener("click", (e) => {
    if (e.target === widgetPopupOverlay) closeWidgetPopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !widgetPopupOverlay.classList.contains("open"))
      return;
    const lightbox = document.getElementById("imagePopupOverlay");
    if (lightbox && lightbox.classList.contains("open")) return;
    closeWidgetPopup();
  });
}

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

  function showGalleryImage(index) {
    const item = galleryItems[index];
    const img = item && item.querySelector("img");
    if (!img) return;

    currentGalleryIndex = index;
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
    const item = e.target.closest(".gallery-item");
    if (item && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      const img = item.querySelector("img");
      if (img) openImagePopup(img.src, img.alt, item);
    }
  });

  imagePopupClose.addEventListener("click", closeImagePopup);
  imagePopupPrev.addEventListener("click", () => moveGalleryImage(-1));
  imagePopupNext.addEventListener("click", () => moveGalleryImage(1));

  // click on the dark backdrop (not the photo itself) closes it
  imagePopupOverlay.addEventListener("click", (e) => {
    if (e.target === imagePopupOverlay) closeImagePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (imagePopupOverlay.classList.contains("open")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveGalleryImage(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveGalleryImage(1);
      }
    }

    if (e.key === "Escape" && imagePopupOverlay.classList.contains("open")) {
      closeImagePopup();
    }
  });
}

// ==========================================================
// AI assisted.

// ==========================================================
// PS STORE (Discover card)
// ==========================================================
(function () {
  const COVER = "../assets/images/placeholder.svg"; // swap per game later
  const LINK = "https://github.com/lenijuresa"; // swap per game later

  const FEAT = [
    "1 developer, fully solo project",
    "Offline play Disabled",
    "Remote play supported, works in any browser",
    "Game help supported, documented code",
  ];

  // ======= EDIT YOUR "GAMES" HERE =======
  // status: "out" = released ("Buy now"), "soon" = in the works ("Pre-order")
  const GAMES = [
    {
      id: "edms",
      title: "EDMS",
      tag: "PHP / Laravel",
      status: "out",
      card: "Emergency Dispatch Management System",
      badges: ["featured"],
      rating: 5,
      count: 1,
      price: 49.99, // the old / full price in euros
      discount: 100, // percent off. Leave it out and it defaults to 100
      per: "",
      year: "2025",
      href: LINK,
      tags: ["PHP", "Laravel", "Web", "SQL", "XAMPP"],
      blurb:
        "Emergency dispatch management system for first responders. Dispatch center for police to manage, track, and coordinate responses for anonymous reports.",
      desc: "Placeholder description for EDMS. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      tech: [
        ["PHP", "What it's written in"],
        ["Laravel", "What it runs on"],
        ["XAMPP", "Anything else worth showing off"],
      ],
    },
    {
      id: "church",
      title: "Church App",
      tag: "Desktop / Java",
      status: "out",
      card: "Church", // Spojnica s profilnom karticom u biblioteci
      badges: ["featured"],
      rating: 4.8,
      count: 212,
      price: 24.99, // the old / full price in euros
      discount: 100, // percent off. Leave it out and it defaults to 100
      per: "",
      year: "2025",
      href: LINK,
      tags: ["Java", "Desktop", "Community"],
      blurb:
        "A Java desktop app for church communities to manage events and members. Used constantly by my local church, Many hours of manual work into just a few clicks ",
      desc: "Placeholder description. Explain what the app does, who uses it every day and what problem it solves.",
      tech: [
        ["Java", "Main language and application logic"],
        ["[GUI toolkit]", "Replace with what you used"],
        ["[Storage / database]", "Replace with what you used"],
        ["Git / GitHub", "Version control"],
      ],
    },

    {
      id: "ISS",
      title: "ISS tracker",
      tag: "Python",
      status: "out",
      card: "ISS tracker",
      badges: [],
      rating: 4.5,
      count: 34,
      price: 19.99, // the old / full price in euros
      discount: 100, // percent off. Leave it out and it defaults to 100
      per: "",
      year: "2024",
      href: LINK,
      tags: ["WIP", "Coming soon"],
      blurb: "Placeholder blurb for ISS tracker.",
      desc: "Placeholder description for ISS tracker. Maecenas eget condimentum velit, sit amet feugiat lectus.",
      tech: [
        ["Python", "Main language"],
        ["[Library]", "Replace with what you used"],
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio: PS5 Edition",
      tag: "Web / Interactive",
      status: "out",
      card: "Welcome",
      badges: [],
      rating: 4.9,
      count: 128,
      price: 69.99, // the old / full price in euros
      discount: 100, // percent off. Leave it out and it defaults to 100
      per: "",
      year: "Summer 2026",
      tags: ["Web", "UI / UX", "Solo", "sigma studio"],
      blurb: "Coming soon! The site you're standing in.",
      desc: "A portfolio disguised as a console dashboard. Browse profiles with arrow keys or mouse, open widgets, flip through galleries and, of course, shop for things that cost nothing.",
      tech: [
        ["HTML", "Structure, templates, accessibility attributes"],
        ["CSS", "Grid, flexbox, animations, glass effects"],
        ["JavaScript", "Card selector, popups, this store"],
        ["Git / GitHub", "Version control and hosting"],
        ["Gangdam / Style", "Version control and hosting"],
      ],
    },
    {
      id: "cv",
      title: "Curriculum Vitae",
      tag: "In development",
      status: "soon",
      badges: ["job"],
      rating: 0,
      count: 0,
      price: 2999,
      discount: 100,
      per: "/m",
      year: "Coming soon",
      href: LINK,
      tags: ["WIP", "Coming soon"],
      blurb: "Still cooking. Pre-order to get notified at launch.",
      desc: "This project is still in the works. Pre-order it now (it's free!) and it'll be waiting in your library when it ships.",
      tech: [
        ["[Language]", "Planned stack"],
        ["[Tool]", "Planned tooling"],
      ],
    },
    {
      id: "Resume",
      title: "Resume",
      tag: "In development",
      status: "soon",
      badges: ["job"],
      rating: 0,
      count: 0,
      price: 2999, // the old / full price in euros
      discount: 100, // percent off. Leave it out and it defaults to 100
      per: "/m",
      year: "Coming soon",
      href: LINK,
      tags: ["WIP", "Coming soon"],
      blurb: "Still cooking. Pre-order to get notified at launch.",
      desc: "This project is still in the works. Pre-order it now (it's free!) and it'll be waiting in your library when it ships.",
      tech: [
        ["[Language]", "Planned stack"],
        ["[Tool]", "Planned tooling"],
      ],
    },
  ];

  const CHECK =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  // state lives out here so it survives the panel being re-injected
  const S = {
    cur: null,
    step: "detail",
    lib: {},
    wish: {},
    timer: null,
    filter: "all",
    last: null,
  };

  const $ = (id) => document.getElementById(id);
  const game = (id) => GAMES.find((x) => x.id === id);
  const isOpen = () => {
    const o = $("psOverlay");
    return !!o && o.classList.contains("open");
  };
  function lock(on) {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  }
  const stars = (r) => {
    const n = Math.round(r);
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  };

  /* ---------- browser (hero + tiles) ---------- */
  const fmt = (n) =>
    "€" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  function pr(x) {
    const price = x.price || 0;
    const pct = x.discount == null ? 100 : x.discount;
    const now = Math.round(price * (100 - pct)) / 100;
    const per = x.per ? " " + x.per : "";
    return {
      pct,
      sale: pct > 0 && price > 0,
      free: now === 0,
      old: fmt(price) + per,
      now: fmt(now) + per,
      save: fmt(price - now),
    };
  }
  const offHTML = (p) =>
    p.sale ? '<span class="ps-off">-' + p.pct + "%</span>" : "";
  const oldHTML = (p) => (p.sale ? "<s>" + p.old + "</s>" : "");

  const BADGES = {
    featured: { label: "FEATURED", tip: "Featured project" },
    job: { label: "JOB", tip: "Part of my CV / resume" },
  };
  function badgesHTML(x) {
    if (!x.badges || !x.badges.length) return "";
    return (
      '<span class="ps-badges">' +
      x.badges
        .filter((b) => BADGES[b])
        .map(
          (b) =>
            '<span class="ps-badge ps-badge--' +
            b +
            '" title="' +
            BADGES[b].tip +
            '">' +
            BADGES[b].label +
            "</span>",
        )
        .join("") +
      "</span>"
    );
  }

  const featuredList = () => {
    const f = GAMES.filter((g) => g.badges && g.badges.includes("featured"));
    return f.length ? f : [GAMES[0]];
  };
  function heroHTML(x) {
    const p = pr(x);
    const list = featuredList();
    const multi = list.length > 1;
    const dots = multi
      ? '<div class="ps-dots">' +
        list
          .map(
            (g, i) =>
              '<button type="button" class="ps-dot' +
              (g.id === x.id ? " active" : "") +
              '" data-act="hero" data-i="' +
              i +
              '" aria-label="Show ' +
              g.title +
              '"></button>',
          )
          .join("") +
        "</div>"
      : "";
    const arrows = multi
      ? '<button type="button" class="ps-hero-nav ps-hero-prev" data-act="hero-prev" aria-label="Previous featured game">&#10094;</button>' +
        '<button type="button" class="ps-hero-nav ps-hero-next" data-act="hero-next" aria-label="Next featured game">&#10095;</button>'
      : "";
    return (
      '<div class="ps-hero' +
      (multi ? " ps-hero--multi" : "") +
      '"><img class="ps-hero-bg" src="' +
      COVER +
      '" alt="">' +
      '<div class="ps-hero-shade"></div>' +
      arrows +
      '<div class="ps-hero-body">' +
      badgesHTML(x) +
      "<h2>" +
      x.title +
      "</h2><p>" +
      x.blurb +
      "</p>" +
      '<div class="ps-price">' +
      offHTML(p) +
      oldHTML(p) +
      "<b>" +
      p.now +
      "</b></div>" +
      '<button type="button" class="ps-btn ps-btn--primary" data-act="open" data-id="' +
      x.id +
      '">View game</button>' +
      dots +
      "</div></div>"
    );
  }
  function renderHero(refocus, dir) {
    const root = $("psHero");
    if (!root) return;
    const list = featuredList();
    S.hero = ((S.hero % list.length) + list.length) % list.length;
    root.innerHTML = heroHTML(list[S.hero]);
    const body = root.querySelector(".ps-hero-body");
    if (body && dir) body.classList.add(dir > 0 ? "slide-next" : "slide-prev");
    if (refocus) {
      const b = root.querySelector('[data-act="' + refocus + '"]');
      if (b) b.focus();
    }
  }
  function stepHero(d, refocus) {
    const n = featuredList().length;
    if (n < 2) return;
    S.hero = (S.hero + d + n) % n;
    renderHero(refocus, d);
  }

  let heroTimer = null;
  function startHeroAuto() {
    clearInterval(heroTimer); // restarting resets the 5 second countdown
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(() => {
      const hero = document.querySelector("#psHero .ps-hero");
      if (!hero || document.hidden || isOpen()) return;
      if (hero.matches(":hover") || hero.contains(document.activeElement))
        return;
      stepHero(1);
    }, 5000); //scroll every 5 seconds if not hovered or focused, for the featured games list
  }
  function tileHTML(x) {
    const p = pr(x);
    return (
      '<button type="button" class="ps-tile" data-act="open" data-id="' +
      x.id +
      '" data-status="' +
      x.status +
      '">' +
      '<span class="ps-art"><img src="' +
      COVER +
      '" alt="" loading="lazy">' +
      (x.status === "soon" ? '<span class="ps-soon">Pre-order</span>' : "") +
      '<span class="ps-flags">' +
      offHTML(p) +
      badgesHTML(x) +
      "</span>" +
      "</span>" +
      '<span class="ps-tname">' +
      x.title +
      '</span><span class="ps-tsub">' +
      x.tag +
      "</span>" +
      '<span class="ps-tprice"><b>' +
      p.now +
      "</b>" +
      oldHTML(p) +
      "</span>" +
      '<span class="ps-own">' +
      CHECK +
      " In Library</span></button>"
    );
  }
  function sync() {
    let shown = 0;
    document.querySelectorAll(".ps-tile").forEach((t) => {
      const own = !!S.lib[t.dataset.id];
      const f = S.filter;
      const vis = f === "all" || f === t.dataset.status || (f === "lib" && own);
      t.classList.toggle("is-owned", own);
      t.hidden = !vis;
      if (vis) shown++;
    });
    const e = $("psEmpty");
    if (e) e.hidden = shown > 0;
  }

  /* ---------- popup views ---------- */
  function steps(n) {
    const L = ["Order summary", "Payment", "Complete"];
    return (
      '<ol class="ps-steps">' +
      L.map(
        (l, i) =>
          '<li class="' +
          (i < n ? "done" : i === n ? "now" : "") +
          '"><span>' +
          (i < n ? CHECK : i + 1) +
          "</span>" +
          l +
          "</li>",
      ).join("") +
      "</ol>"
    );
  }
  function libUI(x) {
    const l = S.lib[x.id] || {};
    const dl = l.dl || 0;
    if (x.status === "soon")
      return (
        '<span class="ps-installed">' +
        CHECK +
        " Pre-ordered · arrives in your library at launch</span>"
      );
    if (l.running)
      return (
        '<div class="ps-dl"><div class="ps-dl-top"><span>Downloading…</span><span id="psPct">' +
        Math.floor(dl) +
        '%</span></div><div class="ps-bar"><i id="psBar" style="width:' +
        dl +
        '%"></i></div></div>'
      );
    if (dl >= 100)
      return (
        '<button type="button" class="ps-btn ps-btn--primary" data-act="launch" data-id="' +
        x.id +
        '">▶ Launch project</button>' +
        '<span class="ps-installed">' +
        CHECK +
        " Installed</span>"
      );
    return (
      '<button type="button" class="ps-btn ps-btn--primary" data-act="dl" data-id="' +
      x.id +
      '" data-tooltip="! pressing this will not download anything on your device">Download</button>'
    );
  }
  const li = (a) =>
    "<li>" +
    CHECK +
    "<span>" +
    a[0] +
    (a[1] ? "<small>" + a[1] + "</small>" : "") +
    "</span></li>";

  const V = {
    detail(x) {
      const own = S.lib[x.id];
      const p = pr(x);
      const actions = own
        ? '<div class="ps-actions">' + libUI(x) + "</div>"
        : '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary" data-act="go" data-step="cart">' +
          (x.status === "soon" ? "Pre-order" : "Buy now") +
          "</button>" +
          '<button type="button" class="ps-btn ps-btn--ghost" data-act="wish">' +
          (S.wish[x.id] ? "♥ Wishlisted" : "♡ Add to wishlist") +
          "</button></div>";
      const rating = x.count
        ? '<div class="ps-rate"><span class="ps-stars" aria-hidden="true">' +
          stars(x.rating) +
          "</span><b>" +
          x.rating.toFixed(1) +
          "</b><small>" +
          x.count +
          " ratings</small></div>"
        : '<div class="ps-rate"><small>Not enough ratings yet</small></div>';
      return (
        '<div class="ps-detail"><div class="ps-cover"><img src="' +
        COVER +
        '" alt="">' +
        offHTML(p) +
        badgesHTML(x) +
        "</div>" +
        '<div class="ps-info"><h2 class="ps-h" id="psTitle">' +
        x.title +
        "</h2>" +
        '<p class="ps-pub">LJ Studios · ' +
        x.tag +
        " · " +
        x.year +
        "</p>" +
        '<div class="ps-tags">' +
        x.tags.map((t) => "<span>" + t + "</span>").join("") +
        "</div>" +
        rating +
        '<div class="ps-price">' +
        offHTML(p) +
        oldHTML(p) +
        "<b>" +
        p.now +
        "</b></div>" +
        actions +
        '<p class="ps-desc">' +
        x.desc +
        "</p></div></div>" +
        '<div class="ps-cols"><div><h3>Skills &amp; tools used</h3><ul>' +
        x.tech.map(li).join("") +
        "</ul></div>" +
        "<div><h3>Features</h3><ul>" +
        (x.feat || FEAT).map((f) => li([f])).join("") +
        "</ul></div></div>"
      );
    },
    cart(x) {
      const p = pr(x);
      return (
        '<div class="ps-flow">' +
        steps(0) +
        '<h2 class="ps-h" id="psTitle">Order summary</h2>' +
        '<div class="ps-order"><img src="' +
        COVER +
        '" alt=""><div><b>' +
        x.title +
        "</b><small>" +
        x.tag +
        " · Digital</small></div>" +
        '<div class="ps-op">' +
        oldHTML(p) +
        "<b>" +
        p.now +
        "</b></div></div>" +
        '<dl class="ps-sum"><div><dt>Subtotal</dt><dd>' +
        p.old +
        "</dd></div>" +
        (p.sale
          ? '<div class="g"><dt>Discount (' +
            p.pct +
            "%)</dt><dd>-" +
            p.save +
            "</dd></div>"
          : "") +
        '<div class="total"><dt>Total</dt><dd>' +
        p.now +
        "</dd></div></dl>" +
        '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary" data-act="go" data-step="pay">Continue to payment</button>' +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="go" data-step="detail">Back</button></div></div>'
      );
    },
    pay(x) {
      const p = pr(x);
      return (
        '<div class="ps-flow">' +
        steps(1) +
        '<h2 class="ps-h" id="psTitle">Payment</h2>' +
        '<div class="ps-method"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' +
        "<div><b>Wallet</b><small>" +
        (p.free
          ? "€0.00 will be charged. No payment details needed."
          : p.now +
            " would be charged. Don't worry, this is a demo and nothing is actually charged.") +
        "</small></div></div>" +
        '<label class="ps-tos"><input type="checkbox" id="psTos">' +
        "<span>" +
        (p.free
          ? "I agree to the Terms of Service and understand that " +
            x.title +
            " is, in fact, free."
          : "I agree to the Terms of Service and understand that this is a demo store.") +
        "</span></label>" +
        '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary" id="psConfirm" disabled data-act="go" data-step="proc">Confirm ' +
        (x.status === "soon" ? "pre-order" : "purchase") +
        "</button>" +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="go" data-step="cart">Back</button></div></div>'
      );
    },
    proc() {
      return (
        '<div class="ps-flow ps-center">' +
        steps(2) +
        '<div class="ps-spin" role="status" aria-label="Processing"></div>' +
        '<h2 class="ps-h" id="psTitle" style="padding:0;font-size:28px">Processing</h2>' +
        '<p class="ps-order-no" id="psProcTxt">Processing your order…</p></div>'
      );
    },
    done(x) {
      const l = S.lib[x.id] || {};
      const p = pr(x);
      return (
        '<div class="ps-flow ps-center">' +
        steps(3) +
        '<svg class="ps-bigcheck" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>' +
        '<h2 class="ps-h" id="psTitle" style="padding:0">' +
        (x.status === "soon" ? "Pre-order complete" : "Purchase complete") +
        "</h2>" +
        '<p class="ps-order-no">' +
        x.title +
        " · Order #" +
        (l.order || "") +
        " · " +
        p.now +
        "</p>" +
        '<div class="ps-actions" style="justify-content:center">' +
        libUI(x) +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="close">Keep browsing</button></div></div>'
      );
    },
  };

  function render(anim) {
    const body = $("psBody");
    if (!body || !S.cur) return;
    body.className = "ps-body" + (anim ? " ps-anim" : "");
    body.innerHTML = V[S.step](game(S.cur));
    if (anim) {
      const s = $("psScroll");
      if (s) s.scrollTop = 0;
    }
  }
  function focusPrimary() {
    const b = document.querySelector(
      "#psBody .ps-btn--primary:not([disabled])",
    );
    if (b) b.focus();
  }

  /* ---------- actions ---------- */
  function openGame(id) {
    S.cur = id;
    S.step = "detail";
    S.last = document.activeElement;
    $("psOverlay").classList.add("open");
    lock(true);
    render(true);
    setTimeout(() => {
      const x = document.querySelector(".ps-x");
      if (x) x.focus();
    }, 50);
  }
  function closeGame() {
    clearTimeout(S.timer);
    if (S.step === "proc") S.step = "detail";
    const o = $("psOverlay");
    if (o) o.classList.remove("open");
    lock(false);
    if (S.last && S.last.focus) S.last.focus();
  }
  function launch(id) {
    const x = game(id);
    if (!x) return;

    const target = x.card
      ? [...document.querySelectorAll(".profile-item")].find(
          (el) => el.dataset.title === x.card || el.dataset.project === x.card,
        )
      : null;

    if (!target) {
      window.open(x.href, "_blank", "noopener,noreferrer");
      return;
    }

    closeGame();

    const fire = (el) => {
      ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
        (type) =>
          el.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
            }),
          ),
      );
    };

    const select = () => {
      const card = target.querySelector(".profile-card") || target;
      const name = target.querySelector(".profile-name");
      fire(card);
      // if the first try didn't change anything, try the item and its label too
      setTimeout(() => {
        const cur = document.getElementById("cardDetailTitle");
        const done =
          target.classList.contains("active") ||
          target.classList.contains("selected") ||
          target.classList.contains("is-active") ||
          (cur && cur.textContent.trim() === target.dataset.title);
        if (!done) {
          fire(target);
          if (name) fire(name);
        }
      }, 80);
    };

    // 1) scroll to the top, 2) wait until we're there, 3) open the card
    const scrollTopThenSelect = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const started = performance.now();
      const check = () => {
        const arrived = window.scrollY <= 2;
        const timedOut = performance.now() - started > 1500; // safety net
        if (arrived || timedOut) {
          setTimeout(select, 150); // small pause so it feels deliberate
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    };

    setTimeout(scrollTopThenSelect, 250); // let the popup finish closing first
  }
  function go(step) {
    S.step = step;
    render(true);
    if (step === "proc") {
      const id = S.cur;
      S.timer = setTimeout(() => {
        const t = $("psProcTxt");
        if (t) t.textContent = "Adding to your library…";
        S.timer = setTimeout(() => {
          if (S.cur !== id || S.step !== "proc") return;
          S.lib[id] = {
            dl: 0,
            running: false,
            order: "LJ-" + Math.floor(10000000 + Math.random() * 89999999),
          };
          S.step = "done";
          render(true);
          sync();
          focusPrimary();
        }, 1300);
      }, 1400);
    }
  }
  function download(id) {
    const l = S.lib[id];
    if (!l || l.running || l.dl >= 100) return;
    l.running = true;
    l.dl = 0;
    render(false);
    const t = setInterval(() => {
      l.dl = Math.min(100, l.dl + 2 + Math.random() * 7);
      if (l.dl >= 100) {
        clearInterval(t);
        l.running = false;
        l.dl = 100;
      }
      if (S.cur === id && isOpen() && $("psBody")) {
        if (l.running) {
          const b = $("psBar"),
            p = $("psPct");
          if (b) b.style.width = l.dl + "%";
          if (p) p.textContent = Math.floor(l.dl) + "%";
        } else {
          render(false);
          focusPrimary();
        }
      }
    }, 280);
  }

  /* ---------- build the browser whenever the Discover card is shown ---------- */
  function initStore() {
    const root = $("psStore");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";
    lock(false);
    clearTimeout(S.timer);
    S.filter = "all";
    S.cur = null;
    S.step = "detail";
    S.hero = 0;
    renderHero();
    $("psGrid").innerHTML = GAMES.map(tileHTML).join("");
    sync();
  }

  const panel = document.getElementById("widgetsPanel");
  if (!panel) return;

  // script.js replaces the panel's innerHTML on every card change,
  // so we watch for the store appearing and fill it in.
  new MutationObserver(initStore).observe(panel, { childList: true });
  initStore();

  startHeroAuto();

  // when the mouse leaves the banner, give people a fresh 5 seconds
  panel.addEventListener("mouseout", (e) => {
    const from = e.target.closest && e.target.closest(".ps-hero");
    if (from && !(e.relatedTarget && from.contains(e.relatedTarget)))
      startHeroAuto();
  });

  // listeners go on the panel itself (it never gets replaced)
  panel.addEventListener("click", (e) => {
    if (!e.target.closest("#psStore")) return;
    if (e.target.id === "psOverlay") return closeGame();
    const t = e.target.closest("[data-act]");
    if (!t) return;
    switch (t.dataset.act) {
      case "launch":
        launch(t.dataset.id);
        break;
      case "open":
        openGame(t.dataset.id);
        break;
      case "close":
        closeGame();
        break;
      case "go":
        go(t.dataset.step);
        break;
      case "hero": {
        const i = +t.dataset.i;
        const dir = i >= S.hero ? 1 : -1;
        S.hero = i;
        renderHero(null, dir);
        startHeroAuto();
        break;
      }
      case "hero-prev":
        stepHero(-1, "hero-prev");
        startHeroAuto();
        break;
      case "hero-next":
        stepHero(1, "hero-next");
        startHeroAuto();
        break;
        break;
      case "wish":
        S.wish[S.cur] = !S.wish[S.cur];
        render(false);
        break;
      case "dl":
        download(t.dataset.id);
        break;
      case "filter":
        S.filter = t.dataset.f;
        document
          .querySelectorAll(".ps-chip")
          .forEach((c) => c.classList.toggle("active", c === t));
        sync();
        break;
    }
  });

  panel.addEventListener("change", (e) => {
    if (e.target.id === "psTos") {
      const c = $("psConfirm");
      if (c) c.disabled = !e.target.checked;
    }
  });

  panel.addEventListener("keydown", (e) => {
    if (!e.target.closest("#psStore")) return;
    e.stopPropagation(); // stops the main card selector from reacting to arrows / Enter

    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      closeGame();
      return;
    }
    if (e.key === "Tab" && isOpen()) {
      const f = [
        ...$("psPanel").querySelectorAll(
          "button:not([disabled]),a[href],input:not([disabled])",
        ),
      ];
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (!isOpen() && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const tiles = [...document.querySelectorAll(".ps-tile:not([hidden])")];
      const i = tiles.indexOf(document.activeElement);
      if (i > -1) {
        e.preventDefault();
        const n = tiles[i + (e.key === "ArrowRight" ? 1 : -1)];
        if (n) n.focus();
      }
    }
  });

  // Escape still works if focus slipped out of the popup
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeGame();
  });
})();
