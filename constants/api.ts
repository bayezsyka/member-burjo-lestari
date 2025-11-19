// constants/api.ts
// Helper untuk menentukan base URL backend secara fleksibel.
// 1. Saat build Expo, kita bisa mengirim nilai melalui extra.apiUrl.
// 2. Saat development, bisa pakai variabel lingkungan EXPO_PUBLIC_API_URL.
// 3. Jika keduanya tidak ada, fallback ke IP lokal umum (silakan sesuaikan).
import Constants from "expo-constants";

type ExtraConfig = {
  apiUrl?: string;
};

const expoExtra = Constants.expoConfig?.extra as ExtraConfig | undefined;
const fallbackUrl = "http://192.168.1.10:4000"; // ubah sesuai jaringan lokal kamu

const resolvedUrl =
  expoExtra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

export const BASE_URL = resolvedUrl.replace(/\/$/, "");
