"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Search,
  ArrowRight,
  Heart,
  Share2,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlist, setWishlist] = useState([]);
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        toast({
          title: "Error",
          description: "Gagal mengambil data acara.",
          variant: "destructive",
        });
        console.error("Error fetching events:", error);
      } else {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  const handleWishlist = (eventId) => {
    if (wishlist.includes(eventId)) {
      setWishlist(wishlist.filter((id) => id !== eventId));
      toast({
        title: "Dihapus dari Wishlist",
        description: "Acara udah dihapus dari wishlist kamu",
      });
    } else {
      setWishlist([...wishlist, eventId]);
      toast({
        title: "Ditambah ke Wishlist",
        description: "Acara udah masuk ke wishlist kamu",
      });
    }
  };

  const handleShare = async (event) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `${window.location.origin}/event/${event.id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/event/${event.id}`
      );
      toast({
        title: "Link Disalin!",
        description: "Link acara udah disalin ke clipboard",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  let filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      event.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Temukan Acara Menarik
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Jelajahi berbagai acara pendidikan yang seru dan bermanfaat untuk
            mengembangkan skill dan pengetahuan kamu
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Cari acara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg h-12"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-lg h-12">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="sains">Sains</SelectItem>
                <SelectItem value="teknologi">Teknologi</SelectItem>
                <SelectItem value="seni">Seni</SelectItem>
                <SelectItem value="lingkungan">Lingkungan</SelectItem>
                <SelectItem value="matematika">Matematika</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={clearFilters}
              className="w-full h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/5 border border-white/10 text-white"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                    <div className="text-center text-white/70">
                      <Calendar className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-semibold">{event.category}</p>
                    </div>
                  </div>

                  {event.featured && (
                    <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
                      Featured
                    </Badge>
                  )}

                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/20 hover:bg-black/40 text-white"
                      onClick={() => handleWishlist(event.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          wishlist.includes(event.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/20 hover:bg-black/40 text-white"
                      onClick={() => handleShare(event)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {event.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date
                        ? new Date(event.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time ||
                        (event.date &&
                          new Date(event.date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }))}{" "}
                      WIB
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-orange-400">
                      Rp{event.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {event.participants}/{event.capacity} peserta
                    </div>
                  </div>

                  <Link href={`/event/${event.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      Lihat Detail
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tidak ada acara ditemukan
            </h3>
            <p className="text-gray-400">Coba ubah filter pencarian kamu</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
