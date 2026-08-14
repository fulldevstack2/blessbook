import { Link } from "react-router-dom";
import { concepts, type Concept } from "../concepts/registry";

/**
 * Structure shared by all three concepts. The markup is identical so the
 * comparison is fair; each concept's stylesheet does the rest.
 */

export function ConceptChrome({ concept }: { concept: Concept }) {
  return (
    <header className="chrome">
      <Link className="chrome-back" to="/">
        <span aria-hidden>&larr;</span> All three
      </Link>
      <p className="chrome-title">
        <span className="chrome-ordinal">{concept.ordinal}</span>
        <span className="chrome-name">{concept.name}</span>
        <span className="chrome-tag">{concept.tagline}</span>
      </p>
    </header>
  );
}

export function ConceptSwitch({ concept }: { concept: Concept }) {
  const others = concepts.filter((c) => c.id !== concept.id);

  return (
    <nav className="switch" aria-label="Other design concepts">
      <p className="switch-lede">The same commission, designed two other ways</p>
      <ul className="switch-list">
        {others.map((other) => (
          <li key={other.id}>
            <Link className="switch-item" to={other.path}>
              <span className="switch-ordinal">{other.ordinal}</span>
              <span className="switch-name">{other.name}</span>
              <span className="switch-tag">{other.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
