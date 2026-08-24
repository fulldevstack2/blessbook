import { useMemo, useState } from "react";
import { brief, type BriefField } from "../content/commission";

/**
 * The creative brief, and what happens to it.
 *
 * There is no account, no cart and no checkout on this site, because there is
 * none in the real business either. Someone fills this in, Dennis's team reads
 * it and replies from their own inbox, and the sample, the payment details and
 * the finished song all travel in that same thread. The whole product is a
 * conversation; this starts it with everything he needs already said.
 *
 * It is generic over the schema in `content/commission.ts` on purpose. Twenty
 * questions written out by hand three times, once per concept, is three places
 * for the twenty-first to be forgotten.
 *
 * **Nothing is sent.** `deliver` waits a moment and reports success, which is
 * what a mockup should do. To make it real, replace its body with a POST to
 * whatever endpoint mails the team; `flatten` below already renders the answers
 * as the plain-text brief a human would want to read, so the endpoint needs to
 * do nothing but send it.
 */

export type Answer = string | readonly string[];
export type Answers = Readonly<Record<string, Answer>>;
export type BriefStage = "idle" | "sending" | "sent";

/** Where a field's write-in lives, so it never collides with a real field id. */
export function otherKey(id: string): string {
  return `${id}~other`;
}

export const OTHER = "Other";

/** Where a phone field keeps its dialling code, beside the number itself. */
export function dialKey(id: string): string {
  return `${id}~dial`;
}

const FIELDS: readonly BriefField[] = brief.flatMap((section) => section.fields);

/** Deliberately loose. A form that argues with a valid address is worse than one
    that lets a typo through, and a human reads this within the day either way. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(answers: Answers, id: string): string {
  const value = answers[id];
  return typeof value === "string" ? value : "";
}

export function list(answers: Answers, id: string): readonly string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
}

/** Answered at all? A picked "Other" with nothing written in does not count,
    and neither does a phone number with no code in front of it. */
function answered(answers: Answers, field: BriefField): boolean {
  if (field.kind === "dial") {
    return (
      text(answers, dialKey(field.id)).trim().length > 0 &&
      text(answers, field.id).trim().length > 0
    );
  }
  if (field.kind === "many") {
    const picked = list(answers, field.id);
    if (picked.length === 0) return false;
    if (picked.length === 1 && picked[0] === OTHER) {
      return text(answers, otherKey(field.id)).trim().length > 0;
    }
    return true;
  }
  const value = text(answers, field.id).trim();
  if (value === OTHER) return text(answers, otherKey(field.id)).trim().length > 0;
  return value.length > 0;
}

function check(answers: Answers): Record<string, string> {
  const problems: Record<string, string> = {};

  for (const field of FIELDS) {
    if (field.required && !answered(answers, field)) {
      problems[field.id] =
        field.kind === "one" || field.kind === "many" || field.kind === "country"
          ? "Pick one."
          : field.kind === "dial"
            ? "A code and a number."
            : "This one he needs.";
    }
  }

  if (!problems.email && !LOOKS_LIKE_EMAIL.test(text(answers, "email").trim())) {
    problems.email = "An address his team can reply to.";
  }
  if (!problems.story && text(answers, "story").trim().length < 40) {
    problems.story = "A little more. This is the part the song comes out of.";
  }

  return problems;
}

