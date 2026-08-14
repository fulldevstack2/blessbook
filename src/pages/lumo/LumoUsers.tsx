import { useMemo, useState } from "react";
import {
  adminUsers,
  editUser,
  setUserRole,
  setUserStatus,
  usdt,
} from "@/lib/admin-data";
import type { AccountStatus, AdminUser, MemberRole } from "@/lib/types";
import { exportToExcel } from "@/lib/excel";
import {
  AccountStatusChip,
  ActionMenu,
  Modal,
  Pager,
  useToasts,
} from "@/components/lumo/ui";

const PAGE_SIZE = 15;

export function LumoUsers() {
  const [, setVersion] = useState(0);
  const { push, stack } = useToasts();

  // filters
  const [emailQuery, setEmailQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  // modals
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [permUser, setPermUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", email: "", phone: "" });

  const users = useMemo(() => adminUsers(), []);

  const filtered = useMemo(() => {
    const q = emailQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q))
        return false;
      if (role && u.role !== role) return false;
      if (status && u.status !== status) return false;
      if (verified === "yes" && !u.emailVerified) return false;
      if (verified === "no" && u.emailVerified) return false;
      if (from && u.createdAt < from) return false;
      if (to && u.createdAt > to) return false;
      return true;
    });
  }, [users, emailQuery, role, status, verified, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const refresh = () => setVersion((v) => v + 1);

  const doExport = (all: boolean) => {
    const list = all ? users : filtered;
    exportToExcel(
      all ? "lumo-users-all" : "lumo-users-filtered",
      "Users",
      list,
      [
        { header: "Username", value: (u) => u.username },
        { header: "Email", value: (u) => u.email },
        { header: "Phone", value: (u) => u.phone },
        { header: "Display Name", value: (u) => u.displayName },
        { header: "Role", value: (u) => u.role },
        { header: "2FA", value: (u) => (u.is2fa ? "Yes" : "No") },
        { header: "Created", value: (u) => u.createdAt },
        { header: "Email Verified", value: (u) => (u.emailVerified ? "Yes" : "No") },
        { header: "Status", value: (u) => u.status },
        { header: "Network", value: (u) => u.network },
        { header: "Wallet", value: (u) => u.walletAddress },
        { header: "Balance (USDT)", value: (u) => u.balance },
        { header: "Total Deposited", value: (u) => u.totalDeposited },
        { header: "Total Withdrawn", value: (u) => u.totalWithdrawn },
        { header: "Total Profit", value: (u) => u.totalProfit },
      ],
    );
    push(`Exported ${list.length} users to Excel`);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setEditForm({ displayName: u.displayName, email: u.email, phone: u.phone });
  };

  const saveEdit = () => {
    if (!editing) return;
    editUser(editing.id, editForm);
    setEditing(null);
    refresh();
    push(`Updated ${editForm.displayName}`);
  };

  const changeStatus = (u: AdminUser, s: AccountStatus) => {
    setUserStatus(u.id, s);
    refresh();
    push(`${u.displayName} is now ${s}`);
  };

  const changeRole = (u: AdminUser, r: MemberRole) => {
    setUserRole(u.id, r);
    setPermUser(null);
    refresh();
    push(`${u.displayName} promoted to ${r}`);
  };

  return (
    <>
      <div className="lumo-topbar">
        <div>
          <h1 className="lumo-title">Users</h1>
          <p className="lumo-sub">
            {users.length.toLocaleString()} accounts — search, filter, export, control.
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => doExport(true)}>
          ⭳ Export all to Excel
        </button>
      </div>

      <div className="lumo-panel">
        <div className="filter-bar">
          <div className="f" style={{ flex: 1, minWidth: 200 }}>
            <label>Search by email / username</label>
            <input
              className="input"
              placeholder="e.g. aisha@gmail.com"
              value={emailQuery}
              onChange={(e) => {
                setEmailQuery(e.target.value);
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
          <div className="f">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
          <div className="f">
            <label>Email verified</label>
            <select className="select" value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="yes">Verified</option>
              <option value="no">Unverified</option>
            </select>
          </div>
          <div className="f">
            <label>Created from</label>
            <input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="f">
            <label>Created to</label>
            <input className="input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => doExport(false)}>
            ⭳ Export filtered
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Display name</th>
                <th>Role</th>
                <th>2FA</th>
                <th>Created</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="strong">{u.username}</td>
                  <td>{u.email}</td>
                  <td className="num">{u.phone}</td>
                  <td>{u.displayName}</td>
                  <td>
                    <span className={`chip ${u.role === "franchise" ? "gold" : u.role === "agent" ? "amber" : "dim"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.is2fa ? <span className="chip green">2FA</span> : <span className="chip dim">—</span>}</td>
                  <td className="num">{u.createdAt}</td>
                  <td>{u.emailVerified ? <span className="chip green">✓</span> : <span className="chip red">✗</span>}</td>
                  <td>
                    <AccountStatusChip status={u.status} />
                  </td>
                  <td className="num">{usdt(u.balance)}</td>
                  <td>
                    <ActionMenu
                      items={[
                        { label: "Edit user info", icon: "✎", onClick: () => openEdit(u) },
                        { label: "Manage permission", icon: "⚙", onClick: () => setPermUser(u) },
                        { label: "Suspend user", icon: "⏸", onClick: () => changeStatus(u, "suspended") },
                        { label: "Freeze user", icon: "❄", onClick: () => changeStatus(u, "frozen") },
                        { label: "Reactivate", icon: "↺", onClick: () => changeStatus(u, "active") },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 40 }}>
                    No users match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
      </div>

      {editing && (
        <Modal title="Edit user info" sub={`@${editing.username} · ${editing.id}`} onClose={() => setEditing(null)}>
          <div className="field">
            <label>Display name</label>
            <input
              className="input"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              className="input"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn btn-gold btn-sm" onClick={saveEdit}>
              Save changes
            </button>
          </div>
        </Modal>
      )}

      {permUser && (
        <Modal title="Manage permission" sub={`@${permUser.username} — current role: ${permUser.role}`} onClose={() => setPermUser(null)}>
          <p style={{ color: "var(--ivory-dim)", fontSize: 14 }}>
            Set the member’s role in the network. Franchise and agent roles appear in
            the Network tree with their downlines attached.
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {(["member", "agent", "franchise"] as MemberRole[]).map((r) => (
              <button
                key={r}
                className="panel panel-pad"
                style={{
                  textAlign: "left",
                  color: "var(--ivory)",
                  border: permUser.role === r ? "1px solid var(--gold)" : "1px solid var(--line)",
                }}
                onClick={() => changeRole(permUser, r)}
              >
                <strong style={{ textTransform: "capitalize" }}>{r}</strong>
                <div className="mono-label" style={{ marginTop: 4 }}>
                  {r === "member" && "Standard account, no team tools"}
                  {r === "agent" && "Can build a downline, earns commission"}
                  {r === "franchise" && "Top of a branch, full community oversight"}
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {stack}
    </>
  );
}
