"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSessionInfo,
  clearBrowserSession,
  isDevelopment,
} from "@/lib/utils";
import { RefreshCw, Eye, Trash2, Home } from "lucide-react";
import Link from "next/link";

export default function DebugPage() {
  const { user, profile } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSessionInfo = () => {
    setIsRefreshing(true);
    const info = getSessionInfo();
    setSessionInfo(info);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    refreshSessionInfo();
  }, []);

  const handleClearSession = () => {
    clearBrowserSession();
    refreshSessionInfo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C294A] to-[#111827] p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Debug Session</h1>
          <div className="flex space-x-2">
            <Button
              onClick={refreshSessionInfo}
              disabled={isRefreshing}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300">Environment:</p>
                <Badge
                  className={isDevelopment() ? "bg-yellow-500" : "bg-green-500"}
                >
                  {isDevelopment() ? "Development" : "Production"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-300">Node Environment:</p>
                <Badge className="bg-blue-500">{process.env.NODE_ENV}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Status */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-gray-300">User Status:</p>
                <Badge className={user ? "bg-green-500" : "bg-red-500"}>
                  {user ? "Logged In" : "Not Logged In"}
                </Badge>
              </div>

              {user && (
                <div className="space-y-2">
                  <p className="text-gray-300">User Email:</p>
                  <p className="text-white font-mono bg-gray-800/50 p-2 rounded">
                    {user.email}
                  </p>

                  <p className="text-gray-300">User ID:</p>
                  <p className="text-white font-mono bg-gray-800/50 p-2 rounded text-sm">
                    {user.id}
                  </p>

                  {profile && (
                    <>
                      <p className="text-gray-300">Profile Role:</p>
                      <Badge
                        className={
                          profile.role === "teacher"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }
                      >
                        {profile.role}
                      </Badge>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Browser Session Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Browser Session Info</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionInfo ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-300">Data Demo (localStorage):</p>
                  <Badge
                    className={
                      sessionInfo.hasDemoData ? "bg-yellow-500" : "bg-green-500"
                    }
                  >
                    {sessionInfo.hasDemoData ? "Ada" : "Kosong"}
                  </Badge>
                </div>

                {sessionInfo.demoKeys?.length > 0 && (
                  <div>
                    <p className="text-gray-300">Key demo di localStorage:</p>
                    <div className="bg-gray-800/50 p-3 rounded space-y-1">
                      {sessionInfo.demoKeys.map(
                        (key: string, index: number) => (
                          <p
                            key={index}
                            className="text-white font-mono text-sm"
                          >
                            {key}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-gray-300">SessionStorage Items:</p>
                  <Badge className="bg-blue-500">
                    {sessionInfo.sessionStorageLength}
                  </Badge>
                </div>

                <div>
                  <p className="text-gray-300">Cookies:</p>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-white font-mono text-sm break-all">
                      {sessionInfo.cookies || "No cookies"}
                    </p>
                  </div>
                </div>

                {(sessionInfo.hasDemoData || sessionInfo.hasSupabaseData) && (
                  <Button
                    onClick={handleClearSession}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Browser Session
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-300">Loading session info...</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-300">
              <p>Jika Anda mengalami auto-login yang tidak diinginkan:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Klik tombol "Clear Browser Session" di atas</li>
                <li>
                  Atau gunakan halaman{" "}
                  <Link
                    href="/clear-session"
                    className="text-orange-400 hover:underline"
                  >
                    Clear Session
                  </Link>
                </li>
                <li>Refresh halaman ini untuk memverifikasi</li>
                <li>
                  Jika masih bermasalah, coba buka browser dalam mode incognito
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
