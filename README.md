# Putarasa — Fondasi Next.js + Supabase

Ini adalah **starter fungsional**, BUKAN aplikasi produksi yang seluruh fiturnya selesai.

## Cara menjalankan
1. Buat proyek Supabase baru dan jalankan `supabase/schema.sql` pada SQL Editor.
2. Salin `.env.example` menjadi `.env.local`; isi Supabase URL dan anon key, serta GEMINI_API_KEY jika ingin chatbot AI.
3. Jalankan `npm install` lalu `npm run dev`.
4. Atur Supabase Auth URL Configuration: Site URL `http://localhost:3000` dan redirect URL `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password` (tambahkan URL produksi).
5. Aktifkan Email provider dan Google OAuth bila ingin menggunakan tombol Google.
6. Pengguna baru otomatis mendapat role buyer. **Jangan** izinkan register publik memberi role admin.
7. Untuk membuat admin pertama, jalankan dari SQL Editor tepercaya setelah akun dibuat: `insert into public.user_roles(user_id,role) values ('UUID-USER-ADMIN','admin');`.
8. Role supplier/courier diajukan melalui `/apply` dan disetujui admin melalui RPC `review_role_application`, misalnya `supabase.rpc('review_role_application',{app_id:'UUID',decision:'approved',note:null})` dari sesi admin.

## Sudah diimplementasikan
- Layout warna Putarasa responsif, login/register, email reset, Google OAuth callback, proteksi role server, dashboard role, daftar data Supabase (read-only), pengajuan role, GPS browser dengan validasi koordinat, chatbot mengambang terhubung ke Gemini jika API key disediakan.
- Schema dasar, foreign key, RLS, trigger buyer, RPC verifikasi role dan audit.

## Belum selesai (penting)
- UI CRUD lengkap admin, penugasan kurir dan workflow pickup, upload dokumen privat, peta interaktif/pin lokasi, geocoding alamat, formulir checkout dan RPC transaksi stok, pembayaran otomatis, laporan grafik, dan data riil dari seluruh modul.
- Saat ini pilihan role pada register adalah preferensi tampilan; setelah verifikasi email, pengguna harus mengajukan Supplier/Courier melalui `/apply`. Buyer aktif otomatis.
- Lokasi GPS benar-benar berasal dari browser setelah izin, tetapi reverse-geocoding dan pemilihan pin peta belum diimplementasikan. Alamat ditulis pengguna sendiri.
- Endpoint chatbot tidak punya kuota per user/rate limiting; tambahkan sebelum produksi.
- Untuk produksi perlu pengujian integrasi, transaksi database, verifikasi role, keamanan RLS, pembatasan spam, dan perlindungan dokumen.
