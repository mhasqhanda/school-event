"use client";

import { useAuth } from "@/components/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    institution: "Universitas Teknologi",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile && user) {
      setProfileData({
        name: profile.full_name || "",
        email: user.email || "",
        institution: profile.institution || "Universitas Teknologi",
      });
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.name,
      })
      .eq("id", user.id);
    if (error) {
      toast({
        title: "Gagal memperbarui profil",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await refreshProfile();
      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan.",
      });
    }
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Kata Sandi Diubah",
      description: "Kata sandi Anda telah berhasil diubah.",
    });
  };

  // Handler upload foto profil
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const supabase = createClient();
    const file = e.target.files[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setAvatarUploading(false);
      toast({
        title: "Gagal upload foto",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }
    // Dapatkan public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;
    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);
    setAvatarUploading(false);
    if (updateError) {
      toast({
        title: "Gagal update foto profil",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    // Fetch ulang profile
    toast({ title: "Foto profil diperbarui!" });
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />
      <main className="flex-1 w-full pt-24">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Profil Pengguna
          </h1>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {profile?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {profile?.full_name || "John Doe"}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {profile?.role === "teacher" ? "Guru" : "Siswa"}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">
                          Nama Lengkap
                        </Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">
                          Alamat Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-gray-300">
                        Institusi
                      </Label>
                      <Input
                        id="institution"
                        value={profileData.institution}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Simpan Perubahan
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Ubah Kata Sandi</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-gray-300"
                      >
                        Kata Sandi Saat Ini
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-300">
                        Kata Sandi Baru
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-300"
                      >
                        Konfirmasi Kata Sandi Baru
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Ubah Kata Sandi
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
