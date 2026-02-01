"use client";

import { Zap } from "lucide-react";

const LoadingScreen = ({
  message = "Memuat data...",
}: {
  message?: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1C294A]">
      <div className="text-center text-white">
        <div className="relative flex h-16 w-16 mx-auto mb-6">
          <Zap className="h-16 w-16 text-orange-400 z-10 animate-pulse" />
        </div>
        <p className="text-xl font-semibold tracking-wider">{message}</p>
        <p className="text-gray-400 mt-1">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
