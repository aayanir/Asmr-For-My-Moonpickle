/* ==========================================================
   for her — app logic
   No backend, no build step. Everything lives in this file
   plus clips.js. Favorites persist in the browser via
   localStorage since this is a single-user app on her phone.
   ========================================================== */

(function () {
  "use strict";

  const FAV_KEY = "asmr-favorites";

  const PLAYER_PHOTOS = [
    "assets/player-pic-1.jpg",
    "assets/player-pic-2.jpg",
    "assets/player-pic-3.jpg",
    "assets/player-pic-4.jpg",
    "assets/player-pic-5.jpg",
    "assets/player-pic-6.jpg",
    "assets/player-pic-7.jpg",
  ];
  let lastPlayerPhoto = null;

  const state = {
    clips: [],           // full clip list with .favorite attached
    queue: [],            // clip objects currently loaded into the player
    queueIndex: 0,
    shuffle: false,
    loop: false,
    playerReturnTo: "menu",
    currentMood: null,
    timer: { mins: 0, endsAt: null, tickId: null, fadeId: null },
  };

  const el = (id) => document.getElementById(id);
  const audio = el("audio");

  // ---------- persistence ----------
  function loadFavorites() {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch (e) {
      return new Set();
    }
  }
  function saveFavorites() {
    const favIds = state.clips.filter((c) => c.favorite).map((c) => c.id);
    localStorage.setItem(FAV_KEY, JSON.stringify(favIds));
  }

  function init() {
    const favIds = loadFavorites();
    state.clips = CLIPS.map((c) => ({ ...c, favorite: favIds.has(c.id) }));
    bindNav();
    bindOpening();
    bindPlayer();
    bindTimer();
    bindMenuCarousel();
    setPlayIcon(false);
    renderGallery();
  }

  // ---------- screen switching ----------
  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => {
      s.dataset.active = s.dataset.screen === name ? "true" : "false";
    });
  }

  function bindNav() {
    el("btn-start").addEventListener("click", () => showScreen("menu"));

    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.nav;
        if (target === "gallery") renderGallery();
        if (target === "favorites") renderFavorites();
        showScreen(target);
      });
    });

    el("btn-surprise").addEventListener("click", () => {
      const shuffled = shuffleArray(state.clips);
      state.shuffle = true;
      enterPlayer(shuffled, 0, "gallery");
      setShuffleUI(true);
    });

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showScreen(btn.dataset.back));
    });

    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mood = btn.dataset.mood;
        const tagged = state.clips.filter((c) => c.mood === mood);
        if (tagged.length === 0) {
          // nothing tagged for this mood yet — fall back to an empty-state
          // screen instead of jumping into a player with nothing to play
          state.currentMood = mood;
          renderMoodGallery(mood, btn.textContent);
          showScreen("mood-gallery");
          return;
        }
        state.currentMood = mood;
        const shuffled = shuffleArray(tagged);
        state.shuffle = true;
        enterPlayer(shuffled, 0, "moods");
        setShuffleUI(true);
      });
    });

    el("player-back").addEventListener("click", () => {
      stopForNavigation();
      showScreen(state.playerReturnTo);
    });
  }

  function bindOpening() {
    el("btn-love").addEventListener("click", () => {
      el("love-popup").dataset.open = "true";
      el("love-popup").setAttribute("aria-hidden", "false");
    });
    el("btn-love-close").addEventListener("click", () => {
      el("love-popup").dataset.open = "false";
      el("love-popup").setAttribute("aria-hidden", "true");
    });
  }

  // menu screen's two-photo, swipe/drag carousel (Instagram-style paging)
  function bindMenuCarousel() {
    const track = el("menu-carousel-track");
    if (!track) return;
    const dots = document.querySelectorAll("#menu-carousel-dots .dot");
    track.addEventListener("scroll", () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    });
  }

  // ---------- list rendering ----------
  function clipRow(clip, { isPlaying } = {}) {
    const li = document.createElement("li");
    li.className = "clip-row";

    const main = document.createElement("button");
    main.className = "clip-row__main" + (isPlaying ? " is-playing" : "");
    main.innerHTML = `<div class="clip-row__title">${escapeHtml(clip.title)}</div>`;
    main.addEventListener("click", () => onClipTap(clip));

    const heart = document.createElement("button");
    heart.className = "heart-btn" + (clip.favorite ? " is-fav" : "");
    heart.setAttribute("aria-label", "Favorite");
    heart.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" stroke="currentColor" stroke-width="1.6"/></svg>`;
    heart.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleFavorite(clip.id);
    });

    li.appendChild(main);
    li.appendChild(heart);
    return li;
  }

  function currentPlayingId() {
    return state.queue.length ? state.queue[state.queueIndex].id : null;
  }

  function renderGallery() {
    const list = el("gallery-list");
    list.innerHTML = "";
    state.clips.forEach((clip) => {
      list.appendChild(clipRow(clip, { isPlaying: clip.id === currentPlayingId() }));
    });
    el("gallery-count").textContent = state.clips.length ? `${state.clips.length} clips` : "";
  }

  function renderFavorites() {
    const list = el("favorites-list");
    const favs = state.clips.filter((c) => c.favorite);
    list.innerHTML = "";
    favs.forEach((clip) => {
      list.appendChild(clipRow(clip, { isPlaying: clip.id === currentPlayingId() }));
    });
    el("favorites-count").textContent = favs.length ? `${favs.length} clips` : "";
    el("favorites-empty").hidden = favs.length !== 0;
  }

  function renderMoodGallery(mood, label) {
    const list = el("mood-gallery-list");
    const clips = state.clips.filter((c) => c.mood === mood);
    list.innerHTML = "";
    clips.forEach((clip) => {
      list.appendChild(clipRow(clip, { isPlaying: clip.id === currentPlayingId() }));
    });
    el("mood-gallery-title").textContent = label;
    el("mood-gallery-count").textContent = clips.length ? `${clips.length} clips` : "";
    el("mood-gallery-empty").hidden = clips.length !== 0;
  }

  function refreshVisibleLists() {
    renderGallery();
    renderFavorites();
    if (state.currentMood) {
      const btn = document.querySelector(`.mood-btn[data-mood="${state.currentMood}"]`);
      renderMoodGallery(state.currentMood, btn ? btn.textContent : "");
    }
  }

  function toggleFavorite(id) {
    const clip = state.clips.find((c) => c.id === id);
    if (!clip) return;
    clip.favorite = !clip.favorite;
    saveFavorites();
    refreshVisibleLists();
    if (currentPlayingId() === id) updatePlayerHeart(clip);
  }

  // ---------- entering the player ----------
  function onClipTap(clip) {
    // figure out which list we tapped from, so the queue + back target make sense
    const activeScreen = document.querySelector('.screen[data-active="true"]').dataset.screen;
    let queue, returnTo;
    if (activeScreen === "favorites") {
      queue = state.clips.filter((c) => c.favorite);
      returnTo = "favorites";
    } else if (activeScreen === "mood-gallery") {
      queue = state.clips.filter((c) => c.mood === state.currentMood);
      returnTo = "mood-gallery";
    } else {
      queue = state.clips.slice();
      returnTo = "gallery";
    }
    state.shuffle = false;
    setShuffleUI(false);
    const startIndex = queue.findIndex((c) => c.id === clip.id);
    enterPlayer(queue, Math.max(startIndex, 0), returnTo);
  }

  function enterPlayer(queue, startIndex, returnTo) {
    state.queue = queue.slice();
    state.queueIndex = startIndex;
    state.playerReturnTo = returnTo;
    loadAndPlay(state.queueIndex);
    showScreen("player");
  }

  // leaving the player (back button) stops the audio completely
  function stopForNavigation() {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    cancelSleepTimer();
    state.queue = [];
    state.queueIndex = 0;
    el("progress").value = 0;
    el("progress").style.setProperty("--pct", "0%");
    el("time-current").textContent = "0:00";
    refreshVisibleLists();
  }

  // ---------- player ----------
  function bindPlayer() {
    el("btn-play").addEventListener("click", togglePlayPause);
    el("btn-skip-back").addEventListener("click", () => skip(-1));
    el("btn-skip-fwd").addEventListener("click", () => skip(1));
    el("btn-shuffle").addEventListener("click", toggleShuffle);
    el("btn-loop").addEventListener("click", toggleLoop);
    el("player-heart").addEventListener("click", () => {
      const clip = state.queue[state.queueIndex];
      if (clip) toggleFavorite(clip.id);
    });

    el("progress").addEventListener("input", (e) => {
      e.target.style.setProperty("--pct", e.target.value + "%");
      if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("play", () => setPlayIcon(true));
    audio.addEventListener("pause", () => setPlayIcon(false));
    audio.addEventListener("ended", onClipEnded);
  }

  function loadAndPlay(index) {
    const clip = state.queue[index];
    if (!clip) return;
    audio.src = clip.file;
    audio.volume = 1;
    audio.play().catch(() => {
      /* iOS blocks autoplay until a user gesture has happened — the tap
         that opened the player counts, so this is mainly a safety net */
    });
    shufflePlayerPhoto();
    renderPlayerMeta(clip);
    renderUpNext();
    refreshVisibleLists();
  }

  function shufflePlayerPhoto() {
    const img = el("player-photo");
    if (!img || !PLAYER_PHOTOS.length) return;
    let choice = PLAYER_PHOTOS[Math.floor(Math.random() * PLAYER_PHOTOS.length)];
    if (PLAYER_PHOTOS.length > 1) {
      while (choice === lastPlayerPhoto) {
        choice = PLAYER_PHOTOS[Math.floor(Math.random() * PLAYER_PHOTOS.length)];
      }
    }
    lastPlayerPhoto = choice;
    img.style.display = "";
    img.src = choice;
  }

  function renderPlayerMeta(clip) {
    el("player-title").textContent = clip.title;
    updatePlayerHeart(clip);
  }

  function updatePlayerHeart(clip) {
    const heart = el("player-heart");
    heart.classList.toggle("is-fav", !!clip.favorite);
  }

  function togglePlayPause() {
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function setPlayIcon(isPlaying) {
    el("icon-play").classList.toggle("icon-hidden", isPlaying);
    el("icon-pause").classList.toggle("icon-hidden", !isPlaying);
  }

  function updateProgress() {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      el("progress").value = pct;
      el("progress").style.setProperty("--pct", pct + "%");
      el("time-total").textContent = formatTime(audio.duration);
    }
    el("time-current").textContent = formatTime(audio.currentTime);
  }

  function skip(direction) {
    if (!state.queue.length) return;
    let next = state.queueIndex + direction;
    if (next < 0) next = state.queue.length - 1;
    if (next >= state.queue.length) next = 0;
    state.queueIndex = next;
    loadAndPlay(next);
  }

  function onClipEnded() {
    if (state.loop) {
      audio.currentTime = 0;
      audio.play();
    } else {
      skip(1);
    }
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    setShuffleUI(state.shuffle);
    if (state.shuffle) {
      const current = state.queue[state.queueIndex];
      const rest = shuffleArray(state.queue.filter((c) => c.id !== current.id));
      state.queue = [current, ...rest];
      state.queueIndex = 0;
      renderUpNext();
    }
  }
  function setShuffleUI(active) {
    el("btn-shuffle").classList.toggle("is-active", active);
  }

  function toggleLoop() {
    state.loop = !state.loop;
    el("btn-loop").classList.toggle("is-active", state.loop);
  }

  function renderUpNext() {
    const list = el("upnext-list");
    list.innerHTML = "";
    state.queue.forEach((clip, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "upnext__row" + (i === state.queueIndex ? " is-current" : "");
      btn.textContent = clip.title;
      btn.addEventListener("click", () => {
        state.queueIndex = i;
        loadAndPlay(i);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // ---------- sleep timer ----------
  function bindTimer() {
    el("btn-timer").addEventListener("click", () => {
      el("timer-sheet").dataset.open = "true";
    });
    el("btn-timer-close").addEventListener("click", () => {
      el("timer-sheet").dataset.open = "false";
    });
    document.querySelectorAll("#timer-options .pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        setSleepTimer(parseInt(btn.dataset.mins, 10));
        document.querySelectorAll("#timer-options .pill").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        el("timer-sheet").dataset.open = "false";
      });
    });
  }

  function setSleepTimer(mins) {
    clearTimeout(state.timer.tickId);
    state.timer.mins = mins;
    if (mins === 0) {
      state.timer.endsAt = null;
      el("timer-badge").hidden = true;
      return;
    }
    state.timer.endsAt = Date.now() + mins * 60000;
    el("timer-badge").hidden = false;
    tickTimerBadge();
  }

  function tickTimerBadge() {
    if (!state.timer.endsAt) return;
    const remainingMs = state.timer.endsAt - Date.now();
    if (remainingMs <= 0) {
      stopFromTimer();
      return;
    }
    el("timer-badge").textContent = Math.max(1, Math.round(remainingMs / 60000));
    state.timer.tickId = setTimeout(tickTimerBadge, Math.min(15000, remainingMs));
  }

  function stopFromTimer() {
    el("timer-badge").hidden = true;
    document.querySelectorAll("#timer-options .pill").forEach((b) => b.classList.remove("is-active"));
    state.timer.endsAt = null;
    audio.pause();
  }

  function cancelSleepTimer() {
    clearTimeout(state.timer.tickId);
    state.timer.endsAt = null;
    el("timer-badge").hidden = true;
    document.querySelectorAll("#timer-options .pill").forEach((b) => b.classList.remove("is-active"));
  }

  // ---------- helpers ----------
  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
