// app/(tabs)/transactions.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "../../constants/api";

type Member = {
  id: string;
  name: string;
  phone?: string | null;
};

type Transaction = {
  id: string;
  member_id: string;
  transaction_date: string;
  total_amount: number;
  cashback_earned?: number | null;
  cashback_used?: number | null;
  cashback_usable_from?: string | null;
};

export default function TransactionsScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [totalAmount, setTotalAmount] = useState("");
  const [useCashback, setUseCashback] = useState("");

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [saving, setSaving] = useState(false);

  function getMemberNameById(id: string) {
    const m = members.find((mem) => mem.id === id);
    return m ? m.name : "Tidak diketahui";
  }

  async function fetchMembers() {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${BASE_URL}/api/members`);
      const body = await res.json();
      if (!res.ok) {
        console.log("Error fetch members", body);
        Alert.alert("Error", body.message || "Gagal mengambil member");
        return;
      }
      setMembers(body);
      if (!selectedMemberId && body.length > 0) {
        setSelectedMemberId(body[0].id);
      }
    } catch (error) {
      console.error("Error fetch members", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil member");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function fetchTransactions() {
    try {
      setLoadingTx(true);
      let url = `${BASE_URL}/api/transactions`;
      if (selectedMemberId) {
        url += `?member_id=${selectedMemberId}`;
      }

      const res = await fetch(url);
      const body = await res.json();

      if (!res.ok) {
        console.log("Error fetch transactions", body);
        Alert.alert("Error", body.message || "Gagal mengambil transaksi");
        return;
      }

      setTransactions(body);
    } catch (error) {
      console.error("Error fetch transactions", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil transaksi");
    } finally {
      setLoadingTx(false);
    }
  }

  async function handleCreateTransaction() {
    if (!selectedMemberId) {
      Alert.alert("Validasi", "Pilih member terlebih dahulu");
      return;
    }

    if (!totalAmount.trim()) {
      Alert.alert("Validasi", "Total belanja wajib diisi");
      return;
    }

    const total = Number(totalAmount);
    if (Number.isNaN(total) || total <= 0) {
      Alert.alert("Validasi", "Total belanja tidak valid");
      return;
    }

    let useCb = 0;
    if (useCashback.trim()) {
      const parsed = Number(useCashback);
      if (Number.isNaN(parsed) || parsed < 0) {
        Alert.alert("Validasi", "Jumlah cashback yang digunakan tidak valid");
        return;
      }
      useCb = parsed;
    }

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: selectedMemberId,
          total_amount: total,
          use_cashback: useCb,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        console.log("Error create transaction", body);
        Alert.alert("Error", body.message || "Gagal menyimpan transaksi");
        return;
      }

      const info = body.info_cashback;
      let pesan = "Transaksi berhasil dicatat.";
      if (info) {
        pesan += `\n\nCashback didapat: Rp ${Number(
          info.cashback_earned || 0
        ).toLocaleString("id-ID")}`;
        pesan += `\nCashback dipakai: Rp ${Number(
          info.cashback_used || 0
        ).toLocaleString("id-ID")}`;
      }

      Alert.alert("Sukses", pesan);

      setTotalAmount("");
      setUseCashback("");
      fetchTransactions();
    } catch (error) {
      console.error("Error create transaction", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMemberId]);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.txItem}
      onPress={() =>
        router.push({
          pathname: "/transaction/[id]",
          params: {
            id: item.id,
            member_name: getMemberNameById(item.member_id),
            transaction_date: item.transaction_date,
            total_amount: String(item.total_amount),
            cashback_earned: String(item.cashback_earned || 0),
            cashback_used: String(item.cashback_used || 0),
            cashback_usable_from: item.cashback_usable_from || "",
          },
        })
      }
    >
      <Text style={styles.txMember}>{getMemberNameById(item.member_id)}</Text>
      <Text style={styles.txDate}>{item.transaction_date}</Text>
      <Text style={styles.txAmount}>
        Total: Rp {Number(item.total_amount).toLocaleString("id-ID")}
      </Text>
      <Text style={styles.txCashback}>
        Cashback: Rp {Number(item.cashback_earned || 0).toLocaleString("id-ID")}{" "}
        | Dipakai: Rp {Number(item.cashback_used || 0).toLocaleString("id-ID")}
      </Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      <Text style={styles.title}>Transaksi</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Input Transaksi</Text>

        <Text style={styles.label}>Pilih Member</Text>
        {loadingMembers ? (
          <ActivityIndicator size="small" />
        ) : (
          <View style={styles.memberSelectContainer}>
            {members.length === 0 ? (
              <Text style={styles.helperText}>
                Belum ada member, silakan tambah member dulu di tab Member.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {members.map((m) => {
                  const selected = m.id === selectedMemberId;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.memberChip,
                        selected && styles.memberChipSelected,
                      ]}
                      onPress={() => setSelectedMemberId(m.id)}
                    >
                      <Text
                        style={[
                          styles.memberChipText,
                          selected && styles.memberChipTextSelected,
                        ]}
                      >
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        <Text style={styles.label}>Total belanja (Rp)</Text>
        <TextInput
          style={styles.input}
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="contoh: 45000"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gunakan cashback (optional, Rp)</Text>
        <TextInput
          style={styles.input}
          value={useCashback}
          onChangeText={setUseCashback}
          placeholder="contoh: 3000"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2563eb" }]}
          onPress={handleCreateTransaction}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
      {loadingTx && (
        <ActivityIndicator size="small" style={{ marginBottom: 8 }} />
      )}
      {transactions.length === 0 && !loadingTx && (
        <Text style={styles.helperText}>Belum ada transaksi.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: "#ffffff",
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  memberSelectContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  memberChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
    marginTop: 4,
  },
  memberChipSelected: {
    backgroundColor: "#2563eb",
  },
  memberChipText: {
    fontSize: 14,
    color: "#111827",
  },
  memberChipTextSelected: {
    color: "#ffffff",
  },
  helperText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  txItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  txMember: {
    fontSize: 16,
    fontWeight: "600",
  },
  txDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  txCashback: {
    fontSize: 13,
    color: "#6b7280",
  },
});
