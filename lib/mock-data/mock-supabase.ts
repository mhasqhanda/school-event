/**
 * Mock Supabase Client untuk Live Demo
 * Menggunakan localStorage untuk menyimpan data tanpa database
 */

import {
  initialEvents,
  initialProfiles,
  initialParticipants,
  initialWishlist,
  demoUsers,
} from "./initial-data";

const STORAGE_KEYS = {
  events: "demo_events",
  participants: "demo_participants",
  profiles: "demo_profiles",
  wishlist: "demo_wishlist",
  session: "demo_session",
};

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage error:", e);
  }
}

function initStorage() {
  if (typeof window === "undefined") return;
  const events = getStorage(STORAGE_KEYS.events, null);
  if (!events) {
    setStorage(STORAGE_KEYS.events, initialEvents);
    setStorage(STORAGE_KEYS.profiles, initialProfiles);
    setStorage(STORAGE_KEYS.participants, initialParticipants);
    setStorage(STORAGE_KEYS.wishlist, initialWishlist);
  }
}

// Simulasi User untuk auth
interface DemoUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; role?: string };
}

function createDemoUser(
  id: string,
  email: string,
  fullName: string,
  role: string
): DemoUser {
  return {
    id,
    email,
    user_metadata: { full_name: fullName, role },
  };
}

// Query builder sederhana
type QueryFilter = { column: string; value: any; op?: string };
type QueryOrder = { column: string; ascending: boolean };

class MockQueryBuilder {
  private table: string;
  private filters: QueryFilter[] = [];
  private selectColumns: string = "*";
  private orderBy: QueryOrder | null = null;
  private limitCount: number | null = null;
  private singleResult = false;

  constructor(table: string) {
    this.table = table;
    initStorage();
  }

  select(columns: string = "*") {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, value: values, op: "in" });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  private filterData<T extends Record<string, any>>(data: T[]): T[] {
    return data.filter((row) => {
      return this.filters.every((f) => {
        const val = row[f.column];
        if (f.op === "in") return f.value.includes(val);
        return val === f.value;
      });
    });
  }

  private resolveSelect<T extends Record<string, any>>(
    row: T,
    columns: string
  ): Partial<T> {
    if (columns === "*") return row;
    const cols = columns.split(",").map((c) => c.trim());
    const result: any = {};
    for (const col of cols) {
      if (col.includes("(*)")) {
        const [rel] = col.split("(*)");
        const relName = rel.trim();
        if (relName === "events" && "event_id" in row) {
          const events = getStorage(STORAGE_KEYS.events, []);
          result.events =
            events.find((e: any) => e.id === row.event_id) || null;
        }
      } else {
        result[col] = row[col];
      }
    }
    return result;
  }

  async then<T>(
    resolve?: (value: { data: T | T[] | null; error: any }) => void
  ): Promise<{ data: T | T[] | null; error: any }> {
    const result = await this.execute();
    if (resolve) resolve(result);
    return result;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      let data: any[] = [];
      switch (this.table) {
        case "events":
          data = getStorage(STORAGE_KEYS.events, initialEvents);
          break;
        case "participants":
          data = getStorage(STORAGE_KEYS.participants, initialParticipants);
          break;
        case "profiles":
          data = getStorage(STORAGE_KEYS.profiles, initialProfiles);
          break;
        case "wishlist":
          data = getStorage(STORAGE_KEYS.wishlist, initialWishlist);
          break;
        default:
          return {
            data: null,
            error: { message: `Unknown table: ${this.table}` },
          };
      }

      let filtered = this.filterData([...data]);

      if (this.orderBy) {
        filtered.sort((a, b) => {
          const av = a[this.orderBy!.column];
          const bv = b[this.orderBy!.column];
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return this.orderBy!.ascending ? cmp : -cmp;
        });
      }

      if (this.limitCount) {
        filtered = filtered.slice(0, this.limitCount);
      }

      if (this.selectColumns.includes("events(*)")) {
        filtered = filtered.map((row) => {
          const events = getStorage(STORAGE_KEYS.events, []);
          const event = events.find((e: any) => e.id === row.event_id);
          return { ...row, events: event || null };
        });
      }

      if (this.selectColumns.includes("participants")) {
        filtered = filtered.map((row) => {
          const participants = getStorage(STORAGE_KEYS.participants, []);
          const eventParticipants = participants.filter(
            (p: any) => p.event_id === row.id
          );
          return { ...row, participants: eventParticipants };
        });
      }

      if (this.singleResult) {
        return {
          data: filtered[0] || null,
          error:
            filtered.length === 0
              ? { code: "PGRST116", message: "Row not found" }
              : null,
        };
      }

      return { data: filtered, error: null };
    } catch (e) {
      return { data: null, error: { message: String(e) } };
    }
  }
}

