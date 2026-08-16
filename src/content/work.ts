/**
 * Real commissioned work. Every track here was written and produced by Dennis
 * for a paying client, which is the whole argument: a site selling commissioned
 * songs should let you hear commissioned songs.
 *
 * Clients are named where the client is a brand or a business, because that is
 * credit rather than a roster. Where the client is a performer they are
 * described, not named — "no other artist" is a standing constraint, and a wall
 * of singers' names would read as exactly the roster this site refuses to have.
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
    title: "Shark V3 · Best of the Best",
    src: audio("shark-v3.mp3"),
    seconds: 98.7,
    kind: "Game trailer",
    note: "Cinematic trailer score for a suspense game by Ammo Box Studios.",
  },
  {
    id: "corsa",
    title: "One Corsa V1",
    src: audio("one-corsa.mp3"),
    seconds: 83.5,
    kind: "Brand",
    note: "Brand music for ONE CORSA, one of Malaysia's largest super and luxury car importers.",
  },
  {
    id: "born",
    title: "Born for a Reason",
    src: audio("born-for-a-reason.mp3"),
    seconds: 272.3,
    kind: "Milestone",
    note: "A song written for a boy's third birthday, to run under a slideshow of his first three years.",
  },
  {
    id: "wall",
    title: "The Great Wall V3",
    src: audio("great-wall-v3.mp3"),
    seconds: 172.6,
    kind: "Entrance theme",
    note: "An epic opening theme, commissioned as one woman's entrance music.",
  },
  {
    id: "wall-zh",
    title: "The Great Wall · 中文版",
    src: audio("great-wall-zh.mp3"),
    seconds: 183.2,
    kind: "Entrance theme",
    note: "The same commission again in Mandarin, written so the meaning survives the change of language.",
  },
  {
    id: "unmute",
    title: "Unmute (Chloe) · Demo V4",
    src: audio("unmute-chloe.mp3"),
    seconds: 211.0,
    kind: "Pop R&B",
    note: "A Taiwanese pop R&B demo. Melody and structure by Dennis, produced up from a bare vocal idea.",
  },
  {
    id: "suen",
    title: "Suen · Demo V4",
    src: audio("suen-demo.mp3"),
    seconds: 254.9,
    kind: "Mandopop",
    note: "Written for the champion of The Voice Asia.",
  },
  {
    id: "vanessa",
    title: "由我定 · Verse to Chorus",
    src: audio("vanessa-you-wo-ding.mp3"),
    seconds: 203.2,
    kind: "Mandopop",
    note: "A single written for the first runner-up of Sing! China, Malaysia edition.",
  },
  {
    id: "ballad",
    title: "Malay / Indonesian Ballad · Chorus",
    src: audio("malay-indon-ballad.mp3"),
    seconds: 71.9,
    kind: "Ballad",
    note: "Music and lyrics both by Dennis. Written in a register that plays across two countries.",
  },
  {
    id: "tiktok",
    title: "Free Shipping, Fun Shopping",
    src: audio("free-shipping-fun-shopping.mp3"),
    seconds: 148.0,
    kind: "Campaign",
    note: "A TikTok Shop campaign demo, built on dangdut rhythm for a Malay audience.",
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
