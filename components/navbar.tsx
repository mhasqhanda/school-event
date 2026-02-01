"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-context";
import { isDevelopment } from "@/lib/utils";
import {
  Zap,
  Menu,
  X,
  Home,
  Calendar,
  Phone,
  User,
  LogIn,
  UserPlus,
  RefreshCw,
  Bug,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, logout, clearSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setIsMenuOpen(false);
    window.location.reload();
  };

  const handleClearSession = async () => {
    await clearSession();
    router.push("/");
    setIsMenuOpen(false);
    window.location.reload();
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/90 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Zap className="h-8 w-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-bold text-white">TelsEvents</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 transition-all duration-300 font-medium px-3 py-2 rounded-lg ${
                  isActive(item.href)
                    ? "text-orange-400 bg-orange-400/10 scale-105"
                    : "text-white hover:text-orange-400 hover:bg-white/10 hover:scale-105"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={
                    profile?.role === "teacher"
                      ? "/dashboard/teacher"
                      : "/dashboard/buyer"
                  }
                >
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                    <Badge
                      className={
                        profile?.role === "teacher"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      }
                    >
                      {profile?.role || "User"}
                    </Badge>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="bg-gray-700 text-white"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 animate-slide-in">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-orange-400 bg-orange-400/10"
                      : "text-white hover:text-orange-400 hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-white/20 pt-4 space-y-3">
                {user ? (
                  <>
                    <Link
                      href={
                        profile?.role === "teacher"
                          ? "/dashboard/teacher"
                          : "/dashboard/buyer"
                      }
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                      <Badge
                        className={
                          profile?.role === "teacher"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }
                      >
                        {profile?.role || "User"}
                      </Badge>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="bg-gray-700 text-white w-full justify-start p-3"
                    >
                      <LogIn className="h-5 w-5 mr-3" />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/20 flex items-center space-x-3"
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Login</span>
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white flex items-center space-x-3 shadow-lg">
                        <UserPlus className="h-5 w-5" />
                        <span>Register</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
