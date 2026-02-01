"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Users,
  Zap,
  Plus,
  Settings,
  Bell,
  TrendingUp,
  Download,
  FileText,
  Search,
  Edit,
  Eye,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  LogOut,
  Trash2,
  Copy,
  MoreHorizontal,
  School,
  Info,
  Loader2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import UserDropdown from "@/components/user-dropdown";
import { toPng } from "html-to-image";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Fungsi untuk memproses data mentah dari Supabase menjadi format yang dibutuhkan UI
const processEventData = (event) => {
  const participants = event.participants || [];
  const registeredCount = participants.length;
  const verifiedCount = participants.filter(
    (p) => p.status === "verified"
  ).length;
  const eventDate = new Date(event.date);
  const now = new Date();

  let status = "Selesai";
  if (eventDate > now) {
    status = registeredCount > 0 ? "Pendaftaran" : "Draft";
  }

  return {
    ...event,
    participants_count: registeredCount,
    verified: verifiedCount,
    pending: registeredCount - verifiedCount,
    revenue: `Rp${(verifiedCount * (event.price || 0)).toLocaleString(
      "id-ID"
    )}`,
    status: status,
  };
};

const chartConfig = {
  participants: {
    label: "Peserta",
    color: "#3b82f6",
  },
  revenue: {
    label: "Pendapatan (Rp)",
    color: "#f97316",
  },
} satisfies ChartConfig;

