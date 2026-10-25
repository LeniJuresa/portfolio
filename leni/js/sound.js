// ---------- zvukovi ----------
const SOUNDS = {
  move: new Audio("../assets/sounds/move.mp3"),
  click: new Audio("../assets/sounds/click.mp3"),
  trophy: new Audio("../assets/sounds/Trophy.mp3"),
  nav: new Audio("../assets/sounds/Navigation_Back.mp3"),
};
SOUNDS.move.volume = 0.4;
SOUNDS.click.volume = 0.4;
SOUNDS.trophy.volume = 0.4;
SOUNDS.nav.volume = 0.4;

Object.values(SOUNDS).forEach((a) => (a.preload = "auto"));

let soundOn = true;
let sfxMuted = false;

function playSound(name) {
  if (!soundOn || sfxMuted) return;
  const base = SOUNDS[name];
  if (!base) return;
  const s = base.cloneNode();
  s.volume = base.volume;
  s.play().catch(() => {});
}

/* ==========================================================
   SOUND STUDIO (Media tab, "Sound studio" card)

AI ASSISTED
   ========================================================== */
(function () {
  const $text = document.getElementById("cardDetailText");
  const $detail = document.getElementById("cardDetail");
  if (!$text) return;

  const ARTIST = "Leni Jureša";
  const SND = "../assets/sounds/";
  const COVER = "../assets/images/placeholder.svg";

  // filter chips are built from this list
  const TYPES = {
    ambient: "Ambient",
    song: "Songs",
    site: "Website sounds",
    other: "Other",
  };

  // ======= EDIT TRACKS HERE =======
  // type: "song" | "site" | "other"     duration (seconds) is optional,
  // otherwise it is read from the file the first time it plays.
  const TRACKS = [
    {
      id: "s1",
      type: "ambient",
      title: "Temp background song 1",
      tag: "Piano Solo",
      src: SND + "songs/drone1.mp3",
      cover: COVER,
    },
    {
      id: "s2",
      type: "ambient",
      title: "Temp background song 2",
      tag: "Ambient Loop",
      src: SND + "songs/drone2.mp3",
      cover: COVER,
    },

    {
      id: "o1",
      type: "other",
      title: "Voice Memo Sketch",
      tag: "Idea",
      src: SND + "other/sketch_01.mp3",
      cover: COVER,
    },
    {
      id: "w1",
      type: "site",
      title: "Navigation Move",
      tag: "Site SFX",
      src: SND + "move.mp3",
      cover: COVER,
    },
    {
      id: "w2",
      type: "site",
      title: "Select Click",
      tag: "Site SFX",
      src: SND + "click.mp3",
      cover: COVER,
    },
    {
      id: "w3",
      type: "site",
      title: "Trophy Chime",
      tag: "Site SFX",
      src: SND + "Trophy.mp3",
      cover: COVER,
    },
    {
      id: "w4",
      type: "site",
      title: "Back Whoosh",
      tag: "Site SFX",
      src: SND + "Navigation_Back.mp3",
      cover: COVER,
    },
  ];

  // ---------- state ----------
  //
  const AMBIENT_ID = "s1"; // the background song, it loops until someone picks another
  const MUSIC_VOLUME = 0.15; // 0 to 1, background music should stay quiet
  const FADE_MS = 1500;
  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = MUSIC_VOLUME;
  const S = {
    id: null, // current track id
    queue: [], // (not used for stepping any more, kept so nothing else breaks)
    filter: "ambient",
    scrubbing: false,
    missing: new Set(),
    durations: {},
    userPaused: false, // true when the visitor pressed pause themselves
    cardMode: "", // data-music of the card that is selected right now
    base: null, // what was playing before a card took over the music
  };

  const byId = (id) => TRACKS.find((t) => t.id === id);
  const visible = () =>
    TRACKS.filter((t) => S.filter === "all" || t.type === S.filter);
  const root = () => $text.querySelector(".sound-studio");
  const durOf = (t) => (t ? t.duration || S.durations[t.id] : undefined);
  const esc = (s) =>
    String(s).replace(
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
  function fmt(s) {
    if (!isFinite(s) || s < 0) return "–:––";
    return (
      Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0")
    );
  }

  const ICO_ROW_PLAY =
    '<svg class="ss-row-ico" viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg>';

  // ---------- building the markup ----------
  function buildChips(el) {
    const keys = ["all", ...Object.keys(TYPES)];
    el.querySelector("[data-ss-chips]").innerHTML = keys
      .map(
        (k) =>
          `<button type="button" class="ss-chip${S.filter === k ? " is-active" : ""}" data-ss-filter="${k}">${k === "all" ? "All" : esc(TYPES[k])}</button>`,
      )
      .join("");
  }

  function buildList(el) {
    const list = visible();
    el.querySelector("[data-ss-list]").innerHTML = list.length
      ? list
          .map(
            (t, i) => `
        <button type="button" class="ss-row" data-track="${t.id}">
          <span class="ss-idx">
            <span class="ss-num">${String(i + 1).padStart(2, "0")}</span>
            ${ICO_ROW_PLAY}
            <span class="ss-eq"><i></i><i></i><i></i></span>
          </span>
          <span class="ss-meta"><b>${esc(t.title)}</b><small>${esc(ARTIST)}</small></span>
          <span class="ss-kind">${esc(t.tag)}</span>
          <span class="ss-dur" data-dur>${fmt(durOf(t))}</span>
        </button>`,
          )
          .join("")
      : '<p class="ss-empty">Nothing here yet.</p>';
    el.querySelector("[data-ss-count]").textContent =
      ARTIST + " · " + TRACKS.length + " tracks";
  }

  function mount(el) {
    el.dataset.ready = "1";
    buildChips(el);
    buildList(el);
    sync();
  }

  // ---------- keeping the UI in step with the audio ----------
  let ssCachedEl = null;
  function updateTime() {
    if (!ssCachedEl || !ssCachedEl.isConnected) {
      ssCachedEl = root();
    }
    const el = ssCachedEl;
    if (!el) return;
    const bar = el.querySelector("[data-ss-scrub]");
    if (!bar) return;
    const dur = audio.duration;
    const hasDur = isFinite(dur) && dur > 0;
    const cur =
      S.scrubbing && hasDur ? (bar.value / 1000) * dur : audio.currentTime;
    if (!S.scrubbing) bar.value = hasDur ? (audio.currentTime / dur) * 1000 : 0;
    bar.style.setProperty("--p", bar.value / 10 + "%");
    const curEl = el.querySelector("[data-ss-cur]");
    const totalEl = el.querySelector("[data-ss-total]");
    if (curEl) curEl.textContent = fmt(cur);
    if (totalEl) totalEl.textContent = fmt(dur);
  }

  function sync() {
    const el = root();
    if (!el) return;
    const t = byId(S.id);
    const playing = !!t && !audio.paused && !audio.ended;

    el.querySelectorAll(".ss-row").forEach((row) => {
      const id = row.dataset.track;
      row.classList.toggle("is-active", id === S.id);
      row.classList.toggle("is-playing", id === S.id && playing);
      row.classList.toggle("is-missing", S.missing.has(id));
      row.querySelector("[data-dur]").textContent = fmt(durOf(byId(id)));
    });

    el.classList.toggle("has-np", !!t);
    const np = el.querySelector("[data-ss-np]");
    np.hidden = !t;

    const big = el.querySelector("[data-ss-play]");
    big.classList.toggle("is-playing", playing);
    big.setAttribute("aria-label", playing ? "Pause" : "Play");

    if (!t) return;
    const cover = np.querySelector("[data-ss-cover]");
    if (cover.getAttribute("src") !== t.cover)
      cover.setAttribute("src", t.cover);
    np.querySelector("[data-ss-title]").textContent = t.title;
    np.querySelector("[data-ss-sub]").textContent = S.missing.has(t.id)
      ? "Audio file not found in assets/sounds"
      : ARTIST + " · " + t.tag;
    const tg = np.querySelector("[data-ss-toggle]");
    tg.classList.toggle("is-playing", playing);
    tg.setAttribute("aria-label", playing ? "Pause" : "Play");
    updateTime();
  }

  // ---------- playback ----------
  // @@MUSIC-3  load / toggle / step with ambient loop + autoplay unlock
  let unlockArmed = false;
  function armUnlock() {
    // browsers may block autoplay, so retry on the visitor's first click or key
    if (unlockArmed) return;
    unlockArmed = true;
    const go = () => {
      unlockArmed = false;
      window.removeEventListener("pointerdown", go, true);
      window.removeEventListener("keydown", go, true);
      if (S.id && audio.paused && !S.userPaused && S.cardMode !== "off") {
        const p = audio.play();
        if (p && p.catch) p.catch(() => armUnlock());
      }
    };
    window.addEventListener("pointerdown", go, true);
    window.addEventListener("keydown", go, true);
  }

  // @@FADE-2  smooth volume changes (fadeTo) + load() with optional fade in
  let fadeTimer = null;
  function fadeTo(target, ms, done) {
    clearInterval(fadeTimer); // a new fade cancels the one still running
    const from = audio.volume;
    const start = performance.now();
    if (ms <= 0 || from === target) {
      audio.volume = target;
      if (done) done();
      return;
    }
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / ms);
      audio.volume = from + (target - from) * k;
      if (k >= 1) {
        clearInterval(fadeTimer);
        if (done) done();
      }
    }, 30);
  }

  // fade the current music out, then run fn (fn usually loads the next track)
  function fadeOutThen(fn) {
    if (audio.paused) return fn();
    fadeTo(0, FADE_MS, fn);
  }

  // opts: auto (not started by the visitor), loop, seek (seconds),
  //       play (false = stay paused), fadeIn (start silent, fade up)
  function load(id, opts = {}) {
    const t = byId(id);
    if (!t) return;
    S.id = id;
    S.missing.delete(id);
    if (!opts.auto) S.userPaused = false;
    audio.loop = opts.loop !== undefined ? opts.loop : false;
    audio.src = t.src;
    if (opts.seek) {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          audio.currentTime = opts.seek;
        },
        { once: true },
      );
    }
    const fadeIn = !!opts.fadeIn && opts.play !== false;
    clearInterval(fadeTimer);
    audio.volume = fadeIn ? 0 : MUSIC_VOLUME;
    if (opts.play !== false) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => armUnlock());
    }
    if (fadeIn) fadeTo(MUSIC_VOLUME, FADE_MS);
    if (!opts.auto && typeof showAchievement === "function")
      showAchievement("studio");
    sync();
  }

  function toggle() {
    if (!S.id) return load(AMBIENT_ID);
    if (audio.paused) {
      S.userPaused = false;
      if (S.missing.has(S.id)) return load(S.id);
      const p = audio.play();
      if (p && p.catch) p.catch(() => armUnlock());
    } else {
      S.userPaused = true;
      audio.pause();
    }
  }

  const songIds = () =>
    TRACKS.filter((t) => t.type === "song").map((t) => t.id);

  // songs play through the song list and wrap back to the ambient song;
  // anything else (sound effects, sketches) falls back to the ambient song
  function step(dir, auto) {
    // Use currently visible tracks in the active filter list; fallback to all songs
    const curList = visible().map((t) => t.id);
    const q = curList.length ? curList : songIds();
    const i = q.indexOf(S.id);

    if (i === -1) {
      load(q[0], { auto: !!auto });
    } else {
      const nextIdx = (i + dir + q.length) % q.length;
      load(q[nextIdx], { auto: !!auto });
    }
  }

  function prev() {
    if (audio.currentTime > 3) audio.currentTime = 0;
    else step(-1);
  }

  audio.addEventListener("timeupdate", () => {
    if (!S.scrubbing) updateTime();
  });
  audio.addEventListener("loadedmetadata", () => {
    if (S.id && isFinite(audio.duration)) S.durations[S.id] = audio.duration;
    sync();
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("ended", () => step(1, true));
  audio.addEventListener("error", () => {
    if (S.id) S.missing.add(S.id);
    sync();
  });

  // ---------- events (delegated, the markup gets replaced often) ----------
  $text.addEventListener("click", (e) => {
    const el = e.target.closest(".sound-studio");
    if (!el) return;

    const chip = e.target.closest("[data-ss-filter]");
    if (chip) {
      S.filter = chip.dataset.ssFilter;
      buildChips(el);
      buildList(el);
      sync();
      return;
    }

    const row = e.target.closest(".ss-row");
    if (row) {
      if (row.dataset.track === S.id) toggle();
      else {
        S.queue = visible().map((t) => t.id);
        load(row.dataset.track);
      }
      return;
    }

    if (e.target.closest("[data-ss-play], [data-ss-toggle]")) return toggle();
    if (e.target.closest("[data-ss-prev]")) return prev();
    if (e.target.closest("[data-ss-next]")) return step(1);

    const pad = e.target.closest("[data-sfx]");
    if (pad) {
      if (typeof playSound === "function") playSound(pad.dataset.sfx);
      pad.classList.remove("is-hit");
      requestAnimationFrame(() => {
        pad.classList.add("is-hit");
      });
    }
  });

  // scrubbing: preview while dragging, seek on release
  $text.addEventListener("input", (e) => {
    if (!e.target.matches("[data-ss-scrub]")) return;
    S.scrubbing = true;
    updateTime();
  });
  $text.addEventListener("change", (e) => {
    if (!e.target.matches("[data-ss-scrub]")) return;
    if (isFinite(audio.duration)) {
      audio.currentTime = (e.target.value / 1000) * audio.duration;
    }
    S.scrubbing = false;
    updateTime();
  });

  // arrows / Enter while focus is inside the player must not move the
  // card selector behind it (the seek bar needs its own arrow keys too)
  $text.addEventListener("keydown", (e) => {
    if (!e.target.closest(".sound-studio")) return;
    if (["ArrowLeft", "ArrowRight", "Enter"].includes(e.key))
      e.stopPropagation();
  });

  // ---------- durations: read each file's length once, so the list shows
  // them before anything is played (missing files are simply skipped) ----------
  let probed = false;
  function probeDurations() {
    if (probed) return;
    probed = true;
    TRACKS.forEach((t) => {
      if (t.duration) return;
      const a = new Audio();
      a.preload = "metadata";
      a.addEventListener("loadedmetadata", () => {
        if (isFinite(a.duration)) S.durations[t.id] = a.duration;
        sync();
      });
      a.src = t.src;
    });
  }

  // ---------- lifecycle ----------
  // @@MUSIC-5  mount the studio markup, per-card rules, start the ambient song
  // The music no longer stops when the card changes, only the markup is rebuilt.
  function guard() {
    const el = root();
    if (el && !el.dataset.ready) {
      mount(el);
      probeDurations();
    }
  }
  new MutationObserver(guard).observe($text, { childList: true });
  guard();

  // data-music on a .profile-item:
  //   (nothing) -> music keeps playing as it is
  //   "off"     -> music pauses while that card is selected
  //   "s2"      -> that track id plays (looping) while that card is selected
  // when you leave the card the earlier song resumes where it was.
  function restoreBase() {
    const b = S.base;
    if (!b) return;
    S.base = null;
    const resume = b.wasPlaying && !S.userPaused;
    if (b.id && b.id !== S.id) {
      // another song took over: fade it out, bring the earlier one back
      fadeOutThen(() =>
        load(b.id, { auto: true, seek: b.time, play: resume, fadeIn: true }),
      );
    } else if (resume) {
      // same song (it was only faded out / paused): fade it back up
      if (audio.paused) {
        audio.volume = 0;
        const p = audio.play();
        if (p && p.catch) p.catch(() => armUnlock());
      }
      fadeTo(MUSIC_VOLUME, FADE_MS);
    } else {
      clearInterval(fadeTimer);
      audio.volume = MUSIC_VOLUME;
    }
  }

  window.applyCardMusic = function (item) {
    const mode = (item && item.dataset.music) || "";
    if (mode === S.cardMode) return;
    S.cardMode = mode;
    if (!mode) return restoreBase();
    if (!S.base) {
      S.base = { id: S.id, time: audio.currentTime, wasPlaying: !audio.paused };
    }
    if (mode === "off") fadeTo(0, FADE_MS, () => audio.pause());
    else if (byId(mode)) {
      fadeOutThen(() => load(mode, { auto: true, loop: true, fadeIn: true }));
    }
  };

  // start the ambient song with the page, then apply the first card's rule
  const AUTOPLAY = false;
  if (AUTOPLAY) load(AMBIENT_ID, { auto: true });

  // applies the selected card's rule now and on every selection change
  function applyActiveCard() {
    const card = document.querySelector(
      ".view.active-view .profile-card.active",
    );
    if (!card) return;
    window.applyCardMusic(card.closest(".profile-item"));
  }
  const hero = document.querySelector(".hero");
  if (hero) {
    new MutationObserver(applyActiveCard).observe(hero, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }
  applyActiveCard();
})();
