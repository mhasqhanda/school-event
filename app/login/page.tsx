"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const targetDashboard =
        profile?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/buyer";
      router.replace(targetDashboard);
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await login(email, password);

      if (error) {
        toast({
          title: "Login Gagal",
          description:
            error.message || "Email atau kata sandi salah. Silakan coba lagi.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang kembali! Mengalihkan ke dasbor...",
        });
      }
    } catch (err) {
      toast({
        title: "Login Gagal",
        description:
          err instanceof Error ? err.message : "Terjadi kesalahan saat login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan spinner hanya saat auth-context sedang memvalidasi sesi awal.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  // Jika setelah loading selesai ternyata user sudah ada, tampilkan spinner pengalihan.
  // Ini untuk menangani kasus di mana pengguna me-refresh halaman login saat sudah masuk.
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Anda sudah masuk. Mengalihkan ke dasbor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <Zap className="h-10 w-10 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-3xl font-bold text-white">TelsEvents</span>
          </Link>
          <p className="text-gray-300 mt-2">
            Selamat datang! Silakan masuk untuk melanjutkan.
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Masuk
            </CardTitle>
            <p className="text-gray-200">Gunakan akun TelsEvents Anda.</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 text-sm">
              <strong>Demo:</strong> Gunakan{" "}
              <code className="bg-slate-800 px-1 rounded">
                teacher@demo.com
              </code>{" "}
              atau{" "}
              <code className="bg-slate-800 px-1 rounded">buyer@demo.com</code>{" "}
              (password bebas)
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="anda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-4 py-3 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-12 py-3 rounded-xl transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors font-medium"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Masuk"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-300">Belum punya akun? </span>
                <Link
                  href="/register"
                  className="font-semibold text-orange-400 hover:text-orange-300"
                >
                  Daftar sekarang
                </Link>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-blue-400 hover:underline text-sm"
              >
                Lupa Password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
