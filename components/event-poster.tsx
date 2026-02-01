"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Star, Award, Users } from "lucide-react";

export default function EventPoster() {
  return (
    <div className="relative max-w-sm mx-auto">
      {/* Main Poster Card */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border-white/20 overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-500 shadow-2xl hover:shadow-3xl">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white mb-4 px-4 py-2 text-xs font-semibold">
              INTERNATIONAL EVENT
            </Badge>
            <h2 className="text-2xl font-bold text-white mb-2">Science Fair</h2>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              2024
            </h3>
          </div>

          {/* Event Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2 text-white">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="font-semibold text-sm">March 15, 2024</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="font-semibold text-sm">09:00 AM - 06:00 PM</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span className="font-semibold text-sm">
                Grand Convention Center
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-center">
              <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-400">
                Penghargaan
              </div>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-400">
                500+ Peserta
              </div>
            </div>
            <div className="text-center">
              <Star className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-400">
                Juri Ahli
              </div>
            </div>
            <div className="text-center">
              <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs">
                25
              </div>
              <div className="text-sm font-semibold text-slate-400">Negara</div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              Rp25.000
            </div>
            <div className="text-sm font-semibold text-slate-400">
              Harga Early Bird
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute bottom-3 left-3 w-8 h-8 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-lg" />
      </Card>

      {/* Floating Elements */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-bounce" />
      <div className="absolute top-1/2 -right-3 w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-ping" />
    </div>
  );
}
