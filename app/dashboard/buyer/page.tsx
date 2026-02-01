"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Users,
  Zap,
  Settings,
  Bell,
  Download,
  Search,
  CreditCard,
  QrCode,
  CheckCircle,
  Ticket,
  Star,
  ShoppingCart,
  History,
  User,
  LogOut,
  Heart,
  Share2,
  Copy,
  Trash2,
} from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toPng } from "html-to-image";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingScreen from "@/components/loading-screen";
import jsPDF from "jspdf";

// --- Tipe Data Terdefinisi ---
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  poster_url?: string;
  category: string;
  rating?: number;
}

// Mengubah 'Ticket' untuk merefleksikan tabel 'participants'
interface ParticipantTicket {
  id: number; // ID dari tabel participants
  user_id: string;
  event_id: number;
  events: Event; // Data event yang di-join
  status: string; // status dari tabel participants (e.g., 'verified')
}

// --- Komponen ---
const EventCardSkeleton = () => (
  <div className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-lg">
    <Skeleton className="h-48 w-full" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || typeof amount === "undefined" || amount === 0)
    return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const EventCard = ({
  event,
  onWishlist,
  onBuy,
  isWishlisted,
}: {
  event: Event;
  onWishlist: (eventId: string) => void;
  onBuy: (event: Event) => void;
  isWishlisted: boolean;
}) => (
  <Card className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-orange-400/50 transition-all duration-300 flex flex-col group">
    <CardHeader className="p-0 relative">
      <img
        src={event.poster_url || "/placeholder.jpg"}
        alt={event.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute top-3 right-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(event.id);
          }}
        >
          <Heart
            className={`h-5 w-5 transition-all ${
              isWishlisted ? "text-red-500 fill-current" : "text-white"
            }`}
          />
        </Button>
      </div>
      <div className="absolute bottom-3 left-4 right-4">
        <h3 className="text-lg font-bold text-white leading-tight truncate">
          {event.title}
        </h3>
      </div>
    </CardHeader>
    <CardContent className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <Badge className="bg-orange-500/20 text-orange-300 border-none font-medium">
            {event.category || "Umum"}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{event.rating || "N/A"}</span>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {new Date(event.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Pukul{" "}
              {new Date(event.date).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
              WIB
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
        <span className="text-xl font-bold text-orange-400">
          {formatCurrency(event.price)}
        </span>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onBuy(event);
          }}
        >
          Lihat Detail
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Komponen State Kosong yang bisa dipakai ulang
const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="text-center py-16 text-gray-400 bg-gray-800/50 rounded-2xl mt-6">
    <Icon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p>{description}</p>
  </div>
);

