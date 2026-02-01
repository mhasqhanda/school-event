"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Redirect berdasarkan role user dari profile
    if (!user) {
      router.push("/login");
      return;
    }
    if (profile?.role === "teacher") {
      router.push("/dashboard/teacher");
    } else {
      // buyer atau profile belum load -> default ke buyer
      router.push("/dashboard/buyer");
    }
  }, [user, profile, router]);

  // Loading state
  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#1C294A] to-[#111827] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Mengarahkan ke dashboard...</p>
      </div>
    </div>
  );
}
