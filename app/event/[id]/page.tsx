"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Zap,
  ArrowLeft,
  Star,
  Share2,
  Heart,
  CreditCard,
  Shield,
  Loader2,
  Copy,
  Book,
  FileText,
  Ticket,
  Building,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LoadingScreen from "@/components/loading-screen";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  poster_url?: string;
  category: string;
  rating?: number;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || typeof amount === "undefined" || amount === 0)
    return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

type PaymentCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  onDone: () => void;
};

function IndomaretCodeModal({
  open,
  onOpenChange,
  code,
  onDone,
}: PaymentCodeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Kode Pembayaran Indomaret
          </DialogTitle>
          <DialogDescription className="text-center">
            Tunjukkan kode berikut ke kasir Indomaret untuk pembayaran event:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center">
          <span className="font-mono text-lg bg-slate-800 px-4 py-2 rounded select-all border border-red-400 text-red-200">
            {code}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 text-red-300 hover:text-white"
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast({
                title: "Kode Indomaret disalin!",
                description: "Kode pembayaran telah disalin ke clipboard.",
              });
            }}
          >
            Salin Kode
          </Button>
        </div>
        <DialogFooter>
          <Button
            onClick={onDone}
            className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 text-white font-bold text-lg"
          >
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, loading: authLoading, profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("bca");

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.full_name || "",
    email: user?.email || "",
    phone: "",
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [isIndomaretModalOpen, setIsIndomaretModalOpen] = useState(false);
  const indomaretCode = "9876-5432-INDO-2024";

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      // Jangan lakukan apa-apa sampai status autentikasi selesai dimuat
      if (authLoading) return;

      setLoading(true);
      const supabase = createClient();

      // 1. Ambil data event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single();

      if (eventError) {
        console.error("Error fetching event:", eventError);
        toast({
          title: "Gagal Memuat Event",
          description: "Terjadi kesalahan saat mengambil data event.",
          variant: "destructive",
        });
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // 2. Jika user login, cek apakah sudah terdaftar
      if (user) {
        const { data: participantData, error: participantError } =
          await supabase
            .from("participants")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("event_id", params.id);

        if (participantError) {
          console.error(
            "Error checking registration status:",
            participantError
          );
        } else if (participantData && participantData.length > 0) {
          setIsAlreadyRegistered(true);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [params.id, toast, user, authLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Harap Login",
        description: "Anda harus login terlebih dahulu untuk mendaftar.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    // Cek apakah user sudah terdaftar
    const { data: existingParticipant, error: checkError } =
      await createClient()
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", params.id)
        .single();

    if (checkError && checkError.code !== "PGRST116") {
      toast({
        title: "Gagal Mendaftar",
        description: `Terjadi kesalahan: ${checkError.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (existingParticipant) {
      toast({
        title: "Anda Sudah Terdaftar",
        description: "Anda sudah memiliki tiket untuk event ini.",
        variant: "default",
      });
      setIsPaymentModalOpen(false);
      setIsSubmitting(false);
      router.push("/dashboard/buyer?tab=tickets");
      return;
    }

    // Proses pendaftaran formalitas
    const { error } = await createClient().from("participants").insert({
      user_id: user.id,
      event_id: params.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: "verified", // Langsung verified karena formalitas
    });

    if (error) {
      toast({
        title: "Pendaftaran Gagal",
        description: `Terjadi kesalahan saat menyimpan data: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pendaftaran Berhasil!",
        description: `Anda berhasil mendaftar untuk event: ${event?.title}`,
      });
      setIsPaymentModalOpen(false);
      if (selectedPayment === "indomaret") {
        setIsIndomaretModalOpen(true);
      } else {
        router.push("/dashboard/buyer?tab=tickets");
      }
    }
    setIsSubmitting(false);
  };

  const formattedDate = event
    ? new Date(event.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const formattedTime = event
    ? new Date(event.date).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB"
    : "";

  // Handler untuk perubahan input form
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validasi form sederhana
  const isFormValid = formData.name && formData.email && formData.phone;

  // Handler submit form data peserta
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon isi semua data peserta.",
        variant: "destructive",
      });
      return;
    }
    setIsFormModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return <LoadingScreen message="Memuat detail event..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Event Tidak Ditemukan
          </h1>
          <p className="text-gray-300 mb-6">
            Event yang kamu cari tidak ada atau sudah dihapus.
          </p>
          <Button
            onClick={() => router.push("/events")}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white"
          >
            Kembali ke Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900/50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="bg-slate-800/50 border-gray-700 text-white shadow-2xl">
            <CardHeader className="p-0">
              <img
                src={event.poster_url || "/placeholder.jpg"}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Kiri - Detail */}
                <div className="lg:col-span-2 space-y-6">
                  <Badge className="bg-orange-500/20 text-orange-300 border-none">
                    {event.category}
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight">
                    {event.title}
                  </h1>
                  <div className="text-gray-300">
                    <p>{event.description || "Tidak ada deskripsi."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-orange-400" />
                      <span>
                        {new Date(event.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span>
                        Pukul{" "}
                        {new Date(event.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-orange-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan - Aksi */}
                <div className="lg:col-span-1">
                  <Card className="bg-slate-700/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-2xl">Daftar Event</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-300">Harga Tiket</span>
                        <span className="text-2xl font-bold text-orange-400">
                          {formatCurrency(event.price)}
                        </span>
                      </div>
                      {new Date(event.date) < new Date() ? (
                        <div className="p-4 text-center text-red-400 font-semibold">
                          Pendaftaran Ditutup
                        </div>
                      ) : !isAlreadyRegistered ? (
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 text-white font-bold text-lg"
                          onClick={() => setIsFormModalOpen(true)}
                        >
                          <Ticket className="mr-2 h-5 w-5" />
                          Daftar Sekarang
                        </Button>
                      ) : (
                        <div className="p-4 text-center text-green-400 font-semibold">
                          Anda sudah terdaftar pada event ini.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Modal Pembayaran Formalitas */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-slate-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Konfirmasi Pendaftaran
            </DialogTitle>
            <DialogDescription>
              Selesaikan pendaftaran Anda untuk event:{" "}
              <span className="font-semibold text-orange-400">
                {event.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="mb-4 font-semibold">
              Pilih Metode Pembayaran (Formalitas)
            </h3>
            <RadioGroup
              defaultValue="bca"
              value={selectedPayment}
              onValueChange={setSelectedPayment}
            >
              <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-md">
                <RadioGroupItem
                  value="bca"
                  id="bca"
                  className="border-white text-orange-400 data-[state=checked]:bg-orange-400 data-[state=checked]:border-orange-400"
                />
                <Label
                  htmlFor="bca"
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <CreditCard className="h-5 w-5 text-blue-400" /> Transfer Bank
                  BCA
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-md">
                <RadioGroupItem
                  value="indomaret"
                  id="indomaret"
                  className="border-white text-red-400 data-[state=checked]:bg-red-400 data-[state=checked]:border-red-400"
                />
                <Label
                  htmlFor="indomaret"
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Building className="h-5 w-5 text-red-400" /> Gerai Indomaret
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button onClick={handleRegister} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi & Daftar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Form Data Peserta */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="bg-slate-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Data Peserta</DialogTitle>
            <DialogDescription>
              Silakan isi data diri Anda sebelum melanjutkan pembayaran.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <label className="block mb-1">Nama Lengkap</label>
              <Input
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
                className="bg-slate-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
                className="bg-slate-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block mb-1">No HP</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                required
                className="bg-slate-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsFormModalOpen(false)}
                type="button"
                className="bg-gray-800 text-white hover:bg-gray-700 border-none"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gray-800 text-white hover:bg-gray-700 border-none"
              >
                Lanjut ke Pembayaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Kode Pembayaran Indomaret */}
      <IndomaretCodeModal
        open={isIndomaretModalOpen}
        onOpenChange={setIsIndomaretModalOpen}
        code={indomaretCode}
        onDone={() => {
          setIsIndomaretModalOpen(false);
          router.push("/dashboard/buyer?tab=tickets");
        }}
      />
    </>
  );
}
