import { useEffect, useState } from "react";

/**
 * Whether the faces a piece of type actually needs have arrived.
 *
 * Every concept arrives on a loader that is almost entirely one line of set
 * type: his name in Italiana, 刘凯彦 in a brush script, the name again in
 * Fraunces. Rendered before the webfont lands, that line paints in Times New
 * Roman and then swaps under the reader — which is the single most common way an
 * expensive site announces itself as a cheap one, and it happens in the first
 * half second, before anything else has had a chance to speak.
 *
 * `document.fonts.ready` on its own is not enough here: it resolves once the
 * *currently pending* loads finish, and each concept injects its own stylesheet
 * after mount, so it can settle before those faces have even been requested.
 * Asking for each face by name starts the load, and then `ready` means what it
 * says.
 *
 * Callers pass CSS font shorthands, e.g. `'400 64px "Italiana"'`. Anything the
 * browser cannot parse is skipped rather than throwing.
 */
export function useTypeset(faces: readonly string[]): boolean {
  const key = faces.join("|");

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;

    const fonts = document.fonts;
    if (!fonts) {
      setReady(true);
      return;
    }

    const asked = faces.map((face) => fonts.load(face).catch(() => undefined));

    void Promise.all(asked)
      .then(() => fonts.ready)
      .then(() => {
        if (live) setReady(true);
      })
      .catch(() => {
        if (live) setReady(true);
      });

    /* A face that never arrives must not hold the page hostage. The loader has
       its own floor anyway; this only decides whether the type is shown in the
       right face or in whatever the browser had to hand. */
    const giveUp = window.setTimeout(() => {
      if (live) setReady(true);
    }, 2500);

    return () => {
      live = false;
      window.clearTimeout(giveUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ready;
}
