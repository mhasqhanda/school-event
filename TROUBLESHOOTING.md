# Troubleshooting - Masalah Auto-Login

## Masalah: Website Langsung Masuk ke Akun Tanpa Login

Jika Anda mengalami masalah dimana website langsung masuk ke akun tanpa melakukan login terlebih dahulu, berikut adalah solusi yang dapat Anda coba:

### Penyebab Umum

1. **Session yang tersimpan di browser** - Supabase menyimpan session di localStorage/cookies
2. **Remember me functionality** - Session tidak kadaluarsa
3. **Development environment** - Data dummy yang tersimpan
4. **Browser cache** - Data login yang tersimpan di cache browser

### Solusi

#### 1. Menggunakan Fitur Clear Session (Direkomendasikan)

1. Klik tombol **"Clear Session"** di navbar (ikon refresh kuning)
2. Atau kunjungi halaman `/clear-session`
3. Klik tombol "Clear Session" untuk membersihkan semua data login
4. Refresh halaman website

#### 2. Menggunakan Halaman Debug (Development Mode)

Jika Anda dalam mode development:

1. Klik link **"Debug"** di navbar (ikon bug kuning)
2. Lihat status session yang tersimpan
3. Klik tombol **"Clear Browser Session"** jika ada data Supabase
4. Refresh halaman untuk memverifikasi

#### 3. Manual Browser Cleanup

Jika cara di atas tidak berhasil:

1. **Buka Developer Tools** (F12)
2. **Buka tab Application/Storage**
3. **Hapus semua data di:**
   - Local Storage
   - Session Storage
   - Cookies
4. **Refresh halaman**

#### 4. Mode Incognito/Private

1. Buka browser dalam mode incognito/private
2. Akses website
3. Pastikan tidak ada auto-login

#### 5. Clear Browser Data

1. **Chrome/Edge:** Settings > Privacy > Clear browsing data
2. **Firefox:** Options > Privacy & Security > Clear Data
3. **Safari:** Preferences > Privacy > Manage Website Data

### Pencegahan

Untuk mencegah masalah ini di masa depan:

1. **Logout dengan benar** - Gunakan tombol logout di website
2. **Clear session secara berkala** - Terutama setelah development
3. **Gunakan mode incognito** - Untuk testing yang bersih

### Fitur yang Ditambahkan

Website ini telah dilengkapi dengan beberapa fitur untuk mengatasi masalah auto-login:

- ✅ **Clear Session Button** - Tombol untuk membersihkan session
- ✅ **Debug Page** - Halaman untuk melihat status session (development)
- ✅ **Enhanced Auth Context** - Pengecekan session yang lebih ketat
- ✅ **Utility Functions** - Fungsi untuk membersihkan browser data
- ✅ **Development Mode Detection** - Konfigurasi khusus untuk development

### Kontak Support

Jika masalah masih berlanjut, silakan:

1. Cek halaman debug untuk informasi detail
2. Coba semua solusi di atas
3. Laporkan masalah dengan screenshot dari halaman debug

---

**Note:** Fitur debug hanya tersedia dalam mode development untuk keamanan.