export default function TeacherDashboard() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleteParticipantAlertOpen, setIsDeleteParticipantAlertOpen] =
    useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventSortOrder, setEventSortOrder] = useState("date-desc");
  const [participantSortConfig, setParticipantSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [participants, setParticipants] = useState([]);

  const notifications = [
    {
      id: 1,
      title: "Pendaftaran Baru",
      description: "Peserta baru mendaftar di acara Anda.",
      time: "5 menit yang lalu",
      read: false,
    },
    {
      id: 2,
      title: "Acara Mendatang",
      description: "Acara Anda akan dimulai dalam 3 hari.",
      time: "1 jam yang lalu",
      read: false,
    },
    {
      id: 3,
      title: "Laporan Mingguan Siap",
      description: "Laporan performa mingguan Anda telah dibuat.",
      time: "kemarin",
      read: true,
    },
  ];

  const { logout, user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    price: "",
    category: "",
  });

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Memoize aggregated data calculation
  const aggregatedStats = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        totalEvents: 0,
        totalParticipants: 0,
        totalRevenue: 0,
        totalVerified: 0,
        verificationRate: 0,
      };
    }

    const totalParticipants = events.reduce(
      (sum, event) => sum + (event.participants_count || 0),
      0
    );
    const totalRevenue = events.reduce(
      (sum, event) => sum + (event.price || 0) * (event.verified || 0),
      0
    );
    const totalVerified = events.reduce(
      (sum, event) => sum + (event.verified || 0),
      0
    );
    const verificationRate =
      totalParticipants > 0
        ? Math.round((totalVerified / totalParticipants) * 100)
        : 0;

    return {
      totalEvents: events.length,
      totalParticipants,
      totalRevenue,
      totalVerified,
      verificationRate,
    };
  }, [events]);

  const chartData = useMemo(() => {
    return events.map((event) => ({
      name:
        event.title.length > 15
          ? `${event.title.substring(0, 15)}...`
          : event.title,
      participants: event.participants_count || 0,
      revenue: (event.price || 0) * (event.verified || 0),
    }));
  }, [events]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("events")
      .select(`*, participants (*)`)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Gagal mengambil data acara",
        description: error.message,
        variant: "destructive",
      });
      setEvents([]);
    } else {
      const processedData = data ? data.map(processEventData) : [];
      setEvents(processedData);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Ambil data peserta dari tabel participants untuk semua event milik teacher
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!events || events.length === 0) {
        setParticipants([]);
        return;
      }
      const supabase = createClient();
      const eventIds = events.map((e) => e.id);
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .in("event_id", eventIds);
      if (!error && data) {
        // Here, you might want to join with profiles to get more details
        setParticipants(data);
      } else {
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, [events]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCreateEvent = async () => {
    setIsCreating(true);

    const requiredFields = [
      "title",
      "date",
      "time",
      "capacity",
      "price",
      "location",
      "category",
    ];
    for (const field of requiredFields) {
      if (!newEvent[field]) {
        toast({
          title: "Data Kurang Lengkap",
          description: `Kolom '${field}' wajib diisi. Mohon periksa kembali.`,
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }
    }

    // Validasi format tanggal sebelum insert
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newEvent.date)) {
      toast({
        title: "Format Tanggal Salah",
        description:
          "Gunakan format YYYY-MM-DD (misal: 2025-12-11). Pilih tanggal dari kalender, jangan ketik manual.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }

    const combinedDateTimeString = `${newEvent.date} ${newEvent.time}`;
    const eventDate = new Date(combinedDateTimeString);

    if (isNaN(eventDate.getTime())) {
      toast({
        title: "Format Tanggal/Waktu Salah",
        description:
          "Pastikan format tanggal dan waktu yang Anda masukkan sudah benar.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }

    // Validasi user dan user.id sebelum insert event
    if (!user || !user.id) {
      toast({
        title: "Gagal Membuat Acara",
        description: "User tidak valid. Silakan login ulang.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }
    console.log("user.id saat insert event:", user.id);
    const eventData = {
      user_id: user.id,
      title: newEvent.title,
      description: newEvent.description,
      date: eventDate.toISOString(),
      location: newEvent.location,
      price: parseFloat(newEvent.price) || 0,
      capacity: parseInt(newEvent.capacity, 10),
      category: newEvent.category,
    };

    console.log("Mencoba menyimpan data acara:", eventData);

    let insertTimedOut = false;
    const insertPromise = supabase.from("events").insert([eventData]);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        insertTimedOut = true;
        reject(new Error("Timeout: Gagal menyimpan acara, coba lagi."));
      }, 10000)
    );
    try {
      await Promise.race([insertPromise, timeoutPromise]);
      if (insertTimedOut)
        throw new Error("Timeout: Gagal menyimpan acara, coba lagi.");
      toast({
        title: "Acara Berhasil Dibuat!",
        description: `'${newEvent.title}' sekarang ada di daftar acara Anda.`,
      });
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        price: "",
        category: "",
      });
      setIsCreateModalOpen(false);
      setIsCreating(false);
      await fetchEvents();
    } catch (error) {
      toast({
        title: "Gagal Membuat Acara",
        description: error.message || "Terjadi error saat menyimpan acara.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEventForEdit(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      category: event.category,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = () => {
    const updatedEvents = events.map((event) =>
      event.id === selectedEventForEdit.id
        ? {
            ...event,
            ...newEvent,
            capacity: Number.parseInt(newEvent.capacity),
            price: Number.parseFloat(newEvent.price),
          }
        : event
    );
    setEvents(updatedEvents);
    setIsEditModalOpen(false);
    setSelectedEventForEdit(null);

    toast({
      title: "Acara Berhasil Diperbarui!",
      description: "Detail acara telah berhasil diperbarui.",
    });
  };

  const handleDeleteConfirmation = (event) => {
    setEventToDelete(event);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteEvent = () => {
    if (!eventToDelete) return;
    setEvents(events.filter((event) => event.id !== eventToDelete.id));
    toast({
      title: "Acara Berhasil Dihapus",
      description: "Acara telah berhasil dihapus.",
    });
    setIsDeleteAlertOpen(false);
    setEventToDelete(null);
  };

  const handleViewDetails = (event) => {
    router.push(`/event/${event.id}`);
  };

  const handleViewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setIsParticipantModalOpen(true);
  };

  const handleGenerateQR = (event) => {
    setSelectedEventForQR(event);
    setIsQRModalOpen(true);
  };

  const handleExportData = (format) => {
    const teacherName = profile?.full_name || user?.name || "Teacher";
    const now = new Date();
    const tanggalCetak = now.toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const totalPendapatan = events.reduce(
      (sum, event) => sum + (event.price || 0) * (event.verified || 0),
      0
    );
    if (format === "PDF") {
      const doc = new jsPDF();
      // Header
      doc.setFontSize(18);
      doc.text("Laporan Event & Peserta", 14, 16);
      doc.setFontSize(11);
      doc.text(`Nama Teacher: ${teacherName}`, 14, 26);
      doc.text(`Tanggal Cetak: ${tanggalCetak}`, 14, 32);
      // Ringkasan
      doc.setFontSize(12);
      doc.text("Ringkasan:", 14, 42);
      doc.setFontSize(11);
      doc.text(`Total Acara: ${aggregatedStats.totalEvents}`, 14, 48);
      doc.text(`Total Peserta: ${aggregatedStats.totalParticipants}`, 14, 54);
      doc.text(`Terverifikasi: ${aggregatedStats.totalVerified}`, 14, 60);
      doc.text(
        `Total Pendapatan: Rp${totalPendapatan.toLocaleString("id-ID")}`,
        14,
        66
      );
      // Tabel Event
      doc.setFontSize(12);
      doc.text("Daftar Event:", 14, 76);
      doc.setFontSize(10);
      const eventTableCol = [
        "No",
        "Judul",
        "Tanggal",
        "Lokasi",
        "Peserta",
        "Status",
        "Pendapatan",
      ];
      const eventTableRows = events.map((event, idx) => [
        idx + 1,
        event.title,
        event.date ? new Date(event.date).toLocaleDateString("id-ID") : "-",
        event.location,
        `${event.participants_count || 0}/${event.capacity}`,
        event.status,
        `Rp${((event.price || 0) * (event.verified || 0)).toLocaleString(
          "id-ID"
        )}`,
      ]);
      doc.autoTable({
        head: [eventTableCol],
        body: eventTableRows,
        startY: 80,
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      // Tabel Peserta
      let pesertaTableY = doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 10
        : 100;
      doc.setFontSize(12);
      doc.text("Daftar Peserta:", 14, pesertaTableY);
      doc.setFontSize(10);
      const pesertaTableCol = [
        "No",
        "Nama",
        "Email",
        "Event",
        "Status",
        "Tgl. Registrasi",
      ];
      const pesertaTableRows = participants.map((p, idx) => [
        idx + 1,
        p.name || "-",
        p.email || "-",
        events.find((e) => e.id === p.event_id)?.title || "-",
        p.status,
        p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "-",
      ]);
      doc.autoTable({
        head: [pesertaTableCol],
        body: pesertaTableRows,
        startY: pesertaTableY + 4,
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] },
      });
      doc.save("laporan-event-peserta.pdf");
      toast({
        title: "Ekspor PDF Berhasil",
        description: "File PDF laporan event & peserta berhasil diunduh.",
      });
    } else if (format === "Excel") {
      // Sheet 1: Ringkasan
      const summarySheet = [
        ["Ringkasan"],
        ["Nama Teacher", teacherName],
        ["Tanggal Cetak", tanggalCetak],
        ["Total Acara", aggregatedStats.totalEvents],
        ["Total Peserta", aggregatedStats.totalParticipants],
        ["Terverifikasi", aggregatedStats.totalVerified],
        ["Total Pendapatan", `Rp${totalPendapatan.toLocaleString("id-ID")}`],
      ];
      // Sheet 2: Event
      const eventSheet = [
        ["No", "Judul", "Tanggal", "Lokasi", "Peserta", "Status", "Pendapatan"],
        ...events.map((event, idx) => [
          idx + 1,
          event.title,
          event.date ? new Date(event.date).toLocaleDateString("id-ID") : "-",
          event.location,
          `${event.participants_count || 0}/${event.capacity}`,
          event.status,
          `Rp${((event.price || 0) * (event.verified || 0)).toLocaleString(
            "id-ID"
          )}`,
        ]),
      ];
      // Sheet 3: Peserta
      const pesertaSheet = [
        ["No", "Nama", "Email", "Event", "Status", "Tgl. Registrasi"],
        ...participants.map((p, idx) => [
          idx + 1,
          p.name || "-",
          p.email || "-",
          events.find((e) => e.id === p.event_id)?.title || "-",
          p.status,
          p.created_at
            ? new Date(p.created_at).toLocaleDateString("id-ID")
            : "-",
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
      const wsEvent = XLSX.utils.aoa_to_sheet(eventSheet);
      const wsPeserta = XLSX.utils.aoa_to_sheet(pesertaSheet);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");
      XLSX.utils.book_append_sheet(wb, wsEvent, "Event");
      XLSX.utils.book_append_sheet(wb, wsPeserta, "Peserta");
      XLSX.writeFile(wb, "laporan-event-peserta.xlsx");
      toast({
        title: "Ekspor Excel Berhasil",
        description: "File Excel laporan event & peserta berhasil diunduh.",
      });
    } else if (format === "Laporan Pendaftaran") {
      const doc = new jsPDF();
      doc.text("Laporan Pendaftaran Peserta", 14, 16);
      const tableColumn = ["No", "Nama Peserta", "Acara", "Status"];
      const tableRows = [];
      participants.forEach((p, idx) => {
        tableRows.push([
          idx + 1,
          p.name || p.email || "-",
          events.find((e) => e.id === p.event_id)?.title || "N/A",
          p.status,
        ]);
      });
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save("laporan-pendaftaran.pdf");
      toast({
        title: "Laporan Pendaftaran Diunduh",
        description: "File PDF laporan pendaftaran berhasil diunduh.",
      });
    } else if (format === "Kode QR") {
      toast({
        title: "Kode QR Dibuat",
        description: "Fitur pembuatan QR code massal belum tersedia.",
      });
    } else if (format === "Email Massal") {
      toast({
        title: "Email Massal Terkirim",
        description: "Simulasi pengiriman email massal berhasil.",
      });
    } else if (format === "Sertifikat") {
      const doc = new jsPDF();
      doc.text("SERTIFIKAT PENGHARGAAN", 60, 40);
      doc.text("Diberikan kepada seluruh peserta.", 40, 60);
      doc.save("sertifikat-peserta.pdf");
      toast({
        title: "Sertifikat Diunduh",
        description: "File PDF sertifikat berhasil diunduh (dummy).",
      });
    } else {
      toast({
        title: `Aksi ${format}`,
        description: "Fitur ini belum diimplementasikan.",
      });
    }
  };

  const handleSendEmail = (participant) => {
    toast({
      title: "Email Terkirim",
      description: `Email telah dikirim ke ${participant.name}`,
    });
  };

  const handleVerifyParticipant = (participantId) => {
    setParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, status: "verified" } : p
      )
    );
    toast({
      title: "Peserta Diverifikasi",
      description: "Status peserta telah berhasil diperbarui.",
    });
  };

  const processedEvents = events
    .filter((event) =>
      event.title.toLowerCase().includes(eventSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (eventSortOrder) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const handleParticipantSort = (key) => {
    let direction = "ascending";
    if (
      participantSortConfig.key === key &&
      participantSortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setParticipantSortConfig({ key, direction });
  };

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.institution.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent =
      selectedEvent === "all" || participant.event_id === selectedEvent;
    const matchesStatus =
      participantFilter === "all" || participant.status === participantFilter;

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (a[participantSortConfig.key] < b[participantSortConfig.key]) {
      return participantSortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[participantSortConfig.key] > b[participantSortConfig.key]) {
      return participantSortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Ubah statCards: Hapus Pendapatan
  const statCards = [
    {
      title: "Total Acara",
      value: aggregatedStats.totalEvents,
      icon: Calendar,
      change: "+2 bulan ini",
      changeColor: "text-green-400",
    },
    {
      title: "Total Partisipan",
      value: aggregatedStats.totalParticipants,
      icon: Users,
      change: "+156 minggu ini",
      changeColor: "text-green-400",
    },
    {
      title: "Terverifikasi",
      value: aggregatedStats.totalVerified,
      icon: CheckCircle,
      change: `${aggregatedStats.verificationRate}% tingkat verifikasi`,
      changeColor: "text-blue-400",
    },
  ];

  const handleDeleteParticipantConfirmation = (participant) => {
    setParticipantToDelete(participant);
    setIsDeleteParticipantAlertOpen(true);
  };

  const handleDeleteParticipant = () => {
    if (!participantToDelete) return;
    setParticipants(
      participants.filter((p) => p.id !== participantToDelete.id)
    );
    toast({
      title: "Peserta Berhasil Dihapus",
      description: "Peserta telah berhasil dihapus dari daftar.",
    });
    setIsDeleteParticipantAlertOpen(false);
    setParticipantToDelete(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#111827] to-[#1C294A] text-white">
      {/* Sidebar can be added here if needed */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Teacher Dashboard
              <Badge className="bg-blue-500 text-white">Teacher</Badge>
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your events and track participant engagement
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <UserDropdown
              userRole="teacher"
              userName={profile?.full_name || user?.name || "Teacher"}
              userEmail={user?.email}
              userAvatarUrl={profile?.avatar_url}
            />
          </div>
        </header>
        {/* Konten Utama */}
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="bg-slate-800/80 p-5 rounded-2xl shadow-lg border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <stat.icon
                    className={`h-6 w-6 ${stat.changeColor || "text-gray-500"}`}
                  />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center text-xs mt-1 text-gray-400">
                  {/* Placeholder for change indicator */}
                </div>
              </Card>
            ))}
          </div>

          {/* Ringkasan Acara */}
          <Card className="bg-slate-800/80 p-6 rounded-2xl shadow-lg border-slate-700">
            <CardTitle className="text-xl font-bold text-white mb-4">
              Ringkasan Acara
            </CardTitle>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{ participants: chartConfig.participants }}
                className="w-full h-[250px]"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={14}
                    stroke="#e5e7eb" // abu-abu terang
                    tick={{ fill: "#e5e7eb", fontWeight: 500 }}
                  />
                  <YAxis
                    yAxisId="participants"
                    tickLine={false}
                    axisLine={false}
                    fontSize={14}
                    stroke="#e5e7eb"
                    tick={{ fill: "#e5e7eb", fontWeight: 500 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        className="bg-slate-900/80 border-slate-700 text-gray-100"
                        style={{ color: "#e5e7eb" }}
                      />
                    }
                  />
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        className="text-gray-200"
                        style={{ color: "#e5e7eb" }}
                      />
                    }
                  />
                  <Bar
                    yAxisId="participants"
                    dataKey="participants"
                    fill="#3b82f6"
                    radius={4}
                    name="Peserta"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                <p>Data acara tidak ditemukan untuk ditampilkan di grafik.</p>
              </div>
            )}
          </Card>

          {/* Tabs untuk Acara Saya, Peserta, Laporan */}
          <Tabs defaultValue="my-events" className="w-full">
            <TabsList className="bg-slate-800/80 border border-slate-700 rounded-lg">
              <TabsTrigger
                value="my-events"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-200 font-medium"
              >
                Acara Saya
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-200 font-medium"
              >
                Peserta
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-200 font-medium"
              >
                Laporan
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="my-events" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">Acara Anda</h2>
                  <p className="text-gray-300 text-sm">
                    Cari, kelola, dan buat acara baru di sini.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      placeholder="Cari acara..."
                      value={eventSearchTerm}
                      onChange={(e) => setEventSearchTerm(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 pl-10 w-full md:w-48"
                    />
                  </div>
                  <Select
                    value={eventSortOrder}
                    onValueChange={setEventSortOrder}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white w-full md:w-48">
                      <SelectValue placeholder="Urutkan berdasarkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">
                        Tanggal (Terbaru)
                      </SelectItem>
                      <SelectItem value="date-asc">
                        Tanggal (Terlama)
                      </SelectItem>
                      <SelectItem value="title-asc">Judul (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Judul (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Acara Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-white/20 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Buat Acara Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Judul Acara *</Label>
                          <Input
                            id="title"
                            value={newEvent.title}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                title: e.target.value,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Kategori *</Label>
                          <Select
                            value={newEvent.category}
                            onValueChange={(value) =>
                              setNewEvent({ ...newEvent, category: value })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sains">Sains</SelectItem>
                              <SelectItem value="Teknologi">
                                Teknologi
                              </SelectItem>
                              <SelectItem value="Seni">Seni</SelectItem>
                              <SelectItem value="Matematika">
                                Matematika
                              </SelectItem>
                              <SelectItem value="Lingkungan">
                                Lingkungan
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="date">Tanggal *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, date: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <span className="text-xs text-gray-400">
                            Pilih tanggal dari kalender, jangan ketik manual.
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="time">Waktu *</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newEvent.time}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, time: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Harga (Rp)</Label>
                          <Input
                            id="price"
                            type="number"
                            min={0}
                            value={newEvent.price}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                price: e.target.value,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Masukkan harga (Rp)"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Lokasi *</Label>
                          <Input
                            id="location"
                            value={newEvent.location}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                location: e.target.value,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity">Kapasitas *</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={newEvent.capacity}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                capacity: e.target.value,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleCreateEvent}
                          className="bg-blue-500 hover:bg-blue-600 w-36"
                          disabled={isCreating}
                        >
                          {isCreating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isCreating ? "Menyimpan..." : "Buat Acara"}
                        </Button>
                        <Button
                          onClick={() => setIsCreateModalOpen(false)}
                          disabled={isCreating}
                          className="bg-gray-700 text-white"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {processedEvents.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    Belum ada acara. Klik <b>Buat Acara Baru</b> untuk mulai.
                  </div>
                )}
                {processedEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {event.title}
                            </h3>
                            <Badge
                              className={
                                event.status === "active"
                                  ? "bg-green-500 text-white"
                                  : event.status === "registration"
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-500 text-white"
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-200 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-blue-400" />
                              <span>
                                {event.date
                                  ? new Date(event.date).toLocaleString(
                                      "id-ID",
                                      { dateStyle: "long", timeStyle: "short" }
                                    )
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-orange-400" />
                              <span>
                                {event.participants_count}/{event.capacity}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                              <span>
                                {event.price && event.price > 0
                                  ? `Rp${Number(event.price).toLocaleString(
                                      "id-ID"
                                    )}`
                                  : "Gratis"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {event.participants_count}
                          </div>
                          <div className="text-sm text-gray-200">
                            Registered
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {event.verified}
                          </div>
                          <div className="text-sm text-gray-200">Verified</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {event.pending}
                          </div>
                          <div className="text-sm text-gray-200">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {event.capacity - event.participants_count}
                          </div>
                          <div className="text-sm text-gray-200">Available</div>
                        </div>
                      </div>

                      <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (event.participants_count / event.capacity) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                          onClick={() => handleViewDetails(event)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Lihat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                          onClick={() => handleGenerateQR(event)}
                        >
                          <QrCode className="h-4 w-4 mr-1" /> QR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                          onClick={() => handleExportData("PDF")}
                        >
                          <FileText className="h-4 w-4 mr-1" /> Ekspor PDF
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="border-red-400 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          onClick={() => handleDeleteConfirmation(event)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Manajemen Peserta
                </h2>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      placeholder="Cari peserta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-300 pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={selectedEvent}
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white w-48">
                      <SelectValue placeholder="Filter berdasarkan acara" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Acara</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead
                          className="text-gray-200 font-medium cursor-pointer"
                          onClick={() => handleParticipantSort("name")}
                        >
                          Peserta
                        </TableHead>
                        <TableHead className="text-gray-200 font-medium">
                          Kontak
                        </TableHead>
                        <TableHead
                          className="text-gray-200 font-medium cursor-pointer"
                          onClick={() => handleParticipantSort("created_at")}
                        >
                          Tgl. Registrasi
                        </TableHead>
                        <TableHead
                          className="text-gray-200 font-medium cursor-pointer"
                          onClick={() => handleParticipantSort("event")}
                        >
                          Acara
                        </TableHead>
                        <TableHead
                          className="text-gray-200 font-medium cursor-pointer"
                          onClick={() => handleParticipantSort("status")}
                        >
                          Status
                        </TableHead>
                        <TableHead className="text-gray-200 font-medium">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedParticipants.map((participant) => (
                        <TableRow
                          key={participant.id}
                          className="border-white/20 hover:bg-white/5"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white">
                                  {participant.name
                                    ? participant.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "N/A"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-white">
                                  {participant.name || "Nama Peserta"}
                                </div>
                                <div className="text-sm text-gray-300">
                                  ID: {participant.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-gray-200">
                                <Mail className="h-3 w-3 mr-1" />
                                <span className="text-sm">
                                  {participant.email || "email@peserta.com"}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-200">
                                <Phone className="h-3 w-3 mr-1" />
                                <span className="text-sm">
                                  {participant.phone || "08123456789"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-white">
                                {new Date(
                                  participant.created_at
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">
                              {events.find((e) => e.id === participant.event_id)
                                ?.title || "Acara Dihapus"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                participant.status === "verified"
                                  ? "bg-green-500 text-white"
                                  : participant.status === "pending"
                                  ? "bg-orange-500 text-white"
                                  : "bg-red-500 text-white"
                              }
                            >
                              {participant.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                                onClick={() =>
                                  handleViewParticipantDetails(participant)
                                }
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                                onClick={() => handleGenerateQR(participant)}
                              >
                                <QrCode className="h-3 w-3" />
                              </Button>
                              {participant.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-400 bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                  onClick={() =>
                                    handleVerifyParticipant(participant.id)
                                  }
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-400 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                onClick={() =>
                                  handleDeleteParticipantConfirmation(
                                    participant
                                  )
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  Laporan & Analitik
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                    onClick={() => handleExportData("Excel")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Ekspor Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/40 bg-slate-800/50 text-white hover:bg-white/20"
                    onClick={() => handleExportData("PDF")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ekspor PDF
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Laporan Pendaftaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">Total Pendaftaran</span>
                      <span className="text-2xl font-bold text-white">
                        {participants.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">
                        Peserta Terverifikasi
                      </span>
                      <span className="text-2xl font-bold text-green-400">
                        {
                          participants.filter((p) => p.status === "verified")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">Menunggu Verifikasi</span>
                      <span className="text-2xl font-bold text-orange-400">
                        {
                          participants.filter((p) => p.status === "pending")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">Tingkat Verifikasi</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {participants.length > 0
                          ? Math.round(
                              (participants.filter(
                                (p) => p.status === "verified"
                              ).length /
                                participants.length) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold"
                      onClick={() => handleExportData("Laporan Pendaftaran")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Laporan Lengkap
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-slate-800 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Anda Yakin Ingin Menghapus?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus acara
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-800 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Acara</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Judul Acara *</Label>
                <Input
                  id="edit-title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Kategori *</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, category: value })
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sains">Sains</SelectItem>
                    <SelectItem value="Teknologi">Teknologi</SelectItem>
                    <SelectItem value="Seni">Seni</SelectItem>
                    <SelectItem value="Matematika">Matematika</SelectItem>
                    <SelectItem value="Lingkungan">Lingkungan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-date">Tanggal *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Waktu *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Harga (Rp)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={newEvent.price}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, price: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Lokasi *</Label>
                <Input
                  id="edit-location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-capacity">Kapasitas *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, capacity: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleUpdateEvent}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Perbarui Acara
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-700 text-white"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="bg-slate-800 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Pembuat Kode QR</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="h-32 w-32 text-gray-800" />
            </div>
            <p className="text-gray-300">
              Kode QR untuk:{" "}
              {selectedEventForQR?.title || selectedEventForQR?.name}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => handleExportData("Kode QR")}
              >
                <Download className="h-4 w-4 mr-2" />
                Unduh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `QR-${
                      selectedEventForQR?.id || selectedEventForQR?.ticketId
                    }`
                  );
                  toast({ title: "Kode QR disalin ke clipboard!" });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Salin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <Dialog
          open={isParticipantModalOpen}
          onOpenChange={setIsParticipantModalOpen}
        >
          <DialogContent className="bg-slate-800 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Informasi Peserta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl">
                    {selectedParticipant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedParticipant.name}
                  </h3>
                  <p className="text-gray-300">
                    {selectedParticipant.institution}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">Email</p>
                  <p className="text-white">{selectedParticipant.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">Telepon</p>
                  <p className="text-white">{selectedParticipant.phone}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">Acara</p>
                  <p className="text-white">{selectedParticipant.event_id}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">ID Tiket</p>
                  <p className="text-white">{selectedParticipant.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">
                    Tanggal Registrasi
                  </p>
                  <p className="text-white">{selectedParticipant.created_at}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-400">Status</p>
                  <Badge
                    className={
                      selectedParticipant.status === "verified"
                        ? "bg-green-500 text-white"
                        : "bg-orange-500 text-white"
                    }
                  >
                    {selectedParticipant.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <School className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Asal Sekolah</p>
                    <p className="font-medium">
                      {selectedParticipant.institution}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">NIS</p>
                    <p className="font-medium">
                      {selectedParticipant.nis || "Tidak ada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Participant Confirmation Alert */}
      <AlertDialog
        open={isDeleteParticipantAlertOpen}
        onOpenChange={setIsDeleteParticipantAlertOpen}
      >
        <AlertDialogContent className="bg-slate-800 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anda Yakin Ingin Menghapus Peserta Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tindakan ini tidak bisa dibatalkan. Data peserta akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteParticipantAlertOpen(false)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParticipant}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
