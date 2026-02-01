"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-context";
import {
  User,
  Settings,
  ShoppingCart,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface UserDropdownProps {
  userRole: "teacher" | "buyer";
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
}

export default function UserDropdown({
  userRole,
  userName = "John Doe",
  userEmail,
  userAvatarUrl,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    ...(userRole === "buyer"
      ? [
          {
            icon: ShoppingCart,
            label: "My Orders",
            onClick: () => router.push("/my-orders"),
          },
        ]
      : []),
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 text-white hover:bg-white/20 p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          {userAvatarUrl ? (
            <AvatarImage src={userAvatarUrl} alt={userName} />
          ) : null}
          <AvatarFallback
            className={`${
              userRole === "teacher" ? "bg-blue-500" : "bg-orange-500"
            } text-white text-sm`}
          >
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-medium truncate">{userName}</p>
              {userEmail && (
                <p className="text-gray-300 text-sm truncate">{userEmail}</p>
              )}
              <p className="text-gray-400 text-xs capitalize mt-1">
                {userRole}
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 mb-1"
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />

              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-300 hover:bg-red-500/20 hover:text-red-200"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
