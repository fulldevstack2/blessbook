import { brief, enquiry, type BriefField } from "../content/commission";
import { NEAR_COUNT, countries } from "../content/countries";
import { useEffect, useRef } from "react";
import { OTHER, REVIEW, dialKey, list, otherKey, outstandingIn, useBrief } from "../lib/enquiry";

/**
 * The creative brief, as a form.
 *
 * Machinery, not design. Twenty questions in five parts is a lot of markup, and
 * a form field's *structure* is not a design decision — a label, a control, a
 * hint and a problem, in that order, is the only correct answer. So the shape
 * lives here once and each concept paints it, exactly as the reel, the player
 * and the fader already work. What a concept changes is everything you can see.
 *
 * Every control is a real one: inputs, radios, checkboxes and a date. Nothing is
 * a div pretending, so it is all keyboard-operable, screen-reader-labelled and
 * autofillable without any of that being written here.
 */

/** Today, so nothing can be needed in the past. */
function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Is the chosen day inside the next `days` days? */
function within(chosen: string, days: number): boolean {
  const when = new Date(`${chosen}T00:00:00`);
  if (Number.isNaN(when.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return (when.getTime() - now.getTime()) / 86_400_000 < days;
}

const LEFT = ["none left", "one more", "two more", "three more"] as const;

function Control({
  field,
  answers,
  set,
  setAll,
  toggle,
}: {
  field: BriefField;
  answers: ReturnType<typeof useBrief>["answers"];
  set: ReturnType<typeof useBrief>["set"];
  setAll: ReturnType<typeof useBrief>["setAll"];
  toggle: ReturnType<typeof useBrief>["toggle"];
}) {
  const value = typeof answers[field.id] === "string" ? (answers[field.id] as string) : "";
  const picked = list(answers, field.id);
  const written = typeof answers[otherKey(field.id)] === "string"
    ? (answers[otherKey(field.id)] as string)
    : "";

  /* The write-in, shown only once its option is taken. Rendered for both the
     pick-one and the pick-many cases, which is why it is not inlined twice. */
  const other = (
    <input
      className="brief-other"
      type="text"
      value={written}
      aria-label={`${field.label} — please say`}
      placeholder="Please say"
      onChange={(event) => set(otherKey(field.id), event.target.value)}
    />
  );

  /* The dialling code and the country are one fact asked twice, so answering
     either answers both — and the code is chosen rather than typed, because
     "include your country code" asks the reader to know what the form knows. */
  if (field.kind === "dial") {
    const dial = typeof answers[dialKey(field.id)] === "string"
      ? (answers[dialKey(field.id)] as string)
      : "";
    return (
      <div className="brief-dial">
        <select
          className="brief-select brief-select--dial"
          value={dial}
          aria-label="Dialling code"
          onChange={(event) => {
            const chosen = countries.find((country) => country.iso === event.target.value);
            setAll({
              [dialKey(field.id)]: event.target.value,
              ...(chosen ? { country: chosen.iso } : {}),
            });
          }}
        >
          <option value="">Code</option>
          {/* Grouped, not just ordered. An `optgroup` is the one bit of
              structure a native list actually honours, and 243 flat entries is a
              list you give up on. */}
          <optgroup label="Where the work comes from">
            {countries.slice(0, NEAR_COUNT).map((country) => (
              <option key={country.iso} value={country.iso}>
                {country.dial} · {country.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Everywhere else">
            {countries.slice(NEAR_COUNT).map((country) => (
              <option key={country.iso} value={country.iso}>
                {country.dial} · {country.name}
              </option>
            ))}
          </optgroup>
        </select>
        <input
          className="brief-input"
          id={field.id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => set(field.id, event.target.value)}
        />
      </div>
    );
  }

  if (field.kind === "country") {
    return (
      <select
        className="brief-select"
        id={field.id}
        value={value}
        autoComplete="country"
        onChange={(event) => {
          const chosen = countries.find((country) => country.iso === event.target.value);
          setAll({
            [field.id]: event.target.value,
            // Only fills the code if one has not been chosen already.
            ...(chosen && !answers[dialKey("whatsapp")] ? { [dialKey("whatsapp")]: chosen.iso } : {}),
          });
        }}
      >
        <option value="">Choose</option>
        <optgroup label="Where the work comes from">
          {countries.slice(0, NEAR_COUNT).map((country) => (
            <option key={country.iso} value={country.iso}>
              {country.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Everywhere else">
          {countries.slice(NEAR_COUNT).map((country) => (
            <option key={country.iso} value={country.iso}>
              {country.name}
            </option>
          ))}
        </optgroup>
      </select>
    );
  }

  if (field.kind === "date") {
    /* He delivers a sample in seven days. Someone who picks Friday has not done
       anything wrong, but the form knows something they do not, and telling them
       now is worth more than his team telling them tomorrow. Said, not blocked:
       rush work happens, and it is his to agree to. */
    const soon = field.id === "due" && value !== "" && within(value, 7);
    return (
      <>
        <input
          className="brief-input brief-input--date"
          id={field.id}
          type="date"
          // Nothing can be needed in the past.
          min={today()}
          value={value}
          onChange={(event) => set(field.id, event.target.value)}
        />
        {soon ? (
          <p className="brief-soon" aria-live="polite">
            Sooner than the seven days a sample usually takes. Say so in question
            20 and his team will tell you straight away whether it can be done.
          </p>
        ) : null}
      </>
    );
  }

  if (field.kind === "long") {
    return (
      <textarea
        className="brief-input brief-input--long"
        id={field.id}
        rows={field.id === "story" ? 7 : 3}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => set(field.id, event.target.value)}
      />
    );
  }

  if (field.kind === "one" || field.kind === "many") {
    const many = field.kind === "many";
    const options = field.other
      ? [...(field.options ?? []), { value: OTHER }]
      : (field.options ?? []);
    const full = many && field.max !== undefined && picked.length >= field.max;

    return (
      <>
        <div className="brief-choices" role="group" aria-labelledby={`${field.id}-ask`}>
          {options.map((option) => {
            const on = many ? picked.includes(option.value) : value === option.value;
            return (
              <label className="brief-choice" key={option.value} data-on={on} data-off={!on && full}>
                <input
                  type={many ? "checkbox" : "radio"}
                  name={field.id}
                  value={option.value}
                  checked={on}
                  /* Not disabled at the cap — a disabled control gives no reason
                     for refusing. It stays focusable and simply does not take. */
                  onChange={() =>
                    many ? toggle(field.id, option.value, field.max) : set(field.id, option.value)
                  }
                />
                <span className="brief-choice-word">
                  {option.value}
                  {option.note ? <span className="brief-choice-note">{option.note}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
        {/* How many are left, in words. "Up to three" says the rule; this says
            where you are in it, which is the part a reader actually wants. */}
        {many && field.max !== undefined ? (
          <p className="brief-left" aria-live="polite">
            {LEFT[Math.max(0, field.max - picked.length)] ?? `${field.max - picked.length} more`}
          </p>
        ) : null}
        {(many ? picked.includes(OTHER) : value === OTHER) ? other : null}
      </>
    );
  }

  return (
    <input
      className="brief-input"
      id={field.id}
      type={field.kind}
      value={value}
      placeholder={field.placeholder}
      autoComplete={
        field.id === "name"
          ? "name"
          : field.id === "email"
            ? "email"
            : field.id === "whatsapp"
              ? "tel"
              : field.id === "country"
                ? "country-name"
                : undefined
      }
      onChange={(event) => set(field.id, event.target.value)}
    />
  );
}

/** One answer as text, for the review page. */
function answerOf(answers: ReturnType<typeof useBrief>["answers"], id: string): string {
  const value = answers[id];
  return typeof value === "string" ? value : "";
}

export function Brief() {
  const {
    answers,
    stage,
    problems,
    outstanding,
    required,
    step,
    go,
    forward,
    back,
    set,
    setAll,
    toggle,
    submit,
    again,
  } = useBrief();
  const heading = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);

  /* Moving between parts replaces everything on screen, so say where you are
     now. Without this a keyboard or screen-reader user is left wherever the
     button was, reading nothing. Not on the first paint — that would drag the
     page to the form before anyone asked for it. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  if (stage === "sent") {
    return (
      <div className="brief brief--sent" role="status">
        <p className="brief-stamp" aria-hidden>
          Received
        </p>
        <p className="brief-sent-head">{enquiry.sentHead}</p>
        <p className="brief-sent-body">{enquiry.sentBody}</p>
        <button type="button" className="brief-again" onClick={again}>
          {enquiry.again}
        </button>
      </div>
    );
  }

  const section = brief[step];
  const reviewing = step === REVIEW;
  const done = required - outstanding;

  return (
    <div className="brief">
      {/* Where you are, and what is left. The parts are all reachable at any
          time: the reader is told to fill in what they can, so trapping them in
          part C until it is perfect would contradict the form's own promise. */}
      <nav className="brief-steps" aria-label="Parts of the brief">
        <ol className="brief-steps-list">
          {brief.map((part, index) => {
            const owed = outstandingIn(answers, index);
            return (
              <li key={part.id}>
                <button
                  type="button"
                  className="brief-step"
                  data-at={index === step}
                  data-done={owed === 0}
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => go(index)}
                >
                  <span className="brief-step-letter">{part.letter}</span>
                  <span className="brief-step-name">{part.title}</span>
                  {owed > 0 ? (
                    <span className="brief-step-owed">
                      <span aria-hidden>{owed}</span>
                      <span className="visually-hidden">{owed} still to answer</span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="brief-step"
              data-at={reviewing}
              aria-current={reviewing ? "step" : undefined}
              onClick={() => go(REVIEW)}
            >
              <span className="brief-step-letter" aria-hidden>
                ✓
              </span>
              <span className="brief-step-name">Send</span>
            </button>
          </li>
        </ol>
        <span className="brief-progress" aria-hidden>
          <span
            className="brief-progress-fill"
            style={{ transform: `scaleX(${required > 0 ? done / required : 0})` }}
          />
        </span>
        <p className="brief-progress-word">
          {outstanding > 0
            ? `${done} of ${required} answered — fill in what you can and leave the rest.`
            : "Everything needed is answered."}
        </p>
      </nav>

      {reviewing ? (
        <div className="brief-review">
          <p className="brief-part-head" tabIndex={-1} ref={heading}>
            <span className="brief-letter" aria-hidden>
              ✓
            </span>
            <span className="brief-part-title">What will be sent</span>
          </p>

          {brief.map((part, index) => (
            <div className="brief-recap" key={part.id}>
              <p className="brief-recap-head">
                <span>
                  {part.letter} · {part.title}
                </span>
                <button type="button" className="brief-recap-edit" onClick={() => go(index)}>
                  Change
                </button>
              </p>
              <dl className="brief-recap-list">
                {part.fields.map((field) => {
                  if (field.kind === "dial" || field.kind === "country") {
                    const iso = answerOf(answers, field.kind === "dial" ? dialKey(field.id) : field.id);
                    const country = countries.find((entry) => entry.iso === iso);
                    const said =
                      field.kind === "dial"
                        ? [country?.dial, answerOf(answers, field.id)].filter(Boolean).join(" ")
                        : (country?.name ?? "");
                    return (
                      <div key={field.id} data-said={said.length > 0}>
                        <dt>{field.label}</dt>
                        <dd>{said || "—"}</dd>
                      </div>
                    );
                  }
                  const picked =
                    field.kind === "many" ? list(answers, field.id) : [answerOf(answers, field.id)];
                  const written = answerOf(answers, otherKey(field.id)).trim();
                  const said = picked
                    .filter((value) => value && value !== OTHER)
                    .concat(written ? [written] : []);
                  return (
                    <div key={field.id} data-said={said.length > 0}>
                      <dt>{field.label}</dt>
                      <dd>{said.length > 0 ? said.join(", ") : "—"}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}

          <div className="brief-nav">
            <button type="button" className="brief-back" onClick={back}>
              Back
            </button>
            <button
              type="button"
              className="brief-send"
              disabled={stage === "sending"}
              onClick={() => void submit()}
            >
              {stage === "sending" ? enquiry.sending : enquiry.send}
            </button>
          </div>
        </div>
      ) : section ? (
        <form
          className="brief-part"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            forward();
          }}
        >
          <p className="brief-part-head" tabIndex={-1} ref={heading}>
            <span className="brief-letter" aria-hidden>
              {section.letter}
            </span>
            <span className="brief-part-title">{section.title}</span>
          </p>

          {section.fields.map((field) => (
            <div
              className="brief-field"
              key={field.id}
              data-field={field.id}
              data-kind={field.kind}
              data-bad={Boolean(problems[field.id])}
            >
              <label className="brief-label" htmlFor={field.id} id={`${field.id}-ask`}>
                <span className="brief-q" aria-hidden>
                  {field.q}
                </span>
                <span className="brief-ask">{field.label}</span>
                {field.required ? (
                  <span className="brief-must" title="Required">
                    <span aria-hidden>*</span>
                    <span className="visually-hidden">Required</span>
                  </span>
                ) : null}
              </label>

              {field.hint ? <p className="brief-hint">{field.hint}</p> : null}

              <Control field={field} answers={answers} set={set} setAll={setAll} toggle={toggle} />

              {problems[field.id] ? (
                <p className="brief-problem" role="alert">
                  {problems[field.id]}
                </p>
              ) : null}
            </div>
          ))}

          <div className="brief-nav">
            {step > 0 ? (
              <button type="button" className="brief-back" onClick={back}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="brief-next">
              {step === brief.length - 1 ? "Review" : `Next · ${brief[step + 1]?.title ?? ""}`}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
