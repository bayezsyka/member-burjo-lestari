// app/member/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  membership_active_until?: string | null;
};

type MemberSummary = {
  member: Member;
  membership_status: "active" | "inactive";
  membership_active_until: string | null;
  saldo_cashback_aktif: number;
  saldo_cashback_bulan_ini: number;
};

export default function MemberDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const memberId = params.id;
  const memberNameFromList = params.name;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState<MemberSummary | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [paidAt, setPaidAt] = useState("");

  const fetchSummary = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!memberId) return;

      try {
        if (options?.silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const response = await fetch(
          `${BASE_URL}/api/members/${memberId}/summary`
        );
        const body = await response.json();

        if (!response.ok) {
          console.log("Error fetch summary", body);
          Alert.alert("Error", body.message || "Gagal mengambil data member");
          return;
        }

        setSummary(body);
        setEditName(body.member.name || "");
        setEditPhone(body.member.phone || "");
      } catch (error) {
        console.error("Error fetch summary", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengambil data member");
      } finally {
        if (options?.silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [memberId]
  );

  async function handlePayMembership() {
    if (!memberId) return;

    const trimmedDate = paidAt.trim();
    if (trimmedDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      Alert.alert("Validasi", "Format tanggal harus YYYY-MM-DD");
      return;
    }

    try {
      setPaying(true);
      const response = await fetch(
        `${BASE_URL}/api/members/${memberId}/pay-membership`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            trimmedDate ? { paid_at: trimmedDate } : {}
          ),
        }
      );

      const body = await response.json();

      if (!response.ok) {
        console.log("Error pay membership", body);
        Alert.alert("Error", body.message || "Gagal membayar membership");
        return;
      }

      Alert.alert("Sukses", "Pembayaran membership berhasil");
      setPaidAt("");
      fetchSummary();
    } catch (error) {
      console.error("Error pay membership", error);
      Alert.alert("Error", "Terjadi kesalahan saat membayar membership");
    } finally {
      setPaying(false);
    }
  }

  async function handleSaveEdit() {
    if (!memberId) return;

    if (!editName.trim()) {
      Alert.alert("Validasi", "Nama wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${BASE_URL}/api/members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        console.log("Error update member", body);
        Alert.alert("Error", body.message || "Gagal mengupdate member");
        return;
      }

      Alert.alert("Sukses", "Data member berhasil diupdate");

      // update summary di frontend
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              member: {
                ...prev.member,
                name: body.name,
                phone: body.phone,
              },
            }
          : prev
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error update member", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengupdate member");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMember() {
    if (!memberId) return;

    Alert.alert(
      "Konfirmasi",
      "Yakin ingin menghapus member ini? Semua data terkait akan ikut terhapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              const response = await fetch(
                `${BASE_URL}/api/members/${memberId}`,
                {
                  method: "DELETE",
                }
              );

              let body = null;
              try {
                body = await response.json();
              } catch {
                body = null;
              }

              if (!response.ok) {
                console.log("Error delete member", body);
                Alert.alert(
                  "Error",
                  (body && body.message) || "Gagal menghapus member"
                );
                return;
              }

              Alert.alert("Sukses", "Member berhasil dihapus");
              router.back();
            } catch (error) {
              console.error("Error delete member", error);
              Alert.alert("Error", "Terjadi kesalahan saat menghapus member");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const statusText =
    summary?.membership_status === "active" ? "Aktif" : "Tidak aktif";

  const statusColor =
    summary?.membership_status === "active" ? "#16a34a" : "#dc2626";

  const namaTampil =
    summary?.member.name || memberNameFromList || "Detail Member";

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchSummary({ silent: true })}
        />
      }
    >
      <Text style={styles.title}>{namaTampil}</Text>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}

      {!loading && summary && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Data Member</Text>

            {isEditing ? (
              <>
                <Text style={styles.label}>Nama</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nama"
                />

                <Text style={styles.label}>No HP</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="No HP"
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Nama</Text>
                <Text style={styles.value}>{summary.member.name}</Text>

                {summary.member.phone ? (
                  <>
                    <Text style={styles.label}>No HP</Text>
                    <Text style={styles.value}>{summary.member.phone}</Text>
                  </>
                ) : null}
              </>
            )}

            <Text style={styles.label}>Status Membership</Text>
            <Text style={[styles.value, { color: statusColor }]}>
              {statusText}
            </Text>

            <Text style={styles.label}>Membership aktif sampai</Text>
            <Text style={styles.value}>
              {summary.membership_active_until || "-"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informasi Cashback</Text>

            <Text style={styles.label}>Saldo cashback aktif</Text>
            <Text style={styles.value}>
              Rp {summary.saldo_cashback_aktif.toLocaleString("id-ID")}
            </Text>

            <Text style={styles.label}>
              Cashback terkumpul bulan ini (aktif bulan depan)
            </Text>
            <Text style={styles.value}>
              Rp {summary.saldo_cashback_bulan_ini.toLocaleString("id-ID")}
            </Text>
          </View>
        </>
      )}

      {!loading && !summary && <Text>Data member tidak ditemukan.</Text>}

      <View style={styles.buttonColumn}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2563eb" }]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#6b7280" }]}
              onPress={() => {
                setIsEditing(false);
                if (summary) {
                  setEditName(summary.member.name || "");
                  setEditPhone(summary.member.phone || "");
                }
              }}
            >
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#0ea5e9" }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Member</Text>
          </TouchableOpacity>
        )}

        <View style={styles.paymentBox}>
          <Text style={styles.label}>Tanggal bayar (opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={paidAt}
            onChangeText={setPaidAt}
          />
          <Text style={styles.helperText}>
            Kosongkan untuk memakai tanggal hari ini. Kamu juga bisa mengisi
            tanggal mundur bila pembayaran dilakukan sebelumnya.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#22c55e" }]}
          onPress={handlePayMembership}
          disabled={paying}
        >
          <Text style={styles.buttonText}>
            {paying ? "Memproses..." : "Bayar Membership Rp 35.000"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ef4444" }]}
          onPress={handleDeleteMember}
          disabled={deleting}
        >
          <Text style={styles.buttonText}>
            {deleting ? "Menghapus..." : "Hapus Member"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#6b7280" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  buttonColumn: {
    marginTop: 8,
    gap: 8,
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
  paymentBox: {
    gap: 4,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: "#4b5563",
  },
});
