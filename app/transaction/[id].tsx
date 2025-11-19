// app/transaction/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    member_name?: string;
    transaction_date?: string;
    total_amount?: string;
    cashback_earned?: string;
    cashback_used?: string;
    cashback_usable_from?: string;
  }>();

  const memberName = params.member_name || "Tidak diketahui";
  const date = params.transaction_date || "-";
  const totalAmount = Number(params.total_amount || "0");
  const cashbackEarned = Number(params.cashback_earned || "0");
  const cashbackUsed = Number(params.cashback_used || "0");
  const usableFrom = params.cashback_usable_from || "";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detail Transaksi</Text>

      <View style={styles.card}>
        <Text style={styles.label}>ID Transaksi</Text>
        <Text style={styles.value}>{params.id}</Text>

        <Text style={styles.label}>Member</Text>
        <Text style={styles.value}>{memberName}</Text>

        <Text style={styles.label}>Tanggal Transaksi</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Total Belanja</Text>
        <Text style={styles.value}>
          Rp {totalAmount.toLocaleString("id-ID")}
        </Text>

        <Text style={styles.label}>Cashback Didapat</Text>
        <Text style={styles.value}>
          Rp {cashbackEarned.toLocaleString("id-ID")}
        </Text>

        <Text style={styles.label}>Cashback Dipakai</Text>
        <Text style={styles.value}>
          Rp {cashbackUsed.toLocaleString("id-ID")}
        </Text>

        <Text style={styles.label}>Cashback ini dapat dipakai mulai</Text>
        <Text style={styles.value}>{usableFrom || "-"}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#6b7280" }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
