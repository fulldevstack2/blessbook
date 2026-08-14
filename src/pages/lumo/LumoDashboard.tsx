import { useMemo } from "react";
import {
  adminTxs,
  adminUsers,
  bundleVolume,
  topDeposits,
  topProfit,
  topWithdrawals,
  usdt,
} from "@/lib/admin-data";
import { TxStatusChip, TxTypeChip } from "@/components/lumo/ui";

export function LumoDashboard() {
  const users = useMemo(() => adminUsers(), []);
  const txs = useMemo(() => adminTxs(), []);

  const deposits = txs.filter((t) => t.type === "deposit" && t.status === "success");
  const withdrawals = txs.filter((t) => t.type === "withdrawal" && t.status === "success");
  const profit = txs.filter((t) => t.type === "profit");
  const pendingWithdrawals = txs.filter(
    (t) => t.type === "withdrawal" && ["pending", "init", "processing"].includes(t.status),
  );

  const sum = (list: typeof txs) => list.reduce((a, t) => a + t.amount, 0);
  const bundles = bundleVolume(txs);

  return (
    <>
      <div className="lumo-topbar">
        <div>
          <h1 className="lumo-title">Dashboard</h1>
          <p className="lumo-sub">Platform pulse — deposits, withdrawals, bundles, profit.</p>
        </div>
        <span className="chip gold">{users.length.toLocaleString()} members</span>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <div className="l">Total deposits</div>
          <div className="v">{usdt(sum(deposits))}</div>
          <div className="d">{deposits.length.toLocaleString()} successful</div>
        </div>
        <div className="metric">
          <div className="l">Total withdrawals</div>
          <div className="v">{usdt(sum(withdrawals))}</div>
          <div className="d down">{pendingWithdrawals.length} awaiting review</div>
        </div>
        <div className="metric">
          <div className="l">Bundle volume</div>
          <div className="v">{usdt(bundles.reduce((a, b) => a + b.volume, 0))}</div>
          <div className="d">{bundles.reduce((a, b) => a + b.count, 0).toLocaleString()} purchases</div>
        </div>
        <div className="metric">
          <div className="l">Profit credited</div>
          <div className="v">{usdt(sum(profit))}</div>
          <div className="d">{profit.length.toLocaleString()} yield payouts</div>
        </div>
      </div>

      {/* Top bundle deposits / purchases */}
      <div className="lumo-panel" style={{ marginBottom: 16 }}>
        <div className="lumo-panel-head">
          <h3>Top bundle deposits / purchases</h3>
          <span className="mono-label">by volume</span>
        </div>
        <div className="lumo-panel-body flush tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Bundle</th>
                <th>Price</th>
                <th>Daily yield</th>
                <th>Purchases</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((b, i) => (
                <tr key={b.bundle.id}>
                  <td className="num">{i + 1}</td>
                  <td className="strong">{b.bundle.name}</td>
                  <td className="num">{usdt(b.bundle.price)}</td>
                  <td className="num">{b.bundle.dailyYield}%</td>
                  <td className="num">{b.count.toLocaleString()}</td>
                  <td className="num strong" style={{ color: "var(--gold-hi)" }}>
                    {usdt(b.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lumo-grid-2" style={{ marginBottom: 16 }}>
        {/* Top 50 deposits */}
        <div className="lumo-panel">
          <div className="lumo-panel-head">
            <h3>Top 50 deposits</h3>
            <span className="mono-label">largest first</span>
          </div>
          <div className="lumo-panel-body flush tbl-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Network</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {topDeposits(txs).map((t, i) => (
                  <tr key={t.id}>
                    <td className="num">{i + 1}</td>
                    <td className="strong">{t.username}</td>
                    <td className="num" style={{ color: "var(--gold-hi)" }}>
                      {usdt(t.amount)}
                    </td>
                    <td className="num">{t.network}</td>
                    <td className="num">{t.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 50 withdrawals */}
        <div className="lumo-panel">
          <div className="lumo-panel-head">
            <h3>Top 50 withdrawals</h3>
            <span className="mono-label">largest first</span>
          </div>
          <div className="lumo-panel-body flush tbl-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {topWithdrawals(txs).map((t, i) => (
                  <tr key={t.id}>
                    <td className="num">{i + 1}</td>
                    <td className="strong">{t.username}</td>
                    <td className="num" style={{ color: "#ff8ba0" }}>
                      {usdt(t.amount)}
                    </td>
                    <td>
                      <TxStatusChip status={t.status} />
                    </td>
                    <td className="num">{t.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top 50 profit */}
      <div className="lumo-panel">
        <div className="lumo-panel-head">
          <h3>Top 50 profit</h3>
          <span className="mono-label">highest earners</span>
        </div>
        <div className="lumo-panel-body flush tbl-wrap" style={{ maxHeight: 480, overflowY: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Total profit</th>
                <th>Deposited</th>
                <th>Withdrawn</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {topProfit(users).map((u, i) => (
                <tr key={u.id}>
                  <td className="num">{i + 1}</td>
                  <td className="strong">{u.displayName}</td>
                  <td>
                    <span className={`chip ${u.role === "franchise" ? "gold" : u.role === "agent" ? "amber" : "dim"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="num" style={{ color: "var(--gold-hi)" }}>
                    {usdt(u.totalProfit)}
                  </td>
                  <td className="num">{usdt(u.totalDeposited)}</td>
                  <td className="num">{usdt(u.totalWithdrawn)}</td>
                  <td className="num">{usdt(u.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mono-label" style={{ marginTop: 18 }}>
        <TxTypeChip type="deposit" /> deposits · <TxTypeChip type="withdrawal" /> withdrawals ·{" "}
        <TxTypeChip type="bundle_purchase" /> bundles · live from seeded ledger
      </p>
    </>
  );
}
