import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TelsEvents - School Event Registration",
  description:
    "Platform registrasi acara sekolah yang modern dan mudah digunakan",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
