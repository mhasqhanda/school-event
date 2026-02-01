"use client";

import Link from "next/link";
import { Zap, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-slate-900/95 backdrop-blur-md border-t border-white/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">TelsEvents</span>
            </Link>
            <p className="text-gray-400 text-sm border-l border-white/20 pl-4">
              &copy; {currentYear} TelsEvents. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-gray-300 hover:text-orange-400 transition-colors duration-300 p-2 hover:bg-white/10 rounded-full"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
