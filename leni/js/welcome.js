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

// ---------- Contact clock ----------
const MY_TIMEZONE = "Europe/Zagreb";
const AVAILABLE_FROM = 10;
const AVAILABLE_TO = 21;
const SLEEP_FROM = 1;
let contactClockTimer = null;

function startContactClock(root) {
  clearInterval(contactClockTimer);
  const box = root.querySelector("[data-cn-clock]");
  if (!box) return;
  const timeEl = box.querySelector("[data-cn-time]");
  const stateEl = box.querySelector("[data-cn-state]");

  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: MY_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const hourFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: MY_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  });

  function tick() {
    if (!box.isConnected) return clearInterval(contactClockTimer);
    const now = new Date();
    const hour = parseInt(hourFmt.format(now), 10) % 24;

    const isAvailable = hour >= AVAILABLE_FROM && hour < AVAILABLE_TO;
    const isSleeping =
      SLEEP_FROM < AVAILABLE_FROM
        ? hour >= SLEEP_FROM && hour < AVAILABLE_FROM
        : hour >= SLEEP_FROM || hour < AVAILABLE_FROM;

    timeEl.textContent = timeFmt.format(now);
    box.dataset.on = String(isAvailable);

    if (isAvailable) {
      stateEl.textContent =
        "Usually online around this time. I'll get back to you ASAP.";
    } else if (isSleeping) {
      stateEl.textContent =
        "Currently asleep (or should be). I'll reply in the morning!";
    } else {
      stateEl.textContent =
        "It is quite late. Feel free to drop a message, I'll reply ASAP.";
    }
  }

  tick();
  contactClockTimer = setInterval(tick, 1000);
}