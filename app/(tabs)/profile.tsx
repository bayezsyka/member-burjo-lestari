// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DEVELOPER_PROFILE } from "../../constants/appInfo";

const contactItems = [
  {
    label: "Nomor Telepon",
    value: DEVELOPER_PROFILE.phone,
    icon: "call-outline" as const,
    action: `tel:${DEVELOPER_PROFILE.phone}`,
  },
  {
    label: "Instagram",
    value: DEVELOPER_PROFILE.instagramHandle,
    icon: "logo-instagram" as const,
    action: DEVELOPER_PROFILE.instagramUrl,
  },
];

export default function ProfileScreen() {
  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn("Gagal membuka tautan", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Profil Pengembang</Text>
        <Text style={styles.heroName}>{DEVELOPER_PROFILE.name}</Text>
        <Text style={styles.heroNim}>NIM {DEVELOPER_PROFILE.nim}</Text>
      </View>

      <View style={styles.contactCard}>
        <Text style={styles.sectionTitle}>Kontak & Media Sosial</Text>
        {contactItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.contactRow}
            activeOpacity={0.8}
            onPress={() => handleOpenLink(item.action)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={item.icon} size={20} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}
        <Text style={styles.hint}>Tap salah satu baris untuk langsung menghubungi.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: "#0f172a",
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#1d4ed8",
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 8,
  },
  heroLabel: {
    color: "#bfdbfe",
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  heroNim: {
    color: "#e0f2fe",
    fontSize: 16,
    marginTop: 2,
  },
  contactCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f3f4f6",
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 13,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
  },
  hint: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 12,
  },
});