/** The brief as a human would read it, which is what gets emailed. */
export function flatten(answers: Answers): string {
  const lines: string[] = [];
  for (const section of brief) {
    lines.push(`${section.letter}. ${section.title.toUpperCase()}`);
    for (const field of section.fields) {
      if (field.kind === "dial") {
        const code = text(answers, dialKey(field.id)).trim();
        const number = text(answers, field.id).trim();
        lines.push(`  ${field.q}. ${field.label}`);
        lines.push(`     ${code || number ? `${code} ${number}`.trim() : "—"}`);
        continue;
      }
      const picked = field.kind === "many" ? list(answers, field.id) : [text(answers, field.id)];
      const written = text(answers, otherKey(field.id)).trim();
      const shown = picked
        .filter((value) => value && value !== OTHER)
        .concat(written ? [written] : []);
      lines.push(`  ${field.q}. ${field.label}`);
      lines.push(`     ${shown.length > 0 ? shown.join(", ") : "—"}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function deliver(answers: Answers): Promise<void> {
  // Where the real thing posts to the endpoint that mails Dennis's team.
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[mockup] the brief that would be emailed:\n" + flatten(answers));
  }
}

/* ---------- keeping what has been typed ----------

   Twenty questions is long enough that losing them matters. A reload, a
   back button, a tab restored a day later — any of those used to empty the
   whole thing, and nobody fills in a twenty-question form twice. It is held
   locally and never sent anywhere; `clear` runs when the brief goes, so a
   finished brief does not sit in the browser afterwards. */
const KEEP_KEY = "blesspoke:brief";
/* Where they were, kept apart from what they wrote so an older saved brief
   still restores rather than being thrown away for having the wrong shape. */
const STEP_KEY = "blesspoke:brief:step";

function remembered(): Answers {
  try {
    const raw = window.localStorage.getItem(KEEP_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Answers;
  } catch {
    return {};
  }
}

function keep(answers: Answers): void {
  try {
    window.localStorage.setItem(KEEP_KEY, JSON.stringify(answers));
  } catch {
    /* private mode: the brief simply does not survive a reload */
  }
}

function forget(): void {
  try {
    window.localStorage.removeItem(KEEP_KEY);
    window.localStorage.removeItem(STEP_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Which part they were on. Clamped, so a stored step from an older, shorter
    brief cannot land the reader on a part that no longer exists. */
function rememberedStep(): number {
  try {
    const raw = window.localStorage.getItem(STEP_KEY);
    if (raw === null) return 0;
    const at = Number(raw);
    if (!Number.isInteger(at)) return 0;
    return Math.max(0, Math.min(REVIEW, at));
  } catch {
    return 0;
  }
}

function keepStep(at: number): void {
  try {
    window.localStorage.setItem(STEP_KEY, String(at));
  } catch {
    /* private mode: the position simply does not survive a reload */
  }
}

/** The five parts, and then the page that shows what is about to be sent. */
export const REVIEW = brief.length;

/** What is still owed inside one part, so the stepper can say where to go. */
export function outstandingIn(answers: Answers, index: number): number {
  const section = brief[index];
  if (!section) return 0;
  return section.fields.filter((field) => field.required && !answered(answers, field)).length;
}

export function useBrief() {
  const [answers, setAnswers] = useState<Answers>(remembered);
  const [stage, setStage] = useState<BriefStage>("idle");
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(rememberedStep);

  /* A part is "shown" once it has been checked, and only its own fields go red.
     Checking the whole form on the first press of Next would mark fourteen
     things wrong when the reader has only been asked four. */
  const revise = (next: Answers) => {
    setAnswers(next);
    keep(next);
    if (shown.size > 0) setProblems(check(next));
  };

  const set = (id: string, value: string) => revise({ ...answers, [id]: value });

  /* Two answers at once. Needed because `set` closes over `answers`, so calling
     it twice in one handler would build both patches off the same stale base and
     the second would win — which is exactly the shape of the bug where picking a
     dialling code silently unset the country. */
  const setAll = (patch: Record<string, string>) => revise({ ...answers, ...patch });

  /** For "many". Refuses past the cap rather than dropping the oldest pick:
      silently swapping a choice the reader made is worse than not taking it. */
  const toggle = (id: string, value: string, max?: number) => {
    const picked = list(answers, id);
    const has = picked.includes(value);
    if (!has && max !== undefined && picked.length >= max) return;
    revise({
      ...answers,
      [id]: has ? picked.filter((entry) => entry !== value) : [...picked, value],
    });
  };

  /** Only the problems in parts the reader has actually been through. */
  const visible = useMemo(() => {
    const out: Record<string, string> = {};
    for (const section of brief) {
      if (!shown.has(section.id)) continue;
      for (const field of section.fields) {
        if (problems[field.id]) out[field.id] = problems[field.id] as string;
      }
    }
    return out;
  }, [problems, shown]);

  const go = (next: number) => {
    const at = Math.max(0, Math.min(REVIEW, next));
    setStep(at);
    keepStep(at);
  };

  /** Checks the part in front of the reader, and holds if it is not answered. */
  const forward = () => {
    const section = brief[step];
    if (!section) {
      go(step + 1);
      return true;
    }
    const found = check(answers);
    setProblems(found);
    setShown((current) => new Set(current).add(section.id));
    const missing = section.fields.find((field) => found[field.id]);
    if (missing) {
      document
        .querySelector(`[data-field="${missing.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    go(step + 1);
    return true;
  };

  const submit = async () => {
    const found = check(answers);
    setProblems(found);
    setShown(new Set(brief.map((section) => section.id)));
    if (Object.keys(found).length > 0) {
      // Take them to the part that needs them rather than making them hunt.
      const at = brief.findIndex((section) => section.fields.some((f) => found[f.id]));
      if (at >= 0) go(at);
      return;
    }
    setStage("sending");
    await deliver(answers);
    forget();
    setStage("sent");
  };

  const again = () => {
    forget();
    setAnswers({});
    setProblems({});
    setShown(new Set());
    setStep(0);
    keepStep(0);
    setStage("idle");
  };

  const outstanding = useMemo(
    () => FIELDS.filter((field) => field.required && !answered(answers, field)).length,
    [answers],
  );

  return {
    answers,
    stage,
    problems: visible,
    outstanding,
    required: FIELDS.filter((field) => field.required).length,
    step,
    go,
    forward,
    back: () => go(step - 1),
    set,
    setAll,
    toggle,
    submit,
    again,
  };
}
