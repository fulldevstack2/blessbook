import { useMemo, useState } from "react";
import { adminTxs, adminUsers, bundleVolume, setTxStatus, usdt } from "@/lib/admin-data";
import type { Tx, TxStatus } from "@/lib/types";
import { exportToExcel } from "@/lib/excel";
import { Pager, TxStatusChip, TxTypeChip, useToasts } from "@/components/lumo/ui";

const PAGE_SIZE = 15;

type TabId = "all" | "withdrawals" | "bundles" | "deposits";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "Transactions" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "bundles", label: "Bundle Volume" },
  { id: "deposits", label: "Deposits / Bundles" },
];

const ACTIONABLE: TxStatus[] = ["init", "pending", "processing"];

export function LumoTransactions() {
  const [, setVersion] = useState(0);
  const { push, stack } = useToasts();

  const [tab, setTab] = useState<TabId>("all");

  // filters
  const [userQ, setUserQ] = useState("");
  const [walletQ, setWalletQ] = useState("");
  const [network, setNetwork] = useState("");
  const [statusF, setStatusF] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const txs = useMemo(() => adminTxs(), []);
  const users = useMemo(() => adminUsers(), []);
  const bundles = useMemo(() => bundleVolume(txs), [txs]);

  const tabTxs = useMemo(() => {
    switch (tab) {
      case "withdrawals":
        return txs.filter((t) => t.type === "withdrawal");
      case "deposits":
        return txs.filter((t) => t.type === "deposit" || t.type === "bundle_purchase");
      default:
        return txs;
    }
  }, [txs, tab]);

  const filtered = useMemo(() => {
    const uq = userQ.trim().toLowerCase();
    const wq = walletQ.trim().toLowerCase();
    const min = minAmt ? Number(minAmt) : null;
    const max = maxAmt ? Number(maxAmt) : null;
    return tabTxs.filter((t) => {
      if (uq && !t.username.toLowerCase().includes(uq)) return false;
      if (wq && !t.walletAddress.toLowerCase().includes(wq)) return false;
      if (network && t.network !== network) return false;
      if (statusF && t.status !== statusF) return false;
      if (min !== null && t.amount < min) return false;
      if (max !== null && t.amount > max) return false;
      if (from && t.createdAt.slice(0, 10) < from) return false;
      if (to && t.createdAt.slice(0, 10) > to) return false;
      return true;
    });
  }, [tabTxs, userQ, walletQ, network, statusF, minAmt, maxAmt, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const refresh = () => setVersion((v) => v + 1);

  const review = (t: Tx, status: TxStatus) => {
    setTxStatus(t.id, status);
    refresh();
    push(`${t.id} ${status === "success" ? "approved" : "rejected"} — ${usdt(t.amount)} for ${t.username}`);
  };

  const doExport = (all: boolean) => {
    const list = all ? tabTxs : filtered;
    exportToExcel(
      all ? `lumo-${tab}-all` : `lumo-${tab}-filtered`,
      TABS.find((t) => t.id === tab)!.label,
      list,
      [
        { header: "Tx ID", value: (t) => t.id },
        { header: "Type", value: (t) => t.type },
        { header: "Username", value: (t) => t.username },
        { header: "Amount (USDT)", value: (t) => t.amount },
        { header: "Network", value: (t) => t.network },
        { header: "Wallet Address", value: (t) => t.walletAddress },
        { header: "Status", value: (t) => t.status },
        { header: "Bundle", value: (t) => t.bundleName ?? "" },
        { header: "Note", value: (t) => t.note ?? "" },
        { header: "Timestamp", value: (t) => t.createdAt.replace("T", " ").slice(0, 16) },
      ],
    );
    push(`Exported ${list.length} transactions to Excel`);
  };

  const tabCount = (id: TabId) => {
    switch (id) {
      case "withdrawals":
        return txs.filter((t) => t.type === "withdrawal").length;
      case "deposits":
        return txs.filter((t) => t.type === "deposit" || t.type === "bundle_purchase").length;
      case "bundles":
        return txs.filter((t) => t.type === "bundle_purchase").length;
      default:
        return txs.length;
    }
  };

  return (
    <>
      <div className="lumo-topbar">
        <div>
          <h1 className="lumo-title">Transactions</h1>
          <p className="lumo-sub">
            Every financial movement on the platform — {txs.length.toLocaleString()} records.
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => doExport(true)}>
          ⭳ Export all to Excel
        </button>
      </div>

      <div className="lumo-panel">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab${tab === t.id ? " active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
            >
              {t.label}
              <span className="count">{tabCount(t.id).toLocaleString()}</span>
            </button>
          ))}
        </div>

        {tab === "bundles" ? (
          <BundleVolumeTab bundles={bundles} />
        ) : (
          <>
            <div className="filter-bar">
              <div className="f">
                <label>Username</label>
                <input className="input" placeholder="user" value={userQ} onChange={(e) => { setUserQ(e.target.value); setPage(1); }} />
              </div>
              <div className="f">
                <label>Wallet</label>
                <input className="input" placeholder="T… / 0x…" value={walletQ} onChange={(e) => { setWalletQ(e.target.value); setPage(1); }} />
              </div>
              <div className="f">
                <label>Network</label>
                <select className="select" value={network} onChange={(e) => { setNetwork(e.target.value); setPage(1); }}>
                  <option value="">All</option>
                  <option>TRC20</option>
                  <option>ERC20</option>
                  <option>BEP20</option>
                </select>
              </div>
              <div className="f">
                <label>Status</label>
                <select className="select" value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}>
                  <option value="">All</option>
                  {["init", "pending", "processing", "success", "rejected", "failed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="f">
                <label>Min USDT</label>
                <input className="input" type="number" min={0} value={minAmt} onChange={(e) => { setMinAmt(e.target.value); setPage(1); }} />
              </div>
              <div className="f">
                <label>Max USDT</label>
                <input className="input" type="number" min={0} value={maxAmt} onChange={(e) => { setMaxAmt(e.target.value); setPage(1); }} />
              </div>
              <div className="f">
                <label>From</label>
                <input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="f">
                <label>To</label>
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
                    <th>Tx ID</th>
                    <th>Type</th>
                    <th>Username</th>
                    <th>Amount</th>
                    {tab === "withdrawals" && <th>Wallet address</th>}
                    <th>Network</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    {tab === "withdrawals" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id}>
                      <td className="num">{t.id}</td>
                      <td>
                        <TxTypeChip type={t.type} />
                      </td>
                      <td className="strong">{t.username}</td>
                      <td className="num" style={{ color: t.type === "withdrawal" ? "#ff8ba0" : "var(--gold-hi)" }}>
                        {usdt(t.amount)}
                      </td>
                      {tab === "withdrawals" && (
                        <td className="num" title={t.walletAddress}>
                          {t.walletAddress.slice(0, 10)}…{t.walletAddress.slice(-6)}
                        </td>
                      )}
                      <td className="num">{t.network}</td>
                      <td>
                        <TxStatusChip status={t.status} />
                      </td>
                      <td className="num">{t.createdAt.replace("T", " ").slice(0, 16)}</td>
                      {tab === "withdrawals" && (
                        <td>
                          {ACTIONABLE.includes(t.status) ? (
                            <span style={{ display: "inline-flex", gap: 6 }}>
                              <button className="btn btn-gold btn-sm" onClick={() => review(t, "success")}>
                                Approve
                              </button>
                              <button className="btn btn-red btn-sm" onClick={() => review(t, "rejected")}>
                                Reject
                              </button>
                            </span>
                          ) : (
                            <span className="mono-label">reviewed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: 40 }}>
                        No transactions match those filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
          </>
        )}
      </div>

      {stack}
    </>
  );
}

function BundleVolumeTab({
  bundles,
}: {
  bundles: ReturnType<typeof bundleVolume>;
}) {
  const users = adminUsers();
  const totalVolume = bundles.reduce((a, b) => a + b.volume, 0);
  return (
    <div className="lumo-panel-body">
      <div className="metric-grid" style={{ marginBottom: 18 }}>
        <div className="metric">
          <div className="l">Total bundle volume</div>
          <div className="v">{usdt(totalVolume)}</div>
        </div>
        <div className="metric">
          <div className="l">Bundle purchases</div>
          <div className="v">{bundles.reduce((a, b) => a + b.count, 0).toLocaleString()}</div>
        </div>
        <div className="metric">
          <div className="l">Active bundles</div>
          <div className="v">{bundles.filter((b) => b.count > 0).length}</div>
        </div>
        <div className="metric">
          <div className="l">Holders</div>
          <div className="v">{users.filter((u) => u.totalDeposited > 0).length}</div>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Bundle</th>
              <th>Price</th>
              <th>Daily yield</th>
              <th>Duration</th>
              <th>Purchases</th>
              <th>Volume</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b.bundle.id}>
                <td className="strong">{b.bundle.name}</td>
                <td className="num">{usdt(b.bundle.price)}</td>
                <td className="num">{b.bundle.dailyYield}%</td>
                <td className="num">{b.bundle.durationDays}d</td>
                <td className="num">{b.count.toLocaleString()}</td>
                <td className="num" style={{ color: "var(--gold-hi)" }}>
                  {usdt(b.volume)}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        height: 6,
                        width: 120,
                        background: "var(--ink)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${totalVolume ? (b.volume / totalVolume) * 100 : 0}%`,
                          background: "linear-gradient(90deg, var(--gold-deep), var(--gold))",
                        }}
                      />
                    </div>
                    <span className="num">
                      {totalVolume ? Math.round((b.volume / totalVolume) * 100) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
