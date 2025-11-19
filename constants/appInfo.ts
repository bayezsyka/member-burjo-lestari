export const APP_INFO = {
  name: "Burjo Lestari Member App",
  description:
    "Dasbor mobile untuk membantu kasir mengelola member, membership berbayar, dan saldo cashback di Burjo Lestari.",
  tagline: "Kelola member, transaksi, dan cashback dalam satu genggaman",
};

export const FEATURE_LIST = [
  "CRUD member lengkap beserta status membership",
  "Pencatatan pembayaran membership 30 hari",
  "Input transaksi dengan kalkulasi cashback otomatis",
  "Ringkasan saldo cashback aktif dan yang pending",
  "Detail transaksi dan profil aplikasi",
];

export const TECH_STACK = [
  "Expo + React Native 0.81",
  "expo-router untuk navigasi file-based",
  "TypeScript",
  "Node.js/Express + Supabase Postgres sebagai backend (sesuai spesifikasi)",
];

export const DEVELOPER_INFO = {
  name: process.env.EXPO_PUBLIC_DEVELOPER_NAME || "Nama pengembang belum diatur",
  nim: process.env.EXPO_PUBLIC_DEVELOPER_NIM || "-",
  className: process.env.EXPO_PUBLIC_DEVELOPER_CLASS || "-",
  contact: process.env.EXPO_PUBLIC_DEVELOPER_CONTACT || "-",
};
