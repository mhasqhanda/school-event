"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ✅ AMAN: baca searchParams DI useEffect
  useEffect(() => {
    const token =
      searchParams.get("access_token") || searchParams.get("code");
    setAccessToken(token);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast({
        title: "Token tidak valid",
        description: "Link reset password tidak valid atau sudah kadaluarsa.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Konfirmasi password tidak cocok",
        description: "Pastikan kedua password sama persis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: "Gagal reset password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password berhasil direset!",
        description: "Silakan login dengan password baru.",
      });
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111827] to-[#1C294A]">
      <Card className="w-full max-w-md bg-slate-800/80 border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center font-bold">
            Setel Password Baru
          </CardTitle>
          <p className="text-gray-300 text-center mt-2 text-sm">
            Masukkan password baru Anda di bawah ini.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <Input
              type="password"
              placeholder="Konfirmasi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-400 hover:underline text-sm">
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
