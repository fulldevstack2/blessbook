import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFinePointer, useOpenDirection } from "../lib/pointer";

/**
 * A list to choose from, drawn rather than borrowed.
 *
 * The closed control was already the concept's; the open one was the operating
 * system's, which is what a native `<select>` gives you and there is no styling
 * it. This draws the list instead — and takes the chance to make it better than
 * the thing it replaces: two hundred and forty-three entries is a list you give
 * up on, so it filters as you type, on the name *and* the code, which the native
 * one cannot do.
 *
 * The pattern is the editable combobox: a text input that owns a listbox. That
 * is what makes typing legitimate rather than a trick, and it means the whole
 * thing is operable from the keyboard for the reasons the pattern exists —
 * arrows move, Enter takes, Escape restores what was there, Tab leaves.
 *
 * On a touch device this steps aside entirely; see `useFinePointer`.
 */

export interface Choice {
  readonly value: string;
  readonly label: string;
  /** Also matched when filtering — a dialling code, say. */
  readonly extra?: string;
  /** The heading this sits under. Consecutive matches share one. */
  readonly group?: string;
}

interface ChooseProps {
  readonly id: string;
  readonly value: string;
  readonly choices: readonly Choice[];
  readonly placeholder: string;
  readonly onChoose: (value: string) => void;
  readonly className?: string;
  readonly label?: string;
}

export function Choose({
  id,
  value,
  choices,
  placeholder,
  onChoose,
  className,
  label,
}: ChooseProps) {
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = `${useId()}-list`;
  const way = useOpenDirection(root, list, open);

  const chosen = choices.find((choice) => choice.value === value);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return choices;
    return choices.filter(
      (choice) =>
        choice.label.toLowerCase().includes(needle) ||
        (choice.extra ?? "").toLowerCase().includes(needle),
    );
  }, [choices, query]);

  /* Clicking away is the commonest way to mean "never mind", so it restores
     rather than committing whatever happened to be highlighted. */
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  /* Keep the highlighted row in view — a keyboard reader moving down a list of
     two hundred needs the list to follow, not to be told it moved. */
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({
      block: "nearest",
    });
  }, [open, active]);

  if (!fine) {
    /* The platform's own, grouped as before. Deliberate — see useFinePointer. */
    const groups: { name: string | undefined; items: Choice[] }[] = [];
    for (const choice of choices) {
      const last = groups[groups.length - 1];
      if (last && last.name === choice.group) last.items.push(choice);
      else groups.push({ name: choice.group, items: [choice] });
    }
    return (
      <select
        className={`brief-select ${className ?? ""}`}
        id={id}
        value={value}
        aria-label={label}
        onChange={(event) => onChoose(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {groups.map((group) =>
          group.name ? (
            <optgroup key={group.name} label={group.name}>
              {group.items.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </optgroup>
          ) : (
            group.items.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))
          ),
        )}
      </select>
    );
  }

  const take = (index: number) => {
    const choice = shown[index];
    if (!choice) return;
    onChoose(choice.value);
    setQuery("");
    setOpen(false);
  };

  const show = () => {
    setOpen(true);
    setActive(Math.max(0, shown.findIndex((choice) => choice.value === value)));
  };

  let heading: string | undefined;

  return (
    <div className={`choose ${className ?? ""}`} ref={root} data-open={open} data-way={way}>
      <input
        className="choose-face"
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && shown[active] ? `${listId}-${shown[active]?.value}` : undefined}
        aria-label={label}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={open ? query : (chosen?.label ?? "")}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onPointerDown={() => (open ? undefined : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) return show();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((at) => Math.min(shown.length - 1, Math.max(0, at + step)));
            return;
          }
          if (event.key === "Home" && open) {
            event.preventDefault();
            setActive(0);
            return;
          }
          if (event.key === "End" && open) {
            event.preventDefault();
            setActive(shown.length - 1);
            return;
          }
          if (event.key === "Enter" && open) {
            event.preventDefault();
            take(active);
            return;
          }
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
            setQuery("");
            return;
          }
          // Tab leaves, and leaving means what was there before still is.
          if (event.key === "Tab" && open) {
            setOpen(false);
            setQuery("");
          }
        }}
      />
      <span className="choose-caret" aria-hidden />

      {open ? (
        <ul className="choose-list" id={listId} role="listbox" ref={list} aria-label={label}>
          {shown.length === 0 ? (
            <li className="choose-none" role="presentation">
              Nothing by that name.
            </li>
          ) : (
            shown.map((choice, index) => {
              const opens = choice.group && choice.group !== heading;
              heading = choice.group;
              return (
                <li key={choice.value} role="presentation">
                  {opens ? <span className="choose-group">{choice.group}</span> : null}
                  <button
                    type="button"
                    className="choose-option"
                    id={`${listId}-${choice.value}`}
                    role="option"
                    aria-selected={choice.value === value}
                    data-active={index === active}
                    tabIndex={-1}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => take(index)}
                  >
                    {choice.extra ? <span className="choose-extra">{choice.extra}</span> : null}
                    <span className="choose-label">{choice.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
