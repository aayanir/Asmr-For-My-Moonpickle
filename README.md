# for her — setup & deploy

A private, single-page web app. No account, no backend, no App Store — just a link she adds to her home screen. Everything below is written so you can do it without touching code, but the actual code lives in `clips.js` if you want to peek.

## 1. What's in this folder

```
index.html        the whole app (don't need to edit this)
style.css          colors, fonts, layout (edit if you want to change the look)
app.js             the logic (don't need to edit this)
clips.js           <-- THIS is where you add your recordings
assets/
  opening-bg.jpg    background photo for the opening screen (add this)
  menu-bg.jpg       background photo for the main menu (add this)
  audio/            put your mp3 files in here
```

The app comes loaded with your 43 real clips (already converted to 64kbps mono MP3s in `assets/audio/`), with their mood tags and gallery order set.

## 2. Add your content

**Photos:** `assets/opening-bg.jpg` is the full-screen opening photo. The main menu uses two photos in a swipeable carousel — `assets/menu-pic-1.jpg` and `assets/menu-pic-2.jpg`. The Player has its own set of seven — `assets/player-pic-1.jpg` through `assets/player-pic-7.jpg` — one of which shows above the controls and shuffles to a different one each time the clip changes. All ten are already in place from what you sent over. To swap any of them later, just replace the file with the same name (or add more `player-pic-N.jpg` files and list them in the `PLAYER_PHOTOS` array near the top of `app.js`).

**Heading text & "I love you" message:** open `index.html`, find these two lines near the top and change the words between the tags:

```html
<h1 class="opening-heading" id="opening-heading">for the nights i can't be there</h1>
...
<p id="love-popup-text">You fall asleep in my voice, and I fall asleep knowing that. That's the whole idea behind this.</p>
```

**Adding more clips later:** open `clips.js` — it's a plain list, one line per clip:

```js
{ id: "c044", title: "Your Title Here", file: "assets/audio/your-title-here.mp3", mood: null },
```

1. Convert the new voice memo to MP3 (64kbps, mono) and put it in `assets/audio/`. Use a lowercase-with-hyphens filename.
2. Add a line to the `CLIPS` list in `clips.js` with the next unused `id`, the title exactly as you want her to see it, the file path, and a `mood`.
3. `mood` must be exactly one of: `"tired"`, `"love"`, `"reminiscing"`, or `null` if the clip shouldn't show up under "When You Need Me."

**Order is handled for you.** A clip titled `Intro` always goes first, and clips titled `<name> pt 1`, `<name> pt 2`, `<name> pt 3`... always stay together in part order, right where the first of them sits. So if you add `Eid pt 2` anywhere in the list, it jumps to sit right after `Eid pt 1`.

**Audio export settings** (from the original plan): MP3, 64–96kbps, mono unless you recorded in stereo/binaural for the ASMR effect. Keeps the whole ~100-clip library under ~1GB, which is nowhere near GitHub Pages' free bandwidth limits even for heavy nightly use.

## 3. Colors / fonts (optional)

Everything visual lives in `style.css` at the top, in the `:root { }` block:

```css
--sage: #7f9c7a;   /* primary accent — most of the app, hearts, active states */
--pink: #e3a3ae;    /* secondary accent — opening screen + main menu buttons */
--ink: #2b2a26;      /* main text color */
```

Change the hex values and the whole app re-colors itself. No need to touch anything below that block.

## 4. Deploy it for free (GitHub Pages)

1. Create a free GitHub account if you don't have one, and a **new private-by-default repo isn't required to be public for Pages to work on the free tier — but note GitHub Pages sites are publicly accessible by URL** (not listed anywhere, but not password protected either — anyone with the exact link could open it). If that matters to you, keep the link itself private rather than relying on the repo.
2. Create a new repository (e.g. `for-her`).
3. Upload this whole folder's contents to the repo (drag-and-drop works on github.com, or use GitHub Desktop / `git push` if you're comfortable with git).
4. In the repo, go to **Settings → Pages**.
5. Under "Build and deployment," set **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)`. Save.
6. GitHub gives you a URL like `https://yourusername.github.io/for-her/` — usually live within a minute or two.

## 5. Get it onto her phone like a real app

1. Send her the link (text, whichever way).
2. She opens it once in Safari.
3. Tap the Share icon → **Add to Home Screen**.
4. It now sits on her home screen with an icon, opens fullscreen, no browser bar, no visible URL.

That's it — from her side it just looks like an app that's always been there.

## Notes

- No login, no database — favorites are saved in the phone's local browser storage, tied to that one device. If she ever clears Safari's data or switches phones, favorites reset (the clips themselves don't disappear, just the hearts).
- Audio loads per-clip, not all at once, so the gallery stays fast even with 100 clips.
- Everything works offline-first in the sense that there's no server to go down — GitHub Pages just serves static files.
