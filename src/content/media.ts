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

/**
 * Provenance matters here: the first image is CC0 and free to use anywhere, the
 * rest are Dennis Lau's own press photographs. Credits are rendered on the page
 * rather than buried in this file.
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
    credit: "Instrument by Alistair Hay",
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
} as const satisfies Record<string, Photo>;
