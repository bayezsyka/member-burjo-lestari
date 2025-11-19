// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* layar utama berisi bottom tab */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* detail member */}
      <Stack.Screen name="member/[id]" options={{ title: "Detail Member" }} />

      {/* detail transaksi */}
      <Stack.Screen
        name="transaction/[id]"
        options={{ title: "Detail Transaksi" }}
      />

      {/* modal bawaan template expo, biarkan saja */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
