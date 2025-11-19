// app/(tabs)/transactions.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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

type MemberSummary = {
  member: Member & {
    membership_active_until?: string | null;
  };
  membership_status: "active" | "inactive";
  membership_active_until: string | null;
  saldo_cashback_aktif: number;
  saldo_cashback_bulan_ini: number;
};

export default function TransactionsScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null);

  const [totalAmount, setTotalAmount] = useState("");
  const [useCashback, setUseCashback] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshingTx, setRefreshingTx] = useState(false);

  const [memberSummary, setMemberSummary] = useState<MemberSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  function getMemberNameById(id: string) {
    const m = members.find((mem) => mem.id === id);
    return m ? m.name : "Tidak diketahui";
  }

  const fetchMembers = useCallback(async () => {
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
      setSelectedMemberId((prev) => {
        if (prev) return prev;
        return body.length > 0 ? body[0].id : null;
      });
      if (body.length === 0) {
        setFilterMemberId(null);
      }
    } catch (error) {
      console.error("Error fetch members", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil member");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const fetchTransactions = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        if (options?.silent) {
          setRefreshingTx(true);
        } else {
          setLoadingTx(true);
        }
        let url = `${BASE_URL}/api/transactions`;
        if (filterMemberId) {
          url += `?member_id=${filterMemberId}`;
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
        if (options?.silent) {
          setRefreshingTx(false);
        } else {
          setLoadingTx(false);
        }
      }
    },
    [filterMemberId]
  );

  const fetchMemberSummary = useCallback(
    async (memberId: string, options?: { silent?: boolean }) => {
      try {
        setSummaryError(null);
        if (!options?.silent) {
          setLoadingSummary(true);
        }
        const res = await fetch(`${BASE_URL}/api/members/${memberId}/summary`);
        const body = await res.json();

        if (!res.ok) {
          console.log("Error fetch summary transaksi", body);
          setSummaryError(body.message || "Ringkasan tidak tersedia");
          setMemberSummary(null);
          return;
        }

        setMemberSummary(body);
      } catch (error) {
        console.error("Error fetch member summary", error);
        setSummaryError("Gagal memuat ringkasan cashback");
      } finally {
        if (!options?.silent) {
          setLoadingSummary(false);
        }
      }
    },
    []
  );

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

    if (useCb > total) {
      Alert.alert("Validasi", "Cashback tidak boleh lebih besar dari total belanja");
      return;
    }

    if (memberSummary && useCb > memberSummary.saldo_cashback_aktif) {
      Alert.alert(
        "Validasi",
        `Saldo cashback aktif hanya Rp ${memberSummary.saldo_cashback_aktif.toLocaleString("id-ID")}`
      );
      return;
    }

    const trimmedDate = transactionDate.trim();
    if (trimmedDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      Alert.alert("Validasi", "Format tanggal transaksi harus YYYY-MM-DD");
      return;
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
          transaction_date: trimmedDate || undefined,
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
      setTransactionDate(todayIso);
      fetchTransactions();
      if (selectedMemberId) {
        fetchMemberSummary(selectedMemberId, { silent: true });
      }
    } catch (error) {
      console.error("Error create transaction", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  }

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberSummary(selectedMemberId);
    } else {
      setMemberSummary(null);
    }
    setTransactionDate(todayIso);
  }, [selectedMemberId, todayIso, fetchMemberSummary]);

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

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status membership</Text>
            <Text
              style={{
                fontWeight: "600",
                color:
                  memberSummary?.membership_status === "active"
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >
              {memberSummary?.membership_status === "active"
                ? "Aktif"
                : "Tidak aktif"}
            </Text>
          </View>
          <Text style={styles.summaryValue}>
            Aktif sampai: {memberSummary?.membership_active_until || "-"}
          </Text>
          <Text style={styles.summaryValue}>
            Saldo cashback aktif: Rp
            {" "}
            {Number(memberSummary?.saldo_cashback_aktif || 0).toLocaleString(
              "id-ID"
            )}
          </Text>
          <Text style={styles.summaryValue}>
            Cashback bulan ini (pending): Rp
            {" "}
            {Number(
              memberSummary?.saldo_cashback_bulan_ini || 0
            ).toLocaleString("id-ID")}
          </Text>
          {summaryError ? (
            <Text style={[styles.helperText, { color: "#dc2626" }]}>
              {summaryError}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.refreshSummaryButton}
            onPress={() =>
              selectedMemberId && fetchMemberSummary(selectedMemberId)
            }
            disabled={!selectedMemberId || loadingSummary}
          >
            <Text style={styles.refreshSummaryText}>
              {loadingSummary ? "Memuat..." : "Refresh ringkasan"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Total belanja (Rp)</Text>
        <TextInput
          style={styles.input}
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="contoh: 45000"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tanggal transaksi</Text>
        <TextInput
          style={styles.input}
          value={transactionDate}
          onChangeText={setTransactionDate}
          placeholder="YYYY-MM-DD (kosongkan untuk hari ini)"
        />
        <TouchableOpacity
          style={styles.useTodayButton}
          onPress={() => setTransactionDate(todayIso)}
        >
          <Text style={styles.useTodayText}>Pakai tanggal hari ini</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Gunakan cashback (optional, Rp)</Text>
        <TextInput
          style={styles.input}
          value={useCashback}
          onChangeText={setUseCashback}
          placeholder="contoh: 3000"
          keyboardType="numeric"
          editable={Boolean(memberSummary)}
        />
        <Text style={styles.helperText}>
          Saldo aktif tersedia: Rp
          {" "}
          {Number(memberSummary?.saldo_cashback_aktif || 0).toLocaleString(
            "id-ID"
          )}
        </Text>

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
      <View style={styles.filterRow}>
        <Text style={styles.label}>Filter member</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.memberChip,
              filterMemberId === null && styles.memberChipSelected,
            ]}
            onPress={() => setFilterMemberId(null)}
          >
            <Text
              style={[
                styles.memberChipText,
                filterMemberId === null && styles.memberChipTextSelected,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          {members.map((m) => (
            <TouchableOpacity
              key={`filter-${m.id}`}
              style={[
                styles.memberChip,
                filterMemberId === m.id && styles.memberChipSelected,
              ]}
              onPress={() => setFilterMemberId(m.id)}
            >
              <Text
                style={[
                  styles.memberChipText,
                  filterMemberId === m.id && styles.memberChipTextSelected,
                ]}
              >
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshingTx}
            onRefresh={() => fetchTransactions({ silent: true })}
          />
        }
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
  useTodayButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#e0e7ff",
  },
  useTodayText: {
    color: "#312e81",
    fontSize: 13,
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
  summaryBox: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#1f2937",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1f2937",
  },
  refreshSummaryButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2563eb",
  },
  refreshSummaryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  filterRow: {
    marginTop: 12,
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
