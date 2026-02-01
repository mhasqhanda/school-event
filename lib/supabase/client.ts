/**
 * Pure demo mode: selalu pakai mock client (localStorage).
 * Tidak ada koneksi Supabase.
 */
import { createMockClient } from "@/lib/mock-data/mock-supabase";

export function createClient() {
  return createMockClient() as ReturnType<typeof createMockClient>;
}