// Komponen Kartu Tiket
const TicketCard = ({
  ticket,
  onShowQR,
  onPrintProof,
}: {
  ticket: ParticipantTicket;
  onShowQR: (ticket: ParticipantTicket) => void;
  onPrintProof: (ticket: ParticipantTicket) => void;
}) => (
  <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors">
    <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <img
        src={ticket.events.poster_url || "/placeholder.jpg"}
        alt={ticket.events.title}
        className="w-full sm:w-32 h-auto rounded-lg object-cover"
      />
      <div className="flex-grow">
        <Badge className="bg-green-500/20 text-green-300 border-none mb-2">
          Terverifikasi
        </Badge>
        <h3 className="text-xl font-bold text-white">{ticket.events.title}</h3>
        <p className="text-sm text-gray-400">
          {new Date(ticket.events.date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <Button
          onClick={() => onPrintProof(ticket)}
          variant="outline"
          className="bg-blue-500/10 text-blue-300 border-blue-400/50 hover:bg-blue-500/20"
        >
          <Download className="h-4 w-4 mr-2" />
          Cetak Bukti
        </Button>
        <Button
          onClick={() => onShowQR(ticket)}
          className="bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Tampilkan QR
        </Button>
      </div>
    </CardContent>
  </Card>
);

function BuyerDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<ParticipantTicket[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTicketQR, setSelectedTicketQR] =
    useState<ParticipantTicket | null>(null);
  const ticketRef = useRef(null);

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "events"
  );

  // Tambahkan efek agar activeTab selalu update jika query string berubah
  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "events");
  }, [searchParams]);

  const [wishlistEvents, setWishlistEvents] = useState<Event[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<ParticipantTicket[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const statCards = [
    {
      title: "Tiket Dimiliki",
      value: myTickets.length,
      icon: Ticket,
      color: "text-blue-400",
    },
    {
      title: "Wishlist",
      value: wishlist.length,
      icon: Heart,
      color: "text-red-400",
    },
    {
      title: "Riwayat Transaksi",
      value: purchaseHistory.length,
      icon: History,
      color: "text-orange-400",
    },
  ];

  const sidebarNavItems = [
    { name: "Jelajahi", icon: Zap, tab: "events" },
    { name: "Tiket Saya", icon: Ticket, tab: "tickets" },
    { name: "Favorit", icon: Heart, tab: "wishlist" },
    { name: "Riwayat", icon: History, tab: "history" },
  ];

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (eventsError) console.error("Error fetching events:", eventsError);
        else setEvents((eventsData ?? []) as Event[]);

        // Fetch user's tickets (participants)
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("participants")
          .select("*, events(*)")
          .eq("user_id", user.id);

        if (ticketsError)
          console.error("Error fetching tickets:", ticketsError);
        else setMyTickets((ticketsData ?? []) as ParticipantTicket[]);

        // Fetch user's wishlist
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("event_id")
          .eq("user_id", user.id);

        if (wishlistError)
          console.error("Error fetching wishlist:", wishlistError);
        else {
          const list = (wishlistData ?? []) as { event_id: string }[];
          setWishlist(list.map((w) => w.event_id));
        }

        // Fetch purchase history
        const { data: historyData, error: historyError } = await supabase
          .from("participants")
          .select("*, events(*)")
          .eq("user_id", user.id)
          .eq("status", "verified")
          .order("created_at", { ascending: false });

        if (historyError)
          console.error("Error fetching purchase history:", historyError);
        else setPurchaseHistory((historyData ?? []) as ParticipantTicket[]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, supabase]);

  useEffect(() => {
    // Update wishlist events when wishlist or events change
    setWishlistEvents(events.filter((event) => wishlist.includes(event.id)));
  }, [wishlist, events]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handlePrintProofOfPayment = (ticket: ParticipantTicket) => {
    const doc = new jsPDF();
    const event = ticket.events;

    doc.setFontSize(20);
    doc.text("Bukti Pembayaran", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("Detail Transaksi", 14, 40);
    doc.line(14, 42, 196, 42); // Garis pemisah

    doc.text(`ID Transaksi:`, 14, 50);
    doc.text(`${ticket.id}`, 80, 50);

    doc.text(`Nama Pembeli:`, 14, 60);
    doc.text(`${profile?.full_name || "Nama Pengguna"}`, 80, 60);

    doc.text(`Email:`, 14, 70);
    doc.text(`${user?.email || "Email Pengguna"}`, 80, 70);

    doc.text(`Tanggal Pembelian:`, 14, 80);
    doc.text(`${new Date().toLocaleDateString("id-ID")}`, 80, 80);

    doc.text("Detail Acara", 14, 100);
    doc.line(14, 102, 196, 102); // Garis pemisah

    doc.text(`Nama Acara:`, 14, 110);
    doc.text(event.title, 80, 110);

    doc.text(`Jadwal:`, 14, 120);
    doc.text(new Date(event.date).toLocaleString("id-ID"), 80, 120);

    doc.text(`Lokasi:`, 14, 130);
    doc.text(event.location, 80, 130);

    doc.text("Rincian Pembayaran", 14, 150);
    doc.line(14, 152, 196, 152); // Garis pemisah

    doc.text(`Harga Tiket:`, 14, 160);
    doc.text(`${formatCurrency(event.price)}`, 196, 160, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text(`Total Bayar:`, 14, 170);
    doc.text(`${formatCurrency(event.price)}`, 196, 170, { align: "right" });

    doc.setFontSize(16);
    doc.setTextColor("#16a34a"); // Warna hijau
    doc.text("LUNAS", 105, 190, { align: "center" });

    doc.save(
      `bukti-pembayaran-${event.title.replace(/\s/g, "_")}-${ticket.id}.pdf`
    );

    toast({
      title: "Unduhan Dimulai",
      description: "Bukti pembayaran sedang diunduh dalam format PDF.",
    });
  };

  const handleWishlist = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Harap login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const isWishlisted = wishlist.includes(eventId);
    if (isWishlisted) {
      // Remove from wishlist
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);
      if (error) {
        toast({
          title: "Gagal menghapus dari favorit",
          variant: "destructive",
        });
      } else {
        setWishlist(wishlist.filter((id) => id !== eventId));
        toast({ title: "Dihapus dari favorit" });
      }
    } else {
      // Add to wishlist
      const { error } = await supabase
        .from("wishlist")
        .insert({ user_id: user.id, event_id: eventId });
      if (error) {
        toast({
          title: "Gagal menambahkan ke favorit",
          variant: "destructive",
        });
      } else {
        setWishlist([...wishlist, eventId]);
        toast({ title: "Ditambahkan ke favorit" });
      }
    }
  };

  const handleBuyTicket = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  const handleShowQR = (ticket: ParticipantTicket) => {
    setSelectedTicketQR(ticket);
  };

  const handleDownloadTicket = () => {
    if (ticketRef.current) {
      toPng(ticketRef.current, { cacheBust: true })
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.download = `tiket-${selectedTicketQR?.events.title.replace(
            /\s+/g,
            "-"
          )}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err: unknown) => {
          console.error("Gagal mengunduh tiket:", err);
          toast({
            title: "Gagal Mengunduh",
            description: "Terjadi kesalahan saat membuat gambar tiket.",
            variant: "destructive",
          });
        });
    }
  };

  const handleShareEvent = async (event: Event) => {
    const url = `${window.location.origin}/event/${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Disalin!",
        description: "URL acara telah disalin ke clipboard.",
      });
    } catch (err) {
      console.error("Gagal menyalin URL:", err);
      toast({
        title: "Gagal Menyalin",
        description: "Browser Anda mungkin tidak mendukung fitur ini.",
        variant: "destructive",
      });
    }
  };

  const handleExportHistory = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Nama Acara",
        "Tanggal Acara",
        "Lokasi",
        "Status Tiket",
        "Tanggal Pembelian",
      ].join(",") +
      "\n" +
      purchaseHistory
        .map((p) =>
          [
            `"${p.events.title}"`,
            `"${new Date(p.events.date).toLocaleDateString("id-ID")}"`,
            `"${p.events.location}"`,
            `"${p.status}"`,
            `"${new Date((p as any).created_at).toLocaleString("id-ID")}"`,
          ].join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "riwayat_pembelian.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Komponen-komponen Render ---
  const renderAvailableEvents = () => {
    const filteredEvents = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "all" || event.category === selectedCategory)
    );

    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <EmptyState
          icon={Zap}
          title="Tidak Ada Acara Tersedia"
          description="Saat ini tidak ada acara yang cocok dengan pencarian Anda."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onWishlist={handleWishlist}
            onBuy={handleBuyTicket}
            isWishlisted={wishlist.includes(event.id)}
          />
        ))}
      </div>
    );
  };

  const renderMyTickets = () => {
    if (loading) return <EventCardSkeleton />;
    if (myTickets.length === 0) {
      return (
        <EmptyState
          icon={Ticket}
          title="Anda Belum Memiliki Tiket"
          description="Jelajahi acara menarik dan dapatkan tiket Anda!"
        />
      );
    }
    return (
      <div className="space-y-4">
        {myTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onShowQR={handleShowQR}
            onPrintProof={handlePrintProofOfPayment}
          />
        ))}
      </div>
    );
  };

  const renderWishlist = () => {
    if (loading) return <div>Memuat wishlist...</div>;
    if (wishlistEvents.length === 0) {
      return (
        <EmptyState
          icon={Heart}
          title="Wishlist Anda Kosong"
          description="Tambahkan acara yang Anda sukai ke wishlist untuk dilihat nanti."
        />
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onWishlist={handleWishlist}
            onBuy={handleBuyTicket}
            isWishlisted={true}
          />
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (loading) return <div>Memuat riwayat...</div>;
    if (purchaseHistory.length === 0) {
      return (
        <EmptyState
          icon={History}
          title="Tidak Ada Riwayat Transaksi"
          description="Setelah Anda membeli tiket, riwayatnya akan muncul di sini."
        />
      );
    }
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Riwayat Transaksi</CardTitle>
          <Button
            className="bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold shadow-md px-4 py-2 rounded"
            onClick={handleExportHistory}
          >
            <Download className="mr-2 h-4 w-4" />
            Ekspor CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Acara</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-white">
                    {p.events.title}
                  </TableCell>
                  <TableCell className="text-white">
                    {new Date(p.events.date).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.status === "verified"
                          ? "bg-green-600"
                          : "bg-yellow-600"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    <Button
                      className="bg-gray-700 text-white font-semibold px-4 py-2 rounded"
                      size="sm"
                      onClick={() => handleBuyTicket(p.events)}
                    >
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <LoadingScreen message="Memuat dasbor..." />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#111827] to-[#1C294A] text-white">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900/80 p-4 lg:p-6 flex-col justify-between hidden md:flex transition-all duration-300">
        <div>
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-10">
            <Zap className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-white hidden lg:block">
              TelsEvents
            </span>
          </div>
          <nav className="space-y-3">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.name}
                href={`/dashboard/buyer?tab=${item.tab}`}
                className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.tab
                    ? "bg-orange-500/20 text-orange-300"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 lg:mr-4" />
                <span className="hidden lg:block font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start p-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 lg:mr-4" />
            <span className="hidden lg:block font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Selamat Datang, {profile?.full_name || "Pembeli"}!
            </h1>
            <p className="text-gray-400">
              Jelajahi dan temukan acara favoritmu di sini.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-700/50 rounded-full"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarFallback>
                {profile?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <Card
              key={card.title}
              className="bg-gray-800/50 border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {card.value.toString()}
                  </p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div>
          {activeTab === "events" && (
            <Card className="bg-transparent border-0">
              <CardHeader className="px-1 mb-4">
                <CardTitle className="text-2xl font-bold tracking-wider">
                  Jelajahi Acara
                </CardTitle>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Cari nama acara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-800/70 border-gray-700 pl-10 h-11"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full md:w-[180px] bg-gray-800/70 border-gray-700 h-11">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="Seni">Seni</SelectItem>
                      <SelectItem value="Sains">Sains</SelectItem>
                      <SelectItem value="Teknologi">Teknologi</SelectItem>
                      <SelectItem value="Matematika">Matematika</SelectItem>
                      <SelectItem value="Olahraga">Olahraga</SelectItem>
                      <SelectItem value="Bahasa">Bahasa</SelectItem>
                      <SelectItem value="Musik">Musik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-1">
                {renderAvailableEvents()}
              </CardContent>
            </Card>
          )}
          {activeTab === "tickets" && renderMyTickets()}
          {activeTab === "wishlist" && renderWishlist()}
          {activeTab === "history" && renderHistory()}
        </div>
      </main>

      {/* QR Code Modal */}
      <Dialog
        open={!!selectedTicketQR}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketQR(null);
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Tiket: {selectedTicketQR?.events.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              Tunjukkan QR ini saat check-in event.
            </DialogDescription>
          </DialogHeader>
          {selectedTicketQR && (
            <div className="py-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={JSON.stringify({
                    participantId: selectedTicketQR.id,
                    eventId: selectedTicketQR.event_id,
                    userId: selectedTicketQR.user_id,
                  })}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={true}
                />
              </div>
              <div className="text-center mt-4">
                <div className="text-lg font-bold text-orange-400">
                  {selectedTicketQR.events.title}
                </div>
                <div className="text-gray-300">
                  Atas nama:{" "}
                  <span className="font-semibold text-white">
                    {profile?.full_name}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  ID Tiket: {selectedTicketQR.id}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleDownloadTicket}
              className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 text-white font-bold text-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Tiket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BuyerDashboardPage />
    </Suspense>
  );
}
