import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AccountStatus, TxStatus, TxType } from "@/lib/types";

/* ---------- status chips ---------- */

export function TxStatusChip({ status }: { status: TxStatus }) {
  const cls =
    status === "success"
      ? "green"
      : status === "pending" || status === "init"
        ? "amber"
        : status === "processing"
          ? "gold"
          : "red";
  return <span className={`chip ${cls}`}>{status}</span>;
}

export function TxTypeChip({ type }: { type: TxType }) {
  const cls =
    type === "deposit"
      ? "green"
      : type === "withdrawal"
        ? "red"
        : type === "bundle_purchase"
          ? "gold"
          : type === "profit"
            ? "amber"
            : "dim";
  const label =
    type === "bundle_purchase"
      ? "bundle"
      : type === "commission"
        ? "commission"
        : type;
  return <span className={`chip ${cls}`}>{label}</span>;
}

export function AccountStatusChip({ status }: { status: AccountStatus }) {
  const cls = status === "active" ? "green" : status === "suspended" ? "amber" : "red";
  return <span className={`chip ${cls}`}>{status}</span>;
}

/* ---------- pagination ---------- */

export function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  const window = 5;
  const start = Math.max(1, Math.min(page - Math.floor(window / 2), pages - window + 1));
  const nums = Array.from({ length: Math.min(window, pages) }, (_, i) => start + i);
  return (
    <div className="pager">
      <span className="info">
        {total.toLocaleString()} record{total === 1 ? "" : "s"} · page {page} of {pages}
      </span>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← Prev
      </button>
      {nums.map((n) => (
        <button key={n} className={n === page ? "on" : ""} onClick={() => onPage(n)}>
          {n}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </div>
  );
}

/* ---------- action menu ---------- */

export interface ActionItem {
  label: string;
  icon?: string;
  danger?: boolean;
  onClick: () => void;
}

export function ActionMenu({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="actionmenu" ref={ref}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
        Actions ▾
      </button>
      {open && (
        <div className="actionmenu-items">
          {items.map((item) => (
            <button
              key={item.label}
              className={item.danger ? "danger" : ""}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- modal ---------- */

export function Modal({
  title,
  sub,
  children,
  onClose,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        {sub && <p className="modal-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

/* ---------- toasts ---------- */

export interface Toast {
  id: number;
  text: string;
}

let toastSeq = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (text: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  const stack = (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.text}
        </div>
      ))}
    </div>
  );
  return { push, stack };
}