class MockInsertBuilder {
  private table: string;
  private row: Record<string, any>;

  constructor(table: string, row: Record<string, any>) {
    this.table = table;
    this.row = { ...row, created_at: new Date().toISOString() };
    initStorage();
  }

  select(columns: string = "*") {
    return this;
  }

  single() {
    return this;
  }

  async then<T>(
    resolve?: (value: { data: T | null; error: any }) => void
  ): Promise<{ data: T | null; error: any }> {
    const result = await this.execute();
    if (resolve) resolve(result);
    return result;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newRow = { ...this.row, id };

      switch (this.table) {
        case "events": {
          const data = getStorage(STORAGE_KEYS.events, initialEvents);
          data.push(newRow);
          setStorage(STORAGE_KEYS.events, data);
          break;
        }
        case "participants": {
          const data = getStorage(
            STORAGE_KEYS.participants,
            initialParticipants
          );
          data.push(newRow);
          setStorage(STORAGE_KEYS.participants, data);
          break;
        }
        case "profiles": {
          const data = getStorage(STORAGE_KEYS.profiles, initialProfiles);
          data.push(newRow);
          setStorage(STORAGE_KEYS.profiles, data);
          break;
        }
        case "wishlist": {
          const data = getStorage(STORAGE_KEYS.wishlist, initialWishlist);
          data.push(newRow);
          setStorage(STORAGE_KEYS.wishlist, data);
          break;
        }
        default:
          return {
            data: null,
            error: { message: `Unknown table: ${this.table}` },
          };
      }

      return { data: newRow, error: null };
    } catch (e) {
      return { data: null, error: { message: String(e) } };
    }
  }
}

class MockDeleteBuilder {
  private table: string;
  private filters: QueryFilter[] = [];

  constructor(table: string) {
    this.table = table;
    initStorage();
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  async then<T>(
    resolve?: (value: { data: T | null; error: any }) => void
  ): Promise<{ data: T | null; error: any }> {
    const result = await this.execute();
    if (resolve) resolve(result);
    return result;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      let data: any[] = [];
      switch (this.table) {
        case "events":
          data = getStorage(STORAGE_KEYS.events, initialEvents);
          break;
        case "participants":
          data = getStorage(STORAGE_KEYS.participants, initialParticipants);
          break;
        case "wishlist":
          data = getStorage(STORAGE_KEYS.wishlist, initialWishlist);
          break;
        default:
          return {
            data: null,
            error: { message: `Unknown table: ${this.table}` },
          };
      }

      const filtered = data.filter((row) => {
        return !this.filters.every((f) => row[f.column] === f.value);
      });
      setStorage(
        this.table === "events"
          ? STORAGE_KEYS.events
          : this.table === "participants"
          ? STORAGE_KEYS.participants
          : STORAGE_KEYS.wishlist,
        filtered
      );
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: { message: String(e) } };
    }
  }
}

class MockUpdateBuilder {
  private table: string;
  private updates: Record<string, any>;
  private filters: QueryFilter[] = [];

  constructor(table: string, updates: Record<string, any>) {
    this.table = table;
    this.updates = updates;
    initStorage();
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  select(columns: string = "*") {
    return this;
  }

  async then<T>(
    resolve?: (value: { data: T | T[] | null; error: any }) => void
  ): Promise<{ data: T | T[] | null; error: any }> {
    const result = await this.execute();
    if (resolve) resolve(result);
    return result;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      let data: any[] = [];
      let key = "";
      switch (this.table) {
        case "events":
          data = getStorage(STORAGE_KEYS.events, initialEvents);
          key = STORAGE_KEYS.events;
          break;
        case "participants":
          data = getStorage(STORAGE_KEYS.participants, initialParticipants);
          key = STORAGE_KEYS.participants;
          break;
        default:
          return {
            data: null,
            error: { message: `Unknown table: ${this.table}` },
          };
      }

      const updated = data.map((row) => {
        const match = this.filters.every((f) => row[f.column] === f.value);
        return match ? { ...row, ...this.updates } : row;
      });
      setStorage(key, updated);
      const changed = updated.filter((row) => {
        return this.filters.every((f) => row[f.column] === f.value);
      });
      return { data: changed.length === 1 ? changed[0] : changed, error: null };
    } catch (e) {
      return { data: null, error: { message: String(e) } };
    }
  }
}

