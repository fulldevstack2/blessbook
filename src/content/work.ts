/**
 * Real commissioned work. Every track here was written and produced by Dennis
 * for a paying client, which is the whole argument: a site selling commissioned
 * songs should let you hear commissioned songs.
 *
 * Clients are named where the client is a brand or a business, because that is
 * credit rather than a roster.
 *
 * Performers used to be described rather than named here, on the grounds that a
 * wall of singers' names reads as a talent roster. Dennis's own labels name
 * them — Sara Yeong, Chloe Yu, Wen Suen, Vanessa Reynauld — and that is his call
 * to make: they are his credits and the specificity is the point. The labels
 * below are his, near enough verbatim; do not generalise them back.
 */

export interface Demo {
  readonly id: string;
  readonly title: string;
  readonly src: string;
  /** Seconds. Measured from the files, not transcribed from a spreadsheet. */
  readonly seconds: number;
  /** The kind of ask. Together these prove the range that "any song" claims. */
  readonly kind: string;
  readonly note: string;
}

function audio(file: string): string {
  return `${import.meta.env.BASE_URL}audio/${file}`;
}

export function timecode(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * Ordered to open on range rather than on length: a game trailer, then a car
 * brand, then a child's birthday. Three prompts nobody would guess share an
 * author.
 */
export const demos: readonly Demo[] = [
  {
    id: "shark",
    title: "SHARK",
    src: audio("shark-v3.mp3"),
    seconds: 98.7,
    kind: "Game trailer",
    note: "Virtual game trailer, for a suspense title by Ammo Box Studios.",
  },
  {
    id: "corsa",
    title: "ONE CORSA",
    src: audio("one-corsa.mp3"),
    seconds: 83.5,
    kind: "Commercial",
    note: "Commercial song for a premium and super car importer.",
  },
  {
    id: "born",
    title: "BORN FOR A REASON",
    src: audio("born-for-a-reason.mp3"),
    seconds: 272.3,
    kind: "Birthday",
    note: "A father's dedication to his three-year-old son's birthday.",
  },
  {
    id: "wall",
    title: "THE GREAT WALL",
    src: audio("great-wall-v3.mp3"),
    seconds: 172.6,
    kind: "Entrance theme",
    note: "Grand entrance theme for the marketing guru Sara Yeong.",
  },
  {
    id: "wall-zh",
    title: "THE GREAT WALL · \u4e2d\u6587\u7248",
    src: audio("great-wall-zh.mp3"),
    seconds: 183.2,
    kind: "Entrance theme",
    note: "The Chinese version of Sara Yeong's grand entrance theme.",
  },
  {
    id: "unmute",
    title: "UNMUTE",
    src: audio("unmute-chloe.mp3"),
    seconds: 211.0,
    kind: "Artiste demo",
    note: "Chloe Yu's artiste demo.",
  },
  {
    id: "suen",
    title: "TIME WILL SING | \u65f6\u95f4\u4f1a\u5531\u6b4c",
    src: audio("suen-demo.mp3"),
    seconds: 254.9,
    kind: "Artiste demo",
    note: "Artiste demo for Wen Suen, champion of The Voice Asia.",
  },
  {
    id: "vanessa",
    title: "\u7531\u6211\u5b9a",
    src: audio("vanessa-you-wo-ding.mp3"),
    seconds: 203.2,
    kind: "Artiste demo",
    note: "Artiste demo for Vanessa Reynauld, first runner-up of Sing! China Malaysia.",
  },
  {
    id: "ballad",
    title: "Malay / Indonesian Love Ballad",
    src: audio("malay-indon-ballad.mp3"),
    seconds: 71.9,
    kind: "Chorus demo",
    note: "Music and lyrics both by Dennis, in a register that plays across two countries.",
  },
  {
    id: "tiktok",
    title: "FREE SHIPPING, FUN SHOPPING",
    src: audio("free-shipping-fun-shopping.mp3"),
    seconds: 148.0,
    kind: "Campaign theme",
    note: "TikTok Shop marketing campaign theme song.",
  },
];

export interface Film {
  readonly id: string;
  /** YouTube id. Nothing from YouTube loads until the poster is clicked. */
  readonly youtube: string;
  readonly title: string;
  readonly note: string;
  readonly poster: string;
}

function poster(file: string): string {
  return `${import.meta.env.BASE_URL}films/${file}`;
}

export const films: readonly Film[] = [
  {
    id: "denza",
    youtube: "FtXeR3TTtbE",
    title: "DENZA Z9 GT · launch at KLCC",
    note: "Music written, produced and then performed live for the car's reveal.",
    poster: poster("denza.webp"),
  },
  {
    id: "seafood",
    youtube: "QGlYj8CrJ6E",
    title: "ONE SEAFOOD · six Michelin-starred chefs",
    note: "A score for a single evening's dinner, and the film cut around it.",
    poster: poster("seafood.webp"),
  },
  {
    id: "theo",
    youtube: "Dq52GzlIaAQ",
    title: "天赐 · Heaven's Gift",
    note: "A song written for one child, and played at his birthday.",
    poster: poster("theo.webp"),
  },
];

/**
 * Everything else with his name on it.
 *
 * The three films above are the examples; this is the catalogue behind them, and
 * it is here because the argument the whole site makes — that he has done this
 * many times, for very different people — is only as strong as the list is long.
 * The labels are Dennis's own.
 *
 * Every id and link in here was resolved against the platform before it was
 * written down, and two of the links he sent were duplicates of the line above
 * them: the original Makan Cintaku for Nongshim, and ESOK for Teach For
 * Malaysia. Both are missing rather than guessed. See the note in HANDOFF.md.
 */
export interface Work {
  readonly id: string;
  /** Where it lives. Changes the wording of the link and nothing else. */
  readonly on: "YouTube" | "Spotify" | "Instagram";
  readonly href: string;
  readonly title: string;
  /** Who it was for, and what for. */
  readonly note: string;
}

export const catalogue: readonly Work[] = [
  {
    id: "glory",
    on: "YouTube",
    href: "https://youtu.be/8vBQ-BdAbjA",
    title: "GLORY",
    note: "With Datuk Syafinaz Selamat.",
  },
  {
    id: "wanna-be-free-live",
    on: "YouTube",
    href: "https://youtu.be/CJbWBhn0y2k",
    title: "I Wanna Be Free",
    note: "With Jeryl Lee \u674e\u4f69\u73b2, live at The Chosen.",
  },
  {
    id: "wanna-be-free",
    on: "YouTube",
    href: "https://youtu.be/gPVI1KYpr1o",
    title: "I Wanna Be Free",
    note: "Jeryl Lee \u674e\u4f69\u73b2, for #VoiceBeyondHorizon.",
  },
  {
    id: "abadi-kita",
    on: "YouTube",
    href: "https://youtu.be/VVHZ1DOIj18",
    title: "ABADI KITA",
    note: "Written for Aisyah Aziz, the Singaporean artiste.",
  },
  {
    id: "nugget",
    on: "YouTube",
    href: "https://youtu.be/Piki1mKblAc",
    title: "Nugget",
    note: "First single for Sharnaaz Ahmad, the Malaysian A-list actor.",
  },
  {
    id: "nugget-acoustic",
    on: "YouTube",
    href: "https://youtu.be/zrS48blMetg",
    title: "Nugget \u00b7 acoustic",
    note: "One take, with Sharnaaz Ahmad.",
  },
  {
    id: "makan-cintaku-acoustic",
    on: "YouTube",
    href: "https://youtu.be/N0UUpt0RFTc",
    title: "Makan Cintaku \u00b7 acoustic",
    note: "With Khai Bahar and Wany Hasrita.",
  },
  {
    id: "jadi-tak-keruan",
    on: "YouTube",
    href: "https://youtu.be/HFtwimMVMz4",
    title: "JADI TAK KERUAN",
    note: "First single for Fara Dolhadi.",
  },
  {
    id: "light-home",
    on: "YouTube",
    href: "https://youtu.be/ecuaYtAmwxs",
    title: "The Light Home \uff5c \u56de\u5bb6\u7684\u5149",
    note: "Chinese New Year theme song, 2026.",
  },
  {
    id: "beauty-in-the-pot",
    on: "YouTube",
    href: "https://youtu.be/jKVLyHmMBaY",
    title: "\u6211\u60f3\u5bf9\u4f60\u8bf4",
    note: "Theme song for the Beauty in the Pot hotpot chain.",
  },
  {
    id: "safe-harbour",
    on: "YouTube",
    href: "https://youtu.be/mFGa7RPHnW0",
    title: "\u907f\u98ce\u6e2f",
    note: "For Daniel Tan: a groom's dedication to his bride.",
  },
  {
    id: "one-corsa-film",
    on: "Instagram",
    href: "https://www.instagram.com/p/DcVHIZ0TSAl/",
    title: "ONE CORSA",
    note: "The commercial the song was written for.",
  },
  {
    id: "phoenix-album",
    on: "Spotify",
    href: "https://open.spotify.com/album/22hh21F0ImbOAnuIPiXjO1",
    title: "The Phoenix Rising Concert",
    note: "The 2016 concert, recorded live.",
  },
  {
    id: "chosen-album",
    on: "Spotify",
    href: "https://open.spotify.com/album/2Pp6yeK5T7teXzoFHbMzM4",
    title: "The Chosen Concert",
    note: "The 2019 concert, recorded live.",
  },
];

export interface Social {
  readonly label: string;
  readonly handle: string;
  readonly href: string;
}

export const socials: readonly Social[] = [
  { label: "Site", handle: "dennislau.thechosen.io", href: "https://dennislau.thechosen.io" },
  { label: "Instagram", handle: "@dennisviolin", href: "https://instagram.com/dennisviolin" },
  { label: "YouTube", handle: "DennisLauTV", href: "https://www.youtube.com/@DennisLauTV" },
  /* His own page, not his management's. It pointed at
     MosaicMusicEntertainment, which is the company that books him — a real
     account, and the wrong one to put under his name. */
  {
    label: "Facebook",
    handle: "dennislauviolin",
    href: "https://facebook.com/dennislauviolin",
  },
  { label: "X", handle: "@dennislauviolin", href: "https://x.com/dennislauviolin" },
];

export interface Word {
  readonly text: string;
  readonly who: string;
  readonly when: string;
  readonly what: string;
}

/**
 * Clients, not performers — this is the one place other voices belong. All four
 * are published, attributed testimonials from his own site, which is why they
 * are named. The two anonymous commission quotes that used to sit here came
 * from the previous project and were never verified, so they are gone.
 */
export const words: readonly Word[] = [
  {
    text: "You are the pride, not only to the university, but to the nation, a shining ambassador to the music industry.",
    who: "Dato' Dr Peter Ng",
    when: "Chairman, UCSI Group",
    what: "On his record",
  },
  {
    text: "Never fails to amaze me with his unique blend and skill of putting his music abilities together.",
    who: "Winnie Loo",
    when: "Founder, A Cut Above",
    what: "On his playing",
  },
  {
    text: "The new generation of artist management, specialising in music-inspired performers, led by the ever talented Dennis Lau.",
    who: "Soren Ravn",
    when: "Managing Director, Carlsberg Malaysia",
    what: "On working with him",
  },
  {
    text: "A great one-stop, worry-free solution, with a myriad of talents to suit the right mood.",
    who: "Yuri Wong",
    when: "Founder, The Factory Music Studio",
    what: "On the work",
  },
];
