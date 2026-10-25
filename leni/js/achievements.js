const TROPHY_SVG = `
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M7 3h10v5a5 5 0 0 1-10 0V3z"/>
  <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"
        fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M11 13h2v4h-2z"/>
  <path d="M8 21v-2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V21z"/>
</svg>`;

// tier colors: bronze #cd7f32, silver #c0c4cc, gold #f2b632, platinum #7fd3ff
// the key must match data-achievement="..."
const ACHIEVEMENTS = {
  email: {
    title: "Social Interaction Initiated      ",
    color: "#f2b632",
    fancy: true,
  },
  purchase: {
    title: 'Purchase something in the "store" ',
    color: "#7fd3ff",
    fancy: true,
  },
  dog: {
    title: "Now that's a cute dog!           ",
    color: "#c0c4cc",
  },
  gallery: {
    title: '"Let me get a closer look"        ',
    color: "#c0c4cc",
  },
  play: {
    title: "So close... but yet so far...        ",
    color: "#f2b632",
  },
  faq: {
    title: "Something happened! ",
    color: "#cd7f32",
  },
  intresting: {
    title: "blub blub...",
    color: "#cd7f32",
  },
};

const earnedAchievements = new Set();
const achievementQueue = [];
let toastActive = false;

function showAchievement(id) {
  const data = ACHIEVEMENTS[id];
  if (!data || earnedAchievements.has(id)) return;
  earnedAchievements.add(id);
  achievementQueue.push(data);
  if (!toastActive) showNextToast();
}

function showNextToast() {
  const data = achievementQueue.shift();
  if (!data) return;
  toastActive = true;

  playSound("trophy");

  const toast = document.createElement("div");
  toast.className = "trophy-toast" + (data.fancy ? " trophy-toast--fancy" : "");
  toast.setAttribute("role", "status");
  toast.style.setProperty("--tier", data.color);
  toast.innerHTML = `
  <div class="trophy-art">${TROPHY_SVG}</div>
  <div class="trophy-text">
    <div class="trophy-title">${TROPHY_SVG}<span>${data.title}</span></div>
    <div class="trophy-sub">${data.fancy ? "Rare trophy earned!" : "Trophy earned!"}</div>
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
      showNextToast();
    }, 700);
  }, 4500);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-achievement]");
  if (el) showAchievement(el.dataset.achievement);
});
