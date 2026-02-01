import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEMO_STORAGE_KEYS = [
  "demo_session",
  "demo_events",
  "demo_participants",
  "demo_profiles",
  "demo_wishlist",
];

/** Bersihkan session dan data demo dari browser */
export function clearBrowserSession() {
  if (typeof window === "undefined") return;

  DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();

  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

/** Info session demo yang tersimpan */
export function getSessionInfo() {
  if (typeof window === "undefined") return null;

  const demoKeys = DEMO_STORAGE_KEYS.filter((key) => localStorage.getItem(key));

  return {
    hasSupabaseData: false,
    hasDemoData: demoKeys.length > 0,
    supabaseKeys: [] as string[],
    demoKeys,
    sessionStorageLength: sessionStorage.length,
    cookies: document.cookie,
  };
}
