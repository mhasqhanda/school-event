"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast({
        title: "Data Kurang Lengkap",
        description: "Tolong isi semua kolom yang wajib diisi, ya!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Pesan Berhasil Dikirim!",
      description: "Kami bakal balas dalam 24 jam, tungguin aja ya!",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    });

    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Kami",
      details: "info@telsevents.com",
      subDetails: "support@telsevents.com",
      color: "text-blue-400",
      action: () => window.open("mailto:info@telsevents.com"),
    },
    {
      icon: Phone,
      title: "Telepon Kami",
      details: "+1 (555) 123-4567",
      subDetails: "Senin-Jumat 9AM-6PM WIB",
      color: "text-orange-400",
      action: () => window.open("tel:+15551234567"),
    },
    {
      icon: MapPin,
      title: "Kunjungi Kami",
      details: "Jl. Pendidikan 123",
      subDetails: "Kota Belajar, KB 12345",
      color: "text-purple-400",
      action: () => window.open("https://maps.google.com"),
    },
  ];

  const faqItems = [
    {
      question: "Gimana cara daftar acara?",
      answer:
        "Tinggal buka halaman acara, pilih acara yang kamu mau, terus klik 'Beli Tiket' buat daftar.",
    },
    {
      question: "Bisa refund nggak kalau nggak jadi datang?",
      answer:
        "Bisa dong! Refund penuh sampai 48 jam sebelum acara mulai. Hubungi tim support kami aja, ya!",
    },
    {
      question: "Ada diskon buat rombongan?",
      answer:
        "Ada, kok! Minimal 10 orang, langsung hubungi kami buat harga spesial.",
    },
    {
      question: "Tiketnya dikirim gimana?",
      answer:
        "Tiket digital plus QR code bakal dikirim ke email kamu setelah beli. Bisa juga dicek di dashboard, ya!",
    },
  ];

  const categories = [
    "Pertanyaan Umum",
    "Bantuan Teknis",
    "Pendaftaran Acara",
    "Pembayaran & Tagihan",
    "Kerja Sama",
    "Media & Pers",
    "Lainnya",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Hubungi
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              {" "}
              Kami
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ada pertanyaan soal acara? Atau butuh bantuan daftar? Tenang, tim
            kami siap bantu kamu!
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                onClick={info.action}
              >
                <CardContent className="p-6 text-center">
                  <info.icon
                    className={`h-12 w-12 ${info.color} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="text-lg font-bold text-white mb-2">
                    {info.title}
                  </h3>
                  <p className="text-white font-medium">{info.details}</p>
                  <p className="text-gray-300 text-sm mt-1">
                    {info.subDetails}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 mr-2 text-orange-400" />
                  Kirim Pesan ke Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-medium">
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nama lengkap kamu"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">
                        Alamat Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="emailkamu@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-white font-medium"
                    >
                      Kategori
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white font-medium">
                      Subjek *
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Ceritain singkat pertanyaanmu"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white font-medium">
                      Pesan *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Ceritain detail pertanyaanmu di sini..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 min-h-[120px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Lagi ngirim pesan...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    Jam Operasional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-gray-200">
                    <span>Senin - Jumat</span>
                    <span className="font-semibold">09.00 - 18.00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-200">
                    <span>Sabtu</span>
                    <span className="font-semibold">10.00 - 16.00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-200">
                    <span>Minggu</span>
                    <span className="font-semibold">Tutup</span>
                  </div>
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center text-green-300">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        Lagi online nih
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div
                      key={index}
                      className="border-b border-white/20 pb-4 last:border-b-0"
                    >
                      <h4 className="text-white font-semibold mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-300 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-white/5 text-white hover:bg-white/10 mt-4"
                    onClick={() =>
                      toast({
                        title: "FAQ Page",
                        description: "Redirecting to full FAQ page",
                      })
                    }
                  >
                    View All FAQs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
