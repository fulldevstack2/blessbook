export interface Photo {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly credit: string;
}

function asset(file: string): string {
  return `${import.meta.env.BASE_URL}dennis/${file}`;
}

function film(file: string): string {
  return `${import.meta.env.BASE_URL}film/${file}`;
}

function audio(file: string): string {
  return `${import.meta.env.BASE_URL}audio/${file}`;
}

/**
 * Provenance matters here. Everything below is Dennis's own material: press
 * photographs from his own site, and frames from his own concert film and
 * documentary. The first image is additionally CC0. Credits are rendered on the
 * page rather than buried in this file.
 */
export const photos = {
  live: {
    src: asset("dennis-phoenix-live.webp"),
    width: 800,
    height: 800,
    alt: "Dennis Lau mid-performance, playing the gold Phoenix electric violin under stage light.",
    credit: "Mosaic Music Entertainment · CC0",
  },
  /** A tight crop of the same CC0 frame, for places that need a face rather than a scene. */
  portrait: {
    src: asset("dennis-portrait-crop.webp"),
    width: 400,
    height: 400,
    alt: "Dennis Lau in close-up, eyes closed, mid-phrase on the gold Phoenix violin.",
    credit: "Mosaic Music Entertainment · CC0",
  },
  /** The official press portrait — larger and sharper than the CC0 crop above. */
  press: {
    src: asset("dennis-press.webp"),
    width: 1000,
    height: 1000,
    alt: "Dennis Lau performing with the gold Phoenix electric violin.",
    credit: "Mosaic Music Entertainment",
  },
  violin: {
    src: asset("violin-phoenix.webp"),
    width: 1600,
    height: 1067,
    alt: "The Phoenix violin: a six-string electric violin plated in 24K gold and carved as a bird's wing.",
    credit: "Instrument by Alistair Hay, Emerald Guitars",
  },
  seated: {
    src: asset("dennis-seated.webp"),
    width: 1000,
    height: 1123,
    alt: "Dennis Lau seated in profile, holding an acoustic violin in one hand and an electric violin in the other.",
    credit: "Dennis Lau press",
  },
  cutout: {
    src: asset("dennis-cutout.webp"),
    width: 1000,
    height: 1500,
    alt: "Dennis Lau in a black suit, caught mid-step.",
    credit: "Dennis Lau press",
  },
  album: {
    src: asset("album-the-journey.webp"),
    width: 800,
    height: 800,
    alt: "Cover artwork for The Journey, Dennis Lau's 2015 album.",
    credit: "The Journey, 2015",
  },

  /* ---- frames from his own films, harvested for this site ---- */

  /** The hero frame: him mid-phrase on the gold violin, three thousand people in the dark. */
  goldViolin: {
    src: asset("live-gold-violin.webp"),
    width: 1920,
    height: 1080,
    alt: "Dennis Lau playing the gold six-string Phoenix violin on stage, in a gold-frogged jacket, against a field of blue stage light.",
    credit: "The Phoenix Rising Concert, 2016",
  },
  /** Him against the flame-phoenix on the LED wall — the concert's own image of itself. */
  stagePhoenix: {
    src: asset("stage-phoenix.webp"),
    width: 1920,
    height: 1080,
    alt: "A silhouette of Dennis Lau on stage in front of a wall of flame shaped like a rising phoenix.",
    credit: "The Phoenix Rising Concert, 2016",
  },
  /** Three thousand seats, held up as light. */
  crowd: {
    src: asset("crowd.webp"),
    width: 1600,
    height: 900,
    alt: "A three-thousand-seat hall in darkness, the audience holding up lights.",
    credit: "The Phoenix Rising Concert, 2016",
  },
  liveBlue: {
    src: asset("live-blue.webp"),
    width: 1600,
    height: 900,
    alt: "Dennis Lau playing under blue light, the gold violin catching the beam.",
    credit: "The Phoenix Rising Concert, 2016",
  },
  /** The quietest image on the site, and the most useful one. */
  silhouette: {
    src: asset("silhouette-sky.webp"),
    width: 1920,
    height: 810,
    alt: "Dennis Lau in silhouette against a bright, clouded sky, bow drawn across the violin.",
    credit: "The Phoenix Rising, a film by Eugene Low",
  },
  portraitMono: {
    src: asset("portrait-mono.webp"),
    width: 1400,
    height: 591,
    alt: "Dennis Lau in black and white, speaking quietly, half his face in shadow.",
    credit: "The Phoenix Rising, a film by Eugene Low",
  },
  portraitMonoTwo: {
    src: asset("portrait-mono-2.webp"),
    width: 1400,
    height: 591,
    alt: "Dennis Lau in black and white, looking down, mid-thought.",
    credit: "The Phoenix Rising, a film by Eugene Low",
  },
  posterChosen: {
    src: asset("poster-the-chosen.webp"),
    width: 921,
    height: 682,
    alt: "Poster for The Chosen, Dennis Lau's 2019 concert.",
    credit: "The Chosen, 2019",
  },
} as const satisfies Record<string, Photo>;

/**
 * His own 2021 showreel, self-hosted. The loop is silent so it can play behind
 * a hero without asking permission; the full reel carries its own sound and
 * loads only when asked for.
 */
export const showreel = {
  loop: film("showreel-loop.mp4"),
  full: film("showreel.mp4"),
  poster: film("showreel-poster.webp"),
  seconds: 67,
  title: "Showreel",
  note: "A minute of what a room sounds like when he is in it.",
  credit: "Dennis Lau showreel, 2021",
} as const;

/**
 * Forty seconds of The Journey, played live on the Phoenix at the 2016 concert.
 * This is the sound the heroes are drawn by — the site's motion comes from his
 * playing rather than from a timer.
 */
export const livePhrase = {
  src: audio("the-journey-live.mp3"),
  seconds: 40,
  title: "The Journey",
  where: "Live at The Phoenix Rising, 2016",
  credit: "The Phoenix Rising Concert, 2016",
} as const;
