"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordRootPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    });
    setLoading(false);
    setSubmitted(true);
    if (error) {
      toast({
        title: "Gagal mengirim email reset password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Terkirim!",
        description:
          "Jika email terdaftar, kami akan mengirimkan link reset password.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111827] to-[#1C294A]">
      <Card className="w-full max-w-md bg-slate-800/80 border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center font-bold">
            Reset Password
          </CardTitle>
          <p className="text-gray-300 text-center mt-2 text-sm">
            Masukkan email akun Anda, kami akan mengirimkan link reset password.
          </p>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center text-green-400 font-medium py-8">
              Jika email terdaftar, kami akan mengirimkan link reset password.
              <br />
              Silakan cek inbox atau folder spam Anda.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-200 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="youremail@email.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Instruksi Reset"}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-blue-400 hover:underline text-sm"
            >
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
