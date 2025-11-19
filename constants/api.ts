// constants/api.ts
// Helper untuk menentukan base URL backend secara fleksibel.
// 1. Saat build Expo, kita bisa mengirim nilai melalui extra.apiUrl.
// 2. Saat development, bisa pakai variabel lingkungan EXPO_PUBLIC_API_URL.
// 3. Jika keduanya tidak ada, gunakan IP bundler (hostUri) agar otomatis mengikuti jaringan lokal.
import Constants from "expo-constants";

const expoConfig = Constants.expoConfig as { extra?: Record<string, unknown> } | undefined;
const expoExtra = expoConfig?.extra as { apiUrl?: string } | undefined;

const manifestDebuggerHost =
  (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;
const manifest2DebuggerHost =
  (Constants as unknown as {
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  }).manifest2?.extra?.expoGo?.debuggerHost;
const expoGoDebuggerHost = (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } })
  .expoGoConfig?.debuggerHost;
const hostUri = (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri;

const hostCandidates = [
  expoExtra?.apiUrl, // already a full URL, do not sanitize
  hostUri,
  manifestDebuggerHost,
  manifest2DebuggerHost,
  expoGoDebuggerHost,
];

const sanitizeHost = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http")) {
    try {
      const parsed = new URL(value);
      return parsed.hostname;
    } catch (error) {
      return null;
    }
  }
  const withoutScheme = value.replace(/^[a-zA-Z+.-]+:\/\//, "");
  const [hostname] = withoutScheme.split(":");
  if (!hostname || hostname === "undefined") return null;
  return hostname;
};

const derivedHost = hostCandidates
  .map((candidate) => sanitizeHost(candidate))
  .find((candidate) => candidate !== null);

const networkAwareFallback = derivedHost
  ? `http://${derivedHost}:4000`
  : "http://192.168.1.10:4000"; // ubah sesuai jaringan lokal kamu

const resolvedUrl =
  expoExtra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || networkAwareFallback;

export const BASE_URL = resolvedUrl.replace(/\/$/, "");
