// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  APP_INFO,
  DEVELOPER_INFO,
  FEATURE_LIST,
  TECH_STACK,
} from "../../constants/appInfo";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{APP_INFO.name}</Text>
      <Text style={styles.tagline}>{APP_INFO.tagline}</Text>
      <Text style={styles.paragraph}>{APP_INFO.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitur Utama</Text>
        {FEATURE_LIST.map((feature) => (
          <View style={styles.listItem} key={feature}>
            <View style={styles.bullet} />
            <Text style={styles.paragraph}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teknologi</Text>
        {TECH_STACK.map((tech) => (
          <Text style={styles.paragraph} key={tech}>
            • {tech}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identitas Pengembang</Text>
        <Text style={styles.paragraph}>Nama: {DEVELOPER_INFO.name}</Text>
        <Text style={styles.paragraph}>NIM: {DEVELOPER_INFO.nim}</Text>
        <Text style={styles.paragraph}>Kelas: {DEVELOPER_INFO.className}</Text>
        <Text style={styles.paragraph}>Kontak: {DEVELOPER_INFO.contact}</Text>
        <Text style={[styles.helperText, { marginTop: 8 }]}>
          Catatan: ganti informasi di file <Text style={styles.monospace}>constants/appInfo.ts</Text> atau
          set variabel lingkungan Expo (mis. EXPO_PUBLIC_DEVELOPER_NAME) agar data
          ini sesuai identitas kamu.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  paragraph: {
    fontSize: 16,
    color: "#111827",
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    marginRight: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  monospace: {
    fontFamily: "monospace",
  },
});
