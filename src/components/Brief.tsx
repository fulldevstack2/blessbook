import { brief, enquiry, type BriefField } from "../content/commission";
import { OTHER, list, otherKey, useBrief } from "../lib/enquiry";

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

function Control({
  field,
  answers,
  set,
  toggle,
}: {
  field: BriefField;
  answers: ReturnType<typeof useBrief>["answers"];
  set: ReturnType<typeof useBrief>["set"];
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

export function Brief() {
  const { answers, stage, problems, outstanding, set, toggle, submit, again } = useBrief();
  const sent = stage === "sent";

  if (sent) {
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

  return (
    <form
      className="brief"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {brief.map((section) => (
        <fieldset className="brief-part" key={section.id}>
          <legend className="brief-part-head">
            <span className="brief-letter" aria-hidden>
              {section.letter}
            </span>
            <span className="brief-part-title">{section.title}</span>
          </legend>

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

              <Control field={field} answers={answers} set={set} toggle={toggle} />

              {problems[field.id] ? (
                <p className="brief-problem" role="alert">
                  {problems[field.id]}
                </p>
              ) : null}
            </div>
          ))}
        </fieldset>
      ))}

      <div className="brief-foot">
        <button type="submit" className="brief-send" disabled={stage === "sending"}>
          {stage === "sending" ? enquiry.sending : enquiry.send}
        </button>
        {/* His own closing line, and the most reassuring thing on the page. */}
        <p className="brief-count">
          {outstanding > 0
            ? `${outstanding} still to answer. Fill in what you can and leave the rest — his team will help with the details.`
            : "That is everything. Fill in any of the optional questions you like."}
        </p>
      </div>
    </form>
  );
}
