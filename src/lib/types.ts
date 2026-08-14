export type Role = "listener" | "creator" | "admin";

export type MoneyCurrency = "USD" | "MYR";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  createdAt: string;
  emailVerified: boolean;
  is2fa: boolean;
  status: AccountStatus;
}

export type AccountStatus = "active" | "suspended" | "frozen";

export type PackageKind = "signature" | "story" | "anthem";

export interface SongPackage {
  id: string;
  kind: PackageKind;
  name: string;
  tier: string;
  price: number;
  currency: MoneyCurrency;
  days: number;
  revisions: number;
  blurb: string;
  includes: string[];
  featured?: boolean;
}

export type ProjectStatus =
  | "briefed"
  | "accepted"
  | "in_production"
  | "preview"
  | "delivered"
  | "completed";

export interface Project {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  occasion: string;
  recipient: string;
  packageId: string;
  price: number;
  currency: MoneyCurrency;
  status: ProjectStatus;
  createdAt: string;
  deedId?: string;
}

export type NotificationKind = "project" | "payment" | "system";

export interface AppNotification {
  id: string;
  userId: string;
  projectId?: string;
  kind: NotificationKind;
  text: string;
  read: boolean;
  at: string;
}

/* ---------------- Lumo admin domain ---------------- */

export type NetworkCode = "TRC20" | "ERC20" | "BEP20";

export type MemberRole = "member" | "agent" | "franchise";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  displayName: string;
  role: MemberRole;
  is2fa: boolean;
  createdAt: string; // ISO date
  emailVerified: boolean;
  status: AccountStatus;
  uplineId: string | null;
  walletAddress: string;
  network: NetworkCode;
  balance: number; // USDT
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfit: number;
}

export type TxType =
  | "deposit"
  | "withdrawal"
  | "bundle_purchase"
  | "profit"
  | "commission";

export type TxStatus =
  | "init"
  | "pending"
  | "processing"
  | "success"
  | "rejected"
  | "failed";

export interface Tx {
  id: string;
  type: TxType;
  userId: string;
  username: string;
  amount: number; // USDT
  network: NetworkCode;
  walletAddress: string;
  status: TxStatus;
  createdAt: string; // ISO datetime
  bundleId?: string;
  bundleName?: string;
  note?: string;
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  dailyYield: number;
  durationDays: number;
}

/** Admin overlays persisted to localStorage */
export interface AdminOverlays {
  txStatus: Record<string, TxStatus>;
  userStatus: Record<string, AccountStatus>;
  userRoles: Record<string, MemberRole>;
  upline: Record<string, string | null>;
  userEdits: Record<string, Partial<Pick<AdminUser, "displayName" | "phone" | "email">>>;
}
