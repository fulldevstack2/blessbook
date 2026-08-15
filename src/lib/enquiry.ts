import { useState } from "react";

/**
 * The commission request, and what happens to it.
 *
 * There is no account, no cart and no checkout on this site, because there is
 * none in the real business either. A client writes one paragraph and leaves an
 * address; Dennis's team reads it and replies from their own inbox; the sample,
 * the payment details and the finished song all travel in that same thread.
 * The whole product is a conversation, so the only thing the page has to do is
 * start one properly.
 *
 * This holds the form and its validation. **Nothing is sent.** `submit` waits a
 * moment and reports success, which is what a mockup should do. To make it real,
 * replace the body of `deliver` with a POST to whatever endpoint mails the team
 * — the shape of what is collected will not need to change.
 */

export interface Enquiry {
  readonly name: string;
  readonly email: string;
  /** Which of the two tiers, by id. Empty until chosen. */
  readonly tier: string;
  readonly prompt: string;
}

export type EnquiryStage = "idle" | "sending" | "sent";

export interface EnquiryProblems {
  readonly name?: string;
  readonly email?: string;
  readonly prompt?: string;
}

const BLANK: Enquiry = { name: "", email: "", tier: "", prompt: "" };

/** Deliberately loose. A form that argues with a valid address is worse than one
    that lets a typo through, and a human reads this within the day either way. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function check(enquiry: Enquiry): EnquiryProblems {
  const problems: { name?: string; email?: string; prompt?: string } = {};
  if (enquiry.name.trim().length < 2) problems.name = "Who should he write back to?";
  if (!LOOKS_LIKE_EMAIL.test(enquiry.email.trim())) {
    problems.email = "An address his team can reply to.";
  }
  if (enquiry.prompt.trim().length < 25) {
    problems.prompt = "A sentence or two more. The prompt is the brief.";
  }
  return problems;
}

async function deliver(enquiry: Enquiry): Promise<void> {
  // Where the real thing posts to the endpoint that mails Dennis's team.
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[mockup] enquiry that would be emailed to Dennis's team:", enquiry);
  }
}

export function useEnquiry() {
  const [enquiry, setEnquiry] = useState<Enquiry>(BLANK);
  const [stage, setStage] = useState<EnquiryStage>("idle");
  const [problems, setProblems] = useState<EnquiryProblems>({});
  const [shown, setShown] = useState(false);

  const set = <K extends keyof Enquiry>(field: K, value: Enquiry[K]) => {
    setEnquiry((current) => ({ ...current, [field]: value }));
    if (shown) setProblems(check({ ...enquiry, [field]: value }));
  };

  const submit = async () => {
    const found = check(enquiry);
    setProblems(found);
    setShown(true);
    if (Object.keys(found).length > 0) return;

    setStage("sending");
    await deliver(enquiry);
    setStage("sent");
  };

  const again = () => {
    setEnquiry(BLANK);
    setProblems({});
    setShown(false);
    setStage("idle");
  };

  return { enquiry, stage, problems: shown ? problems : {}, set, submit, again };
}
