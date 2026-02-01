"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Star,
  Heart,
  Share2,
  Medal,
  Users,
  School,
  Lightbulb,
  Trophy,
  Award,
} from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import EventPoster from "@/components/event-poster";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";

const testimonials = [
  {
    name: "Andi",
    avatar: "/placeholder-user.jpg",
    title: "Siswa Kelas 12",
    description:
      "Platform ini sangat membantu saya menemukan acara-acara edukasi yang sesuai dengan minat saya. Tampilannya juga mudah digunakan!",
  },
  {
    name: "Budi",
    avatar: "/placeholder-user.jpg",
    title: "Ketua OSIS",
    description:
      "Mengelola dan mempromosikan acara sekolah menjadi lebih mudah dengan TelsEvents. Fitur dashboardnya sangat lengkap.",
  },
  {
    name: "Citra",
    avatar: "/placeholder-user.jpg",
    title: "Guru Pembina",
    description:
      "Saya bisa memantau semua acara yang diikuti siswa dengan mudah. Ini adalah alat yang hebat untuk sekolah modern.",
  },
];

const stats = [
  {
    value: "100+",
    label: "Acara Diselenggarakan",
  },
  {
    value: "50+",
    label: "Sekolah Bergabung",
  },
  {
    value: "10k+",
    label: "Siswa Terdaftar",
  },
  {
    value: "4.8/5",
    label: "Rating Pengguna",
  },
];

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false })
        .limit(3);

      if (error) {
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
          text: `Check out this amazing event: ${event.title}`,
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

  return (
    <div className="w-full bg-[#111827] text-white">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="w-full flex items-center justify-center py-20 md:py-32 lg:py-40 bg-gradient-to-b from-[#1C294A] to-[#111827]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Selamat Datang di TelsEvents
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  Platform terbaik untuk menemukan dan mendaftar di berbagai
                  acara pendidikan menarik di sekolahmu.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F58220] text-white hover:bg-[#F58220]/90 px-8 py-6 text-lg"
                >
                  <Link href="/events">
                    Jelajahi Acara
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-28 text-center bg-[#111827]">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Pusat Acara & Kompetisi <br /> SMK Telesandi Bekasi
            </h2>
            <p className="mx-auto max-w-[800px] text-gray-400 md:text-xl/relaxed mt-4">
              Kami membuka gerbang bagi para siswa berbakat dari seluruh sekolah
              untuk berkompetisi, berinovasi, dan meraih prestasi di berbagai
              ajang bergengsi yang diselenggarakan oleh SMK Telekomunikasi
              Telesandi Bekasi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
              <div className="p-6 rounded-lg bg-gray-800/50">
                <Trophy className="w-8 h-8 mb-4 text-orange-400" />
                <h3 className="text-xl font-bold">Kompetisi Bergengsi</h3>
                <p className="mt-2 text-gray-400">
                  Tantang dirimu di berbagai bidang lomba, mulai dari IT,
                  desain, hingga e-sports yang kompetitif.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-gray-800/50">
                <Award className="w-8 h-8 mb-4 text-orange-400" />
                <h3 className="text-xl font-bold">Sertifikat & Pengakuan</h3>
                <p className="mt-2 text-gray-400">
                  Dapatkan sertifikat resmi dan pengakuan atas partisipasi serta
                  prestasimu untuk portofolio masa depan.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-gray-800/50">
                <Users className="w-8 h-8 mb-4 text-orange-400" />
                <h3 className="text-xl font-bold">Jaringan & Pengalaman</h3>
                <p className="mt-2 text-gray-400">
                  Bertemu dengan talenta lain, bertukar ide, dan dapatkan
                  pengalaman tak ternilai di lingkungan yang suportif.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <Button asChild size="lg">
                <Link href="/events">Lihat Semua Acara</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
