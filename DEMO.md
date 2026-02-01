# Pure Demo – Tanpa Database & Tanpa Supabase

Website ini berjalan **pure demo**: tidak ada koneksi Supabase atau database. Semua data disimpan di `localStorage` browser.

## Menjalankan

```bash
npm run dev
```

Tidak perlu file `.env` atau env Supabase.

## Akun Demo

| Role    | Email            | Password |
| ------- | ---------------- | -------- |
| Teacher | teacher@demo.com | (bebas)  |
| Buyer   | buyer@demo.com   | (bebas)  |

Password bisa diisi apa saja.

## Fitur

- Login / Register (demo)
- Daftar event dengan data fake
- Detail event & pendaftaran
- Dashboard Teacher (buat event, lihat peserta)
- Dashboard Buyer (tiket, wishlist, riwayat)
- Data tersimpan di localStorage (sampai data browser dihapus)

## Reset Data Demo

- DevTools (F12) → Application → Local Storage
- Hapus: `demo_events`, `demo_participants`, `demo_profiles`, `demo_wishlist`, `demo_session`
- Refresh halaman
