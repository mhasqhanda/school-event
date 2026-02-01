"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { clearBrowserSession } from "@/lib/utils";

// Tipe user demo (tanpa Supabase)
export interface DemoUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; role?: string };
}

interface UserProfile {
  id: string;
  full_name: string;
  role: "teacher" | "buyer";
}

interface AuthContextType {
  user: DemoUser | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "teacher" | "buyer"
  ) => Promise<any>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk membersihkan session secara manual
  const clearSession = useCallback(async () => {
    await supabase.auth.signOut();
    // Gunakan utility function untuk membersihkan browser session
    clearBrowserSession();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  // Refresh profile dari data demo
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(userProfile as UserProfile | null);
  }, [supabase, user]);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && now >= session.expires_at) {
            await clearSession();
            return;
          }

          setUser(session.user);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          let userProfile: UserProfile | null =
            profileData as UserProfile | null;

          // Jika profile belum ada, buat otomatis
          if (!userProfile) {
            const defaultRole = session.user.user_metadata?.role || "buyer";
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                full_name:
                  session.user.user_metadata?.full_name ||
                  session.user.email ||
                  "New User",
                role: defaultRole,
              })
              .select();

            if (insertError) {
              console.error(
                "Gagal membuat profil pengguna secara otomatis:",
                insertError
              );
            } else {
              userProfile = newProfile as UserProfile | null;
            }
          }
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setProfile(null);
      } finally {
        // Pastikan loading selalu false setelah selesai, bahkan jika ada error
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user: DemoUser } | null) => {
        console.log("Auth state changed:", event, session?.user?.email);
        try {
          if (event === "SIGNED_IN" && session?.user) {
            setUser(session.user);
            const { data: userProfile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error("Gagal mengambil profil saat login:", profileError);
              // Set profil ke null jika gagal, jangan biarkan menggantung
              setProfile(null);
            } else {
              setProfile(userProfile as UserProfile | null);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.error("Terjadi error kritis pada onAuthStateChange:", error);
          setUser(null);
          setProfile(null);
        } finally {
          // Jaminan: Pastikan loading selalu dimatikan, apa pun yang terjadi.
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({
        email,
        password,
      });
    },
    [supabase]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: "teacher" | "buyer"
    ) => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      profile,
      login,
      signUp,
      logout,
      clearSession,
      loading,
      refreshProfile,
    }),
    [
      user,
      profile,
      login,
      signUp,
      logout,
      clearSession,
      loading,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
