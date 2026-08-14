import type {
  AccountStatus,
  AdminOverlays,
  AdminUser,
  Bundle,
  MemberRole,
  NetworkCode,
  Tx,
  TxStatus,
  TxType,
} from "./types";

/* Deterministic RNG so every visitor sees the same ledger. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260814);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function int(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const FIRST = [
  "Ahmad", "Aiman", "Aisha", "Amir", "Anita", "Arif", "Azlan", "Bala",
  "Carmen", "Chan", "Chen", "Daniel", "Deepa", "Devi", "Faiz", "Farah",
  "Grace", "Hafiz", "Hannah", "Hari", "Hui", "Irfan", "Jason", "Jay",
  "Kavitha", "Kelvin", "Kumar", "Laila", "Lee", "Lim", "Lina", "Marcus",
  "Mei", "Michelle", "Nadia", "Nurul", "Priya", "Raj", "Ravi", "Rizal",
  "Sarah", "Siti", "Suresh", "Syafiq", "Tan", "Wei", "Yasmin", "Yong",
  "Zain", "Zara", "Aisyah", "Alif", "Anwar", "Chong", "Elena", "Firdaus",
  "Goh", "Idris", "Jasmine", "Kiran", "Liyana", "Muthu", "Nash", "Oscar",
];

const LAST = [
  "Abdullah", "Ahmad", "Ali", "Chan", "Chen", "Chong", "Goh", "Hassan",
  "Ibrahim", "Kaur", "Kumar", "Lau", "Lee", "Lim", "Ling", "Menon",
  "Nair", "Ng", "Ong", "Rahman", "Raj", "Sharma", "Singh", "Tan", "Teh",
  "Wong", "Yap", "Yusof", "Zainal", "Othman", "Pillai", "Subramaniam",
];

const NETWORKS: NetworkCode[] = ["TRC20", "ERC20", "BEP20"];

export const BUNDLES: Bundle[] = [
  { id: "b-starter", name: "Starter Note", price: 100, dailyYield: 0.6, durationDays: 90 },
  { id: "b-bronze", name: "Bronze Chord", price: 500, dailyYield: 0.7, durationDays: 120 },
  { id: "b-silver", name: "Silver Melody", price: 1000, dailyYield: 0.8, durationDays: 150 },
  { id: "b-gold", name: "Gold Harmony", price: 5000, dailyYield: 0.9, durationDays: 180 },
  { id: "b-platinum", name: "Platinum Symphony", price: 10000, dailyYield: 1.0, durationDays: 240 },
  { id: "b-diamond", name: "Diamond Opus", price: 25000, dailyYield: 1.1, durationDays: 365 },
];

function walletFor(network: NetworkCode): string {
  const hex = "0123456789abcdef";
  const b58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  if (network === "TRC20") {
    let s = "T";
    for (let i = 0; i < 33; i++) s += b58[Math.floor(rand() * b58.length)];
    return s;
  }
  let s = "0x";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(rand() * 16)];
  return s;
}

function daysAgo(n: number, hour = int(0, 23), min = int(0, 59)): string {
  const d = new Date(2026, 7, 14, hour, min);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateOnly(iso: string) {
  return iso.slice(0, 10);
}

/* ---------------- user tree ---------------- */

const USER_COUNT = 640;

function buildUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  const usedNames = new Set<string>();

  function makeUser(
    id: string,
    role: MemberRole,
    uplineId: string | null,
    createdDaysAgo: number,
  ): AdminUser {
    let name = `${pick(FIRST)} ${pick(LAST)}`;
    while (usedNames.has(name)) name = `${pick(FIRST)} ${pick(LAST)}`;
    usedNames.add(name);
    const username =
      name.toLowerCase().replace(/[^a-z]+/g, ".") + (rand() < 0.4 ? String(int(1, 99)) : "");
    const network = pick(NETWORKS);
    const deposited = role === "member" ? int(0, 30) * 100 : int(5, 120) * 100;
    const profit = Math.round(deposited * (0.05 + rand() * 0.6));
    const withdrawn = Math.round(profit * rand() * 0.9);
    const created = daysAgo(createdDaysAgo);
    return {
      id,
      username,
      email: `${username}@${pick(["gmail.com", "yahoo.com", "outlook.com", "blesspoke.com"])}`,
      phone: `+60 1${int(0, 9)}-${int(100, 999)} ${int(1000, 9999)}`,
      displayName: name,
      role,
      is2fa: rand() < 0.45,
      createdAt: dateOnly(created),
      emailVerified: rand() < 0.85,
      status: rand() < 0.9 ? "active" : rand() < 0.6 ? "suspended" : "frozen",
      uplineId,
      walletAddress: walletFor(network),
      network,
      balance: Math.max(0, Math.round(deposited + profit - withdrawn)),
      totalDeposited: deposited,
      totalWithdrawn: withdrawn,
      totalProfit: profit,
    };
  }

  // 3 franchise roots
  const roots: AdminUser[] = [];
  for (let i = 0; i < 3; i++) {
    const root = makeUser(`m-${i}`, "franchise", null, int(300, 400));
    roots.push(root);
    users.push(root);
  }

  // BFS expansion: each node gets children until we hit USER_COUNT
  const queue: { id: string; depth: number }[] = roots.map((r) => ({
    id: r.id,
    depth: 0,
  }));
  let n = users.length;
  while (n < USER_COUNT && queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const kids = depth === 0 ? int(4, 7) : depth === 1 ? int(3, 6) : depth < 5 ? int(0, 4) : int(0, 2);
    for (let k = 0; k < kids && n < USER_COUNT; k++) {
      const role: MemberRole =
        depth === 0 ? "agent" : depth <= 2 && rand() < 0.5 ? "agent" : "member";
      const u = makeUser(`m-${n}`, role, id, Math.max(1, int(1, 300 - depth * 40)));
      users.push(u);
      n++;
      if (depth < 7) queue.push({ id: u.id, depth: depth + 1 });
    }
  }
  return users;
}

/* ---------------- transactions ---------------- */

const TX_COUNT = 3400;

function buildTxs(users: AdminUser[]): Tx[] {
  const txs: Tx[] = [];
  let seq = 0;
  const nextId = () => `TX${String(100000 + seq++)}`;

  for (let i = 0; i < TX_COUNT; i++) {
    const u = pick(users);
    const daysBack = Math.floor(Math.pow(rand(), 1.6) * 180);
    const createdAt = daysAgo(daysBack);
    const roll = rand();
    let type: TxType;
    if (roll < 0.3) type = "deposit";
    else if (roll < 0.52) type = "bundle_purchase";
    else if (roll < 0.72) type = "profit";
    else if (roll < 0.84) type = "commission";
    else type = "withdrawal";

    let amount: number;
    let status: TxStatus;
    let bundleId: string | undefined;
    let bundleName: string | undefined;
    let note: string | undefined;

    switch (type) {
      case "deposit": {
        amount = pick([100, 200, 500, 1000, 2500, 5000, 10000, 25000]);
        status = rand() < 0.94 ? "success" : rand() < 0.5 ? "pending" : "failed";
        break;
      }
      case "bundle_purchase": {
        const b = pick(BUNDLES);
        amount = b.price;
        bundleId = b.id;
        bundleName = b.name;
        status = rand() < 0.96 ? "success" : "pending";
        break;
      }
      case "profit": {
        amount = Math.round(rand() * 480 + 5);
        status = "success";
        note = "Daily bundle yield";
        break;
      }
      case "commission": {
        amount = Math.round(rand() * 900 + 10);
        status = "success";
        note = "Downline commission";
        break;
      }
      case "withdrawal": {
        amount = pick([50, 100, 250, 500, 1000, 2000, 5000, 12000]);
        const r = rand();
        status =
          r < 0.68 ? "success" : r < 0.8 ? "pending" : r < 0.87 ? "init" : r < 0.94 ? "processing" : r < 0.97 ? "rejected" : "failed";
        break;
      }
    }

    txs.push({
      id: nextId(),
      type,
      userId: u.id,
      username: u.username,
      amount,
      network: u.network,
      walletAddress: u.walletAddress,
      status,
      createdAt,
      bundleId,
      bundleName,
      note,
    });
  }

  txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return txs;
}

/* ---------------- overlays (admin actions) ---------------- */

const OVERLAY_KEY = "blesspoke.lumo.overlays.v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getOverlays(): AdminOverlays {
  if (!canUseStorage()) return emptyOverlays();
  const raw = window.localStorage.getItem(OVERLAY_KEY);
  if (!raw) return emptyOverlays();
  try {
    return { ...emptyOverlays(), ...(JSON.parse(raw) as AdminOverlays) };
  } catch {
    return emptyOverlays();
  }
}