// Auth mock
const authListeners: Array<
  (event: string, session: { user: DemoUser } | null) => void
> = [];

function getStoredSession(): { user: DemoUser; expires_at: number } | null {
  const s = getStorage<{ user: DemoUser; expires_at: number } | null>(
    STORAGE_KEYS.session,
    null
  );
  if (!s) return null;
  if (s.expires_at && Math.floor(Date.now() / 1000) >= s.expires_at) {
    setStorage(STORAGE_KEYS.session, null);
    return null;
  }
  return s;
}

function notifyAuthListeners(
  event: string,
  session: { user: DemoUser } | null
) {
  authListeners.forEach((cb) => cb(event, session));
}

export const mockAuth = {
  getSession: async () => {
    const session = getStoredSession();
    return {
      data: {
        session: session
          ? { user: session.user as any, expires_at: session.expires_at }
          : null,
      },
      error: null,
    };
  },
  signInWithPassword: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    // Demo login: password bisa apa saja
    let user: DemoUser | null = null;
    if (email === "teacher@demo.com" || email === "teacher") {
      user = demoUsers.teacher as DemoUser;
    } else if (email === "buyer@demo.com" || email === "buyer") {
      user = demoUsers.buyer as DemoUser;
    } else {
      // Coba cari di profiles
      const profiles = getStorage(STORAGE_KEYS.profiles, initialProfiles);
      const p = profiles.find((pr: any) => pr.email === email);
      if (p) {
        user = createDemoUser(p.id, p.email, p.full_name, p.role);
      }
    }

    if (user) {
      const session = {
        user,
        expires_at: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 hari
      };
      setStorage(STORAGE_KEYS.session, session);
      notifyAuthListeners("SIGNED_IN", { user });
      return {
        data: {
          user: user as any,
          session: { user, expires_at: session.expires_at },
        },
        error: null,
      };
    }

    return {
      data: { user: null, session: null },
      error: {
        message:
          "Invalid login. Gunakan teacher@demo.com atau buyer@demo.com untuk demo.",
      },
    };
  },
  signUp: async ({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: { full_name?: string; role?: string } };
  }) => {
    const id = `user-${Date.now()}`;
    const fullName = options?.data?.full_name || email.split("@")[0];
    const role = (options?.data?.role || "buyer") as "teacher" | "buyer";
    const user = createDemoUser(id, email, fullName, role);

    const profiles = getStorage(STORAGE_KEYS.profiles, initialProfiles);
    profiles.push({
      id,
      full_name: fullName,
      role,
      email,
      created_at: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.profiles, profiles);

    const session = {
      user,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 7,
    };
    setStorage(STORAGE_KEYS.session, session);
    notifyAuthListeners("SIGNED_IN", { user });
    return {
      data: {
        user: user as any,
        session: { user, expires_at: session.expires_at },
      },
      error: null,
    };
  },
  signOut: async () => {
    setStorage(STORAGE_KEYS.session, null);
    notifyAuthListeners("SIGNED_OUT", null);
    return { error: null };
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    authListeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const i = authListeners.indexOf(callback);
            if (i >= 0) authListeners.splice(i, 1);
          },
        },
      },
    };
  },
};

export function createMockClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) =>
        new MockQueryBuilder(table).select(columns || "*"),
      insert: (row: Record<string, any> | Record<string, any>[]) => {
        const r = Array.isArray(row) ? row[0] : row;
        return new MockInsertBuilder(table, r);
      },
      update: (updates: Record<string, any>) =>
        new MockUpdateBuilder(table, updates),
      delete: () => new MockDeleteBuilder(table),
    }),
    auth: mockAuth,
  };
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  }
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === ""
  );
}
