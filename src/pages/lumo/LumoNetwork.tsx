import { useMemo, useState } from "react";
import {
  adminUsers,
  childrenOf,
  downlineCount,
  isDescendant,
  setUserUpline,
  usdt,
} from "@/lib/admin-data";
import type { AdminUser } from "@/lib/types";
import { AccountStatusChip, Modal, Pager, useToasts } from "@/components/lumo/ui";

const PAGE_SIZE = 15;

export function LumoNetwork() {
  const [view, setView] = useState<"tree" | "table">("tree");
  const [, setVersion] = useState(0);
  const { push, stack } = useToasts();

  // table filters
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  // move modal
  const [moving, setMoving] = useState<AdminUser | null>(null);
  const [targetQ, setTargetQ] = useState("");

  const users = useMemo(() => adminUsers(), []);
  const byId = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const roots = useMemo(() => users.filter((u) => u.uplineId === null), [users]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (needle && !u.username.toLowerCase().includes(needle) && !u.displayName.toLowerCase().includes(needle))
        return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }, [users, q, role]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const tableRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const refresh = () => setVersion((v) => v + 1);

  const moveTo = (target: AdminUser | null) => {
    if (!moving) return;
    if (target && isDescendant(moving.id, target.id)) {
      push(`Cannot move ${moving.displayName} under their own downline.`);
      return;
    }
    setUserUpline(moving.id, target ? target.id : null);
    push(
      target
        ? `${moving.displayName} moved under ${target.displayName}`
        : `${moving.displayName} promoted to a root branch`,
    );
    setMoving(null);
    setTargetQ("");
    refresh();
  };

  const candidates = useMemo(() => {
    if (!moving) return [];
    const needle = targetQ.trim().toLowerCase();
    return users
      .filter((u) => u.id !== moving.id)
      .filter((u) => !isDescendant(moving.id, u.id))
      .filter(
        (u) =>
          !needle ||
          u.displayName.toLowerCase().includes(needle) ||
          u.username.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [moving, targetQ, users]);

  return (
    <>
      <div className="lumo-topbar">
        <div>
          <h1 className="lumo-title">Network</h1>
          <p className="lumo-sub">
            Franchise & community hierarchy — {roots.length} root branches,{" "}
            {users.length.toLocaleString()} members.
          </p>
        </div>
        <div className="viewswitch">
          <button className={view === "tree" ? "on" : ""} onClick={() => setView("tree")}>
            Tree view
          </button>
          <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}>
            Table view
          </button>
        </div>
      </div>

      {view === "tree" ? (
        <div className="lumo-panel">
          <div className="lumo-panel-head">
            <h3>Organisation tree</h3>
            <span className="mono-label">collapse branches · move members between uplines</span>
          </div>
          <div className="tree">
            <ul>
              {roots.map((r) => (
                <TreeNode key={r.id} user={r} onMove={setMoving} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="lumo-panel">
          <div className="filter-bar">
            <div className="f" style={{ flex: 1, minWidth: 200 }}>
              <label>Search member</label>
              <input
                className="input"
                placeholder="name or username"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="f">
              <label>Role</label>
              <select className="select" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
                <option value="">All</option>
                <option value="member">Member</option>
                <option value="agent">Agent</option>
                <option value="franchise">Franchise</option>
              </select>
            </div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Upline</th>
                  <th>Downline</th>
                  <th>Network</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((u) => {
                  const up = u.uplineId ? byId.get(u.uplineId) : null;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="strong">{u.displayName}</div>
                        <div className="mono-label">@{u.username}</div>
                      </td>
                      <td>
                        <span className={`chip ${u.role === "franchise" ? "gold" : u.role === "agent" ? "amber" : "dim"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{up ? up.displayName : <span className="chip gold">root</span>}</td>
                      <td className="num">{downlineCount(u.id)}</td>
                      <td className="num">{u.network}</td>
                      <td className="num">{usdt(u.balance)}</td>
                      <td>
                        <AccountStatusChip status={u.status} />
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setMoving(u)}>
                          ⇄ Move
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </div>
      )}

      {moving && (
        <Modal
          title="Move member"
          sub={`Reassign @${moving.username} (${downlineCount(moving.id)} in downline move with them)`}
          onClose={() => {
            setMoving(null);
            setTargetQ("");
          }}
        >
          <div className="field">
            <label>New upline</label>
            <input
              className="input"
              placeholder="Search new upline by name…"
              value={targetQ}
              onChange={(e) => setTargetQ(e.target.value)}
            />
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {candidates.map((c) => (
              <button
                key={c.id}
                className="panel panel-pad"
                style={{ textAlign: "left", color: "var(--ivory)", border: "1px solid var(--line)" }}
                onClick={() => moveTo(c)}
              >
                <strong>{c.displayName}</strong>{" "}
                <span className={`chip ${c.role === "franchise" ? "gold" : c.role === "agent" ? "amber" : "dim"}`}>
                  {c.role}
                </span>
                <div className="mono-label" style={{ marginTop: 4 }}>
                  @{c.username} · {downlineCount(c.id)} downline
                </div>
              </button>
            ))}
            {candidates.length === 0 && (
              <p className="mono-label" style={{ padding: "10px 0" }}>
                No eligible uplines — cannot move under own downline.
              </p>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => moveTo(null)}>
              Promote to root branch
            </button>
          </div>
        </Modal>
      )}

      {stack}
    </>
  );
}

function TreeNode({
  user,
  onMove,
  depth = 0,
}: {
  user: AdminUser;
  onMove: (u: AdminUser) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const kids = childrenOf(user.id);
  const downline = downlineCount(user.id);

  return (
    <li className="tree-node">
      <span className="tree-card">
        {kids.length > 0 && (
          <button
            className="tree-toggle"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "−" : "+"}
          </button>
        )}
        <span className="avatar">
          {user.displayName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span>
          <span className="nm">{user.displayName}</span>{" "}
          <span className={`chip ${user.role === "franchise" ? "gold" : user.role === "agent" ? "amber" : "dim"}`}>
            {user.role}
          </span>
          <div className="meta">
            @{user.username} · {kids.length} direct · {downline} total · {usdt(user.balance)}
          </div>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => onMove(user)}>
          ⇄
        </button>
      </span>
      {open && kids.length > 0 && (
        <ul>
          {kids.map((k) => (
            <TreeNode key={k.id} user={k} onMove={onMove} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
