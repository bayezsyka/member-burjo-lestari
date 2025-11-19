// app/(tabs)/profile.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Burjo Lestari Member App</Text>
      <Text style={styles.text}>
        Aplikasi untuk mengelola member Burjo Lestari dengan sistem cashback
        bulanan.
      </Text>

      <Text style={[styles.text, { marginTop: 16 }]}>Dibuat oleh:</Text>
      <Text style={styles.text}>Nama: [isi nama kamu]</Text>
      <Text style={styles.text}>NIM: [isi NIM kamu]</Text>
      <Text style={styles.text}>Kelas: [isi kelas kamu]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
  },
});
