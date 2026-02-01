"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Pengaturan Disimpan",
      description: "Preferensi Anda telah berhasil diperbarui.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />
      <main className="flex-1 w-full pt-24">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Pengaturan
          </h1>
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Notifikasi</CardTitle>
                <CardDescription className="text-gray-300">
                  Kelola cara Anda menerima notifikasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-200">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-white">
                    Notifikasi Email
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-new-event" defaultChecked />
                    <Label htmlFor="email-new-event">
                      Saat acara baru yang relevan diposting
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-updates" defaultChecked />
                    <Label htmlFor="email-updates">
                      Pembaruan tentang acara yang Anda ikuti
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-newsletter" />
                    <Label htmlFor="email-newsletter">
                      Newsletter mingguan TelsEvents
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-white">
                    Notifikasi Push
                  </Label>
                  <div className="flex items-center justify-between rounded-lg border border-white/20 p-4">
                    <p className="text-sm">Notifikasi di perangkat seluler</p>
                    <Switch id="push-notifications" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Tampilan</CardTitle>
                <CardDescription className="text-gray-300">
                  Sesuaikan tampilan dan nuansa aplikasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-gray-300">
                      Tema
                    </Label>
                    <Select defaultValue="system">
                      <SelectTrigger
                        id="theme"
                        className="bg-white/10 border-white/20 text-white"
                      >
                        <SelectValue placeholder="Pilih tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Terang</SelectItem>
                        <SelectItem value="dark">Gelap</SelectItem>
                        <SelectItem value="system">Sistem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-300">
                      Bahasa
                    </Label>
                    <Select defaultValue="id">
                      <SelectTrigger
                        id="language"
                        className="bg-white/10 border-white/20 text-white"
                      >
                        <SelectValue placeholder="Pilih bahasa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
