# Burjo Lestari Member App

Aplikasi React Native (Expo Router) untuk mengelola member, pembayaran membership, transaksi, dan saldo cashback Burjo Lestari. Frontend ini disiapkan untuk terhubung dengan backend Node.js + Supabase yang mengikuti aturan membership/cashback pada spesifikasi proyek.

## Fitur utama

- 📇 CRUD member beserta status membership aktif/kedaluwarsa.
- 💳 Pencatatan pembayaran membership 30 hari dengan dukungan input tanggal mundur.
- 🧾 Pencatatan transaksi lengkap dengan opsi penggunaan cashback dan validasi sisi klien.
- 💰 Ringkasan saldo cashback aktif dan yang masih tertahan sampai bulan berikutnya.
- 📱 Profil aplikasi yang mudah dikustomisasi untuk kebutuhan tugas/kampus.

## Struktur proyek

```
app/
  _layout.tsx                # Stack utama
  (tabs)/                    # Bottom tabs (member, transaksi, profil)
  member/[id].tsx            # Detail member + bayar membership
  transaction/[id].tsx       # Detail transaksi
constants/
  api.ts                     # Konfigurasi base URL backend
  appInfo.ts                 # Metadata aplikasi & identitas developer
```

## Konfigurasi lingkungan

1. **Endpoint backend**

   - Atur `EXPO_PUBLIC_API_URL` di `.env` (Expo) **atau** isi `extra.apiUrl` pada `app.json`. Contoh:

     ```env
     EXPO_PUBLIC_API_URL=http://192.168.1.5:4000
     ```

   - Jika variabel tersebut tidak diisi, aplikasi akan memakai fallback `http://192.168.1.10:4000`. Sesuaikan sesuai jaringan lokalmu.

2. **Identitas developer (opsional)**

   Tambahkan variabel berikut agar halaman Profil otomatis menampilkan identitas kamu:

   ```env
   EXPO_PUBLIC_DEVELOPER_NAME=Nama Kamu
   EXPO_PUBLIC_DEVELOPER_NIM=123456789
   EXPO_PUBLIC_DEVELOPER_CLASS=TI-1A
   EXPO_PUBLIC_DEVELOPER_CONTACT=0812xxxxxxx
   ```

   Alternatif lain: edit langsung file `constants/appInfo.ts`.

## Menjalankan aplikasi

1. Instal dependensi:

   ```bash
   npm install
   ```

2. Jalankan backend Node.js + Express di port `4000` sesuai spesifikasi.

3. Start Expo:

   ```bash
   npm start
   ```

4. Buka aplikasi melalui Expo Go / emulator. Pastikan device berada di jaringan yang sama dengan backend.

## Catatan tambahan

- Semua request dilakukan menggunakan endpoint REST yang tercantum di spesifikasi (mis. `/api/members`, `/api/members/:id/summary`, `/api/transactions`).
- Validasi sisi klien menyesuaikan aturan bisnis: minimal transaksi, plafon cashback, saldo aktif, dan tanggal berformat `YYYY-MM-DD`.
- Komponen list sudah mendukung **pull-to-refresh** untuk sinkronisasi cepat dengan backend.
- Jika ingin melakukan penyesuaian gaya atau copy, lihat setiap file di dalam `app/(tabs)` beserta stylesheet-nya.

Selamat mengembangkan! 🚀
