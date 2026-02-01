# Deploy ke Vercel

Website ini siap di-deploy ke Vercel (pure demo, tidak perlu env Supabase).

## Opsi 1: Deploy via Vercel (Git)

1. **Push project ke GitHub** (jika belum):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

2. **Deploy di Vercel**:

   - Buka [vercel.com](https://vercel.com) → Login / Daftar
   - Klik **Add New** → **Project**
   - **Import** repo GitHub Anda
   - **Framework Preset**: Next.js (terdeteksi otomatis)
   - **Root Directory**: kosongkan (atau `.` jika diminta)
   - **Environment Variables**: tidak perlu (pure demo)
   - Klik **Deploy**

3. Setelah selesai, Anda dapat akses URL seperti:  
   `https://nama-project.vercel.app`

---

## Opsi 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login** (sekali saja):

   ```bash
   vercel login
   ```

3. **Deploy** (dari folder project):

   ```bash
   cd school-event-registration
   vercel
   ```

   Ikuti prompt (link ke project baru atau existing).

4. **Production deploy**:
   ```bash
   vercel --prod
   ```

---

## Catatan

- **Tidak perlu Environment Variables** untuk mode demo.
- Build command: `next build` (default).
- Output: Next.js (otomatis).
- Setelah deploy, login demo: `teacher@demo.com` atau `buyer@demo.com` (password bebas).
