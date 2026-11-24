/*
  CLIPS — this is the only file you need to touch to add recordings.

  To add a new clip, put the mp3 in assets/audio/ and add one line below:

    { id: "c044", title: "Your Title Here", file: "assets/audio/your-title-here.mp3", mood: null },

  - title: shows in the app exactly as typed here (spaces, capitals, punctuation all kept).
  - file: the mp3's path. Filenames are lowercase-with-hyphens just to be web-safe.
  - id: unique, just keep counting up.
  - mood: "tired" | "love" | "reminiscing" | null   (null = not under "When You Need Me")

  ORDER: clips show in the Gallery in the order listed. Two rules are applied
  automatically at the bottom of this file, so you never have to hand-sort:
    1. A clip titled "Intro" is always first.
    2. Clips titled "<name> pt 1", "<name> pt 2", "<name> pt 3"... are always kept
       together, in part order, at the spot where the first of them appears.
       (So if you add "Eid pt 2" anywhere — even the very bottom — it jumps to
       sit right after "Eid pt 1".)
*/

const CLIPS = [
  { id: "c001", title: "Intro", file: "assets/audio/intro.mp3", mood: null },
  { id: "c002", title: "Coconut", file: "assets/audio/coconut.mp3", mood: "tired" },
  { id: "c003", title: "I love you just because", file: "assets/audio/i-love-you-just-because.mp3", mood: "love" },
  { id: "c004", title: "Sundarban", file: "assets/audio/sundarban.mp3", mood: null },
  { id: "c005", title: "Henna pt 1", file: "assets/audio/henna-pt-1.mp3", mood: "love" },
  { id: "c006", title: "Henna pt 2", file: "assets/audio/henna-pt-2.mp3", mood: "love" },
  { id: "c007", title: "Forgotten jokes", file: "assets/audio/forgotten-jokes.mp3", mood: "reminiscing" },
  { id: "c008", title: "Beard", file: "assets/audio/beard.mp3", mood: null },
  { id: "c009", title: "Big rock", file: "assets/audio/big-rock.mp3", mood: "love" },
  { id: "c010", title: "Batman", file: "assets/audio/batman.mp3", mood: "tired" },
  { id: "c011", title: "Your nanu", file: "assets/audio/your-nanu.mp3", mood: null },
  { id: "c012", title: "Strawberry moon", file: "assets/audio/strawberry-moon.mp3", mood: "love" },
  { id: "c013", title: "Easter show", file: "assets/audio/easter-show.mp3", mood: null },
  { id: "c014", title: "Meeting you", file: "assets/audio/meeting-you.mp3", mood: "love" },
  { id: "c015", title: "Interview pt 1", file: "assets/audio/interview-pt-1.mp3", mood: "love" },
  { id: "c016", title: "Interview pt 2", file: "assets/audio/interview-pt-2.mp3", mood: "love" },
  { id: "c017", title: "Table", file: "assets/audio/table.mp3", mood: null },
  { id: "c018", title: "6-6-2024", file: "assets/audio/6-6-2024.mp3", mood: "reminiscing" },
  { id: "c019", title: "Obsessed hairstylist", file: "assets/audio/obsessed-hairstylist.mp3", mood: "tired" },
  { id: "c020", title: "Necklace", file: "assets/audio/necklace.mp3", mood: "love" },
  { id: "c021", title: "Exorcism", file: "assets/audio/exorcism.mp3", mood: null },
  { id: "c022", title: "Chelsea", file: "assets/audio/chelsea.mp3", mood: "tired" },
  { id: "c023", title: "How I fell and never stopped", file: "assets/audio/how-i-fell-and-never-stopped.mp3", mood: "love" },
  { id: "c024", title: "Dawats as a married couple", file: "assets/audio/dawats-as-a-married-couple.mp3", mood: null },
  { id: "c025", title: "My journey with watches", file: "assets/audio/my-journey-with-watches.mp3", mood: "tired" },
  { id: "c026", title: "I’m so proud of you", file: "assets/audio/im-so-proud-of-you.mp3", mood: "love" },
  { id: "c027", title: "Nicknames", file: "assets/audio/nicknames.mp3", mood: null },
  { id: "c028", title: "Akhtar Khan", file: "assets/audio/akhtar-khan.mp3", mood: "reminiscing" },
  { id: "c029", title: "Triple happiness", file: "assets/audio/triple-happiness.mp3", mood: null },
  { id: "c030", title: "Fuck scrabble", file: "assets/audio/fuck-scrabble.mp3", mood: "tired" },
  { id: "c031", title: "Belly piercing", file: "assets/audio/belly-piercing.mp3", mood: "love" },
  { id: "c032", title: "Clothes", file: "assets/audio/clothes.mp3", mood: null },
  { id: "c033", title: "Eid pt 1", file: "assets/audio/eid-pt-1.mp3", mood: null },
  { id: "c034", title: "Confessions and Colour coding", file: "assets/audio/confessions-and-colour-coding.mp3", mood: "love" },
  { id: "c035", title: "Screen recordings", file: "assets/audio/screen-recordings.mp3", mood: null },
  { id: "c036", title: "Ashwagandha", file: "assets/audio/ashwagandha.mp3", mood: "reminiscing" },
  { id: "c037", title: "Your father", file: "assets/audio/your-father.mp3", mood: null },
  { id: "c038", title: "Don toliver ramble", file: "assets/audio/don-toliver-ramble.mp3", mood: "tired" },
  { id: "c039", title: "Tattoo", file: "assets/audio/tattoo.mp3", mood: null },
  { id: "c040", title: "Sharnila’s birthday", file: "assets/audio/sharnilas-birthday.mp3", mood: "reminiscing" },
  { id: "c041", title: "Building this project", file: "assets/audio/building-this-project.mp3", mood: "tired" },
  { id: "c042", title: "Infestation of my music taste", file: "assets/audio/infestation-of-my-music-taste.mp3", mood: null },
  { id: "c043", title: "A month of you", file: "assets/audio/a-month-of-you.mp3", mood: null },
];

// ---- automatic ordering rules (see note at top) ----
(function orderClips() {
  const partRe = /^(.*?)\s+pt\.?\s*(\d+)\s*$/i;
  const parse = (c) => {
    const m = c.title.match(partRe);
    return m ? { base: m[1].trim().toLowerCase(), part: parseInt(m[2], 10) } : null;
  };

  const groups = new Map();
  CLIPS.forEach((c) => {
    const p = parse(c);
    if (!p) return;
    if (!groups.has(p.base)) groups.set(p.base, []);
    groups.get(p.base).push({ clip: c, part: p.part });
  });
  groups.forEach((arr) => arr.sort((a, b) => a.part - b.part));

  const placed = new Set();
  const out = [];
  CLIPS.forEach((c) => {
    if (placed.has(c.id)) return;
    const p = parse(c);
    if (p) {
      groups.get(p.base).forEach(({ clip }) => { out.push(clip); placed.add(clip.id); });
    } else {
      out.push(c);
      placed.add(c.id);
    }
  });

  const introAt = out.findIndex((c) => c.title.trim().toLowerCase() === "intro");
  if (introAt > 0) out.unshift(out.splice(introAt, 1)[0]);

  CLIPS.splice(0, CLIPS.length, ...out);
})();
