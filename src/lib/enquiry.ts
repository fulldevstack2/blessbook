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

/** Answered at all? A picked "Other" with nothing written in does not count. */
function answered(answers: Answers, field: BriefField): boolean {
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
        field.kind === "one" || field.kind === "many" ? "Pick one." : "This one he needs.";
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

export function useBrief() {
  const [answers, setAnswers] = useState<Answers>({});
  const [stage, setStage] = useState<BriefStage>("idle");
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [shown, setShown] = useState(false);

  /* Once the reader has been shown the problems, keep them honest as they type;
     before that, never — a form that goes red while a sentence is half typed is
     arguing with someone who is still answering it. */
  const revise = (next: Answers) => {
    setAnswers(next);
    if (shown) setProblems(check(next));
  };

  const set = (id: string, value: string) => revise({ ...answers, [id]: value });

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

  const submit = async () => {
    const found = check(answers);
    setProblems(found);
    setShown(true);
    if (Object.keys(found).length > 0) {
      // Take them to the first thing that needs them rather than making them hunt.
      const first = FIELDS.find((field) => found[field.id]);
      if (first) {
        document
          .querySelector(`[data-field="${first.id}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setStage("sending");
    await deliver(answers);
    setStage("sent");
  };

  const again = () => {
    setAnswers({});
    setProblems({});
    setShown(false);
    setStage("idle");
  };

  /** How much is still owed, for a form long enough to want a count. */
  const outstanding = useMemo(
    () => FIELDS.filter((field) => field.required && !answered(answers, field)).length,
    [answers],
  );

  return {
    answers,
    stage,
    problems: shown ? problems : {},
    outstanding,
    required: FIELDS.filter((field) => field.required).length,
    set,
    toggle,
    submit,
    again,
  };
}
