import { DEMO_USERS, PACKAGES } from "./data";
import type {
  AppNotification,
  MoneyCurrency,
  Project,
  Role,
  SongPackage,
  User,
} from "./types";

export type Session = { userId: string; role: Role };

const SESSION_KEY = "blesspoke.session.v1";
const PROJECTS_KEY = "blesspoke.projects.v1";
const EXTRA_USERS_KEY = "blesspoke.users.v1";
const NOTIFICATIONS_KEY = "blesspoke.notifications.v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------------- users / auth ---------------- */

export function getExtraUsers(): User[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(EXTRA_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function allUsers(): User[] {
  const extras = getExtraUsers();
  const ids = new Set(extras.map((u) => u.id));
  return [...extras, ...DEMO_USERS.filter((u) => !ids.has(u.id))];
}

export function findUserById(id: string): User | null {
  return allUsers().find((u) => u.id === id) ?? null;
}

export function getSession(): Session | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!canUseStorage()) return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function currentUser(): User | null {
  const s = getSession();
  if (!s) return null;
  return findUserById(s.userId);
}

export function login(email: string, password: string): User | null {
  const normalized = email.trim().toLowerCase();
  const user = allUsers().find((u) => u.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return null;
  setSession({ userId: user.id, role: user.role });
  return user;
}

export function loginAs(role: Role): User {
  const user = DEMO_USERS.find((u) => u.role === role)!;
  setSession({ userId: user.id, role: user.role });
  return user;
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): { user: User | null; error?: string } {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name || !email || input.password.length < 4) {
    return {
      user: null,
      error: "Name, email, and a password of at least 4 characters are required.",
    };
  }
  if (allUsers().some((u) => u.email.toLowerCase() === email)) {
    return { user: null, error: "That email is already registered." };
  }
  const user: User = {
    id: newId("u"),
    email,
    password: input.password,
    name,
    role: "listener",
    createdAt: new Date().toISOString().slice(0, 10),
    emailVerified: false,
    is2fa: false,
    status: "active",
  };
  window.localStorage.setItem(
    EXTRA_USERS_KEY,
    JSON.stringify([user, ...getExtraUsers()]),
  );
  setSession({ userId: user.id, role: user.role });
  return { user };
}

export function resetPassword(
  email: string,
  newPassword: string,
): { ok: boolean; error?: string } {
  const normalized = email.trim().toLowerCase();
  const user = allUsers().find((u) => u.email.toLowerCase() === normalized);
  if (!user) return { ok: false, error: "No account found for that email." };
  if (newPassword.length < 4) {
    return { ok: false, error: "Use a password of at least 4 characters." };
  }
  const extras = getExtraUsers();
  const idx = extras.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    extras[idx] = { ...extras[idx]!, password: newPassword };
    window.localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify(extras));
  } else {
    window.localStorage.setItem(
      EXTRA_USERS_KEY,
      JSON.stringify([{ ...user, password: newPassword }, ...extras]),
    );
  }
  return { ok: true };
}

/* ---------------- projects ---------------- */

export function getProjects(): Project[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveProject(project: Project) {
  const all = getProjects();
  const next = [project, ...all.filter((p) => p.id !== project.id)];
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
}

export function updateProject(id: string, patch: Partial<Project>) {
  const current = getProjects().find((p) => p.id === id);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveProject(next);
  return next;
}

export function getProject(id: string): Project | null {
  return getProjects().find((p) => p.id === id) ?? null;
}

export function packageById(id: string): SongPackage {
  return PACKAGES.find((p) => p.id === id) ?? PACKAGES[0]!;
}

/* ---------------- notifications ---------------- */

export function getNotifications(): AppNotification[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function writeNotifications(list: AppNotification[]) {
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
}

export function pushNotification(
  input: Omit<AppNotification, "id" | "read" | "at"> & { at?: string },
): AppNotification {
  const note: AppNotification = {
    id: newId("n"),
    userId: input.userId,
    projectId: input.projectId,
    kind: input.kind,
    text: input.text,
    read: false,
    at: input.at ?? new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  writeNotifications([note, ...getNotifications()].slice(0, 80));
  return note;
}

export function notificationsFor(userId: string) {
  return getNotifications().filter((n) => n.userId === userId);
}

export function markAllNotificationsRead(userId: string) {
  writeNotifications(
    getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n)),
  );
}

/* ---------------- money ---------------- */

export function money(n: number, currency: MoneyCurrency = "USD") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function statusLabel(status: Project["status"]): string {
  switch (status) {
    case "briefed":
      return "Brief received";
    case "accepted":
      return "Dennis accepted";
    case "in_production":
      return "In production";
    case "preview":
      return "Preview ready";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Yours forever";
  }
}