function emptyOverlays(): AdminOverlays {
  return { txStatus: {}, userStatus: {}, userRoles: {}, upline: {}, userEdits: {} };
}

function writeOverlays(o: AdminOverlays) {
  window.localStorage.setItem(OVERLAY_KEY, JSON.stringify(o));
}

/* ---------------- cached seed ---------------- */

let cachedUsers: AdminUser[] | null = null;
let cachedTxs: Tx[] | null = null;

export function adminUsers(): AdminUser[] {
  if (!cachedUsers) cachedUsers = buildUsers();
  const o = getOverlays();
  return cachedUsers.map((u) => ({
    ...u,
    status: o.userStatus[u.id] ?? u.status,
    role: o.userRoles[u.id] ?? u.role,
    uplineId: u.id in o.upline ? o.upline[u.id]! : u.uplineId,
    ...(o.userEdits[u.id] ?? {}),
  }));
}

export function adminTxs(): Tx[] {
  if (!cachedTxs) cachedTxs = buildTxs(adminUsers());
  const o = getOverlays();
  return cachedTxs.map((t) => ({ ...t, status: o.txStatus[t.id] ?? t.status }));
}

export function findAdminUser(id: string): AdminUser | null {
  return adminUsers().find((u) => u.id === id) ?? null;
}

/* ---------------- admin mutations ---------------- */

export function setTxStatus(id: string, status: TxStatus) {
  const o = getOverlays();
  o.txStatus[id] = status;
  writeOverlays(o);
}

export function setUserStatus(id: string, status: AccountStatus) {
  const o = getOverlays();
  o.userStatus[id] = status;
  writeOverlays(o);
}

export function setUserRole(id: string, role: MemberRole) {
  const o = getOverlays();
  o.userRoles[id] = role;
  writeOverlays(o);
}

export function setUserUpline(id: string, uplineId: string | null) {
  const o = getOverlays();
  o.upline[id] = uplineId;
  writeOverlays(o);
}

export function editUser(id: string, patch: Partial<Pick<AdminUser, "displayName" | "phone" | "email">>) {
  const o = getOverlays();
  o.userEdits[id] = { ...o.userEdits[id], ...patch };
  writeOverlays(o);
}

/** True if `candidateId` is `userId` itself or sits anywhere below it (cycle guard). */
export function isDescendant(userId: string, candidateId: string): boolean {
  if (userId === candidateId) return true;
  const byId = new Map(adminUsers().map((u) => [u.id, u]));
  let cur = byId.get(candidateId);
  const guard = new Set<string>();
  while (cur && cur.uplineId) {
    if (cur.uplineId === userId) return true;
    if (guard.has(cur.uplineId)) return false;
    guard.add(cur.uplineId);
    cur = byId.get(cur.uplineId);
  }
  return false;
}

export function childrenOf(id: string | null): AdminUser[] {
  return adminUsers().filter((u) => u.uplineId === id);
}

export function downlineCount(id: string): number {
  const kids = childrenOf(id);
  return kids.reduce((acc, k) => acc + 1 + downlineCount(k.id), 0);
}

/* ---------------- aggregates ---------------- */

export function usdt(n: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)} USDT`;
}

export function topDeposits(txs: Tx[], limit = 50): Tx[] {
  return txs
    .filter((t) => t.type === "deposit" && t.status === "success")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function topWithdrawals(txs: Tx[], limit = 50): Tx[] {
  return txs
    .filter((t) => t.type === "withdrawal")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function topProfit(users: AdminUser[], limit = 50): AdminUser[] {
  return [...users].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, limit);
}

export interface BundleStat {
  bundle: Bundle;
  count: number;
  volume: number;
}

export function bundleVolume(txs: Tx[]): BundleStat[] {
  const map = new Map<string, { count: number; volume: number }>();
  for (const t of txs) {
    if (t.type !== "bundle_purchase" || !t.bundleId) continue;
    const cur = map.get(t.bundleId) ?? { count: 0, volume: 0 };
    cur.count++;
    if (t.status === "success") cur.volume += t.amount;
    map.set(t.bundleId, cur);
  }
  return BUNDLES.map((bundle) => ({
    bundle,
    count: map.get(bundle.id)?.count ?? 0,
    volume: map.get(bundle.id)?.volume ?? 0,
  })).sort((a, b) => b.volume - a.volume);
}
