"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function ClearSessionPage() {
  const { user, clearSession } = useAuth();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const handleClearSession = async () => {
    setIsClearing(true);
    try {
      await clearSession();
      setIsCleared(true);
      // Redirect ke home setelah 2 detik
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error clearing session:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C294A] to-[#111827] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Clear Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isCleared ? (
            <>
              <Alert className="bg-yellow-500/20 border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  Anda akan keluar dari akun dan semua data login yang tersimpan
                  akan dihapus.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Status Login Saat Ini:</p>
                  {user ? (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 font-medium">
                        ✓ Masuk sebagai: {user.email}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
                      <p className="text-gray-400 font-medium">
                        ✗ Tidak ada user yang login
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleClearSession}
                    disabled={isClearing || !user}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Membersihkan...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Session
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Kembali
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
              <h3 className="text-xl font-semibold text-green-400">
                Session Berhasil Dibersihkan!
              </h3>
              <p className="text-gray-300">
                Anda akan diarahkan ke halaman utama dalam beberapa detik...
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Home
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-white mb-2">
              Mengapa ini terjadi?
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Browser menyimpan data login (cookies/localStorage)</li>
              <li>• Session Supabase mungkin masih aktif</li>
              <li>• Fitur "Remember Me" yang aktif</li>
              <li>• Data development yang tersimpan</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
