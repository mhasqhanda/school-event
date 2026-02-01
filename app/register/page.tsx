"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Shield,
  Ticket,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegistrationMessage("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Kata sandi dan konfirmasi kata sandi tidak cocok.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await signUp(email, password, fullName, "buyer");

    if (error) {
      toast({
        title: "Pendaftaran Gagal",
        description: error.message,
        variant: "destructive",
      });
    } else if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      // Handle email confirmation not being met
      toast({
        title: "Pendaftaran hampir berhasil!",
        description:
          "Email Anda sudah terdaftar tapi belum dikonfirmasi. Silakan cek email Anda.",
        variant: "default",
      });
      setRegistrationMessage(
        "Email Anda sudah terdaftar. Silakan cek kotak masuk Anda untuk link konfirmasi."
      );
    } else if (data.user) {
      toast({
        title: "Pendaftaran Berhasil!",
        description: "Anda akan diarahkan ke dasbor.",
      });
      // Redirect user to their respective dashboard
      router.push("/dashboard/buyer");
    }
    setIsSubmitting(false);
  };

  const renderForm = (currentRole: "buyer") => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor={`${currentRole}-full-name`}
          className="text-white font-medium"
        >
          Nama Lengkap
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id={`${currentRole}-full-name`}
            name="fullName"
            placeholder="Budi Santoso"
            required
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-4 py-3 rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label
          htmlFor={`${currentRole}-email`}
          className="text-white font-medium"
        >
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id={`${currentRole}-email`}
            name="email"
            type="email"
            placeholder="anda@email.com"
            required
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-4 py-3 rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label
          htmlFor={`${currentRole}-password`}
          className="text-white font-medium"
        >
          Kata Sandi
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id={`${currentRole}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            required
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-12 py-3 rounded-xl"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-300 hover:text-white hover:bg-slate-700/50"
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
      <div className="space-y-2">
        <Label
          htmlFor={`${currentRole}-confirm-password`}
          className="text-white font-medium"
        >
          Konfirmasi Kata Sandi
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id={`${currentRole}-confirm-password`}
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Ulangi kata sandi"
            required
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pl-10 pr-12 py-3 rounded-xl"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-300 hover:text-white hover:bg-slate-700/50"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50"
      >
        {isSubmitting ? "Memproses..." : `Buat Akun Pembeli Tiket`}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Zap className="h-10 w-10 text-orange-400" />
            <span className="text-3xl font-bold text-white">TelsEvents</span>
          </Link>
        </div>

        {/* Register Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Gabung di TelsEvents
            </CardTitle>
            <p className="text-gray-200">
              Bikin akun kamu buat mulai seru-seruan!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {registrationMessage ? (
              <div className="text-center p-4 bg-green-500/20 border border-green-500 rounded-lg">
                <h3 className="font-bold text-green-300">
                  Pendaftaran Berhasil!
                </h3>
                <p className="text-white mt-2">{registrationMessage}</p>
              </div>
            ) : (
              <>
                {renderForm("buyer")}
                <div className="text-center text-sm">
                  <span className="text-gray-300">Sudah punya akun? </span>
                  <Link
                    href="/login"
                    className="font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Masuk di sini
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
