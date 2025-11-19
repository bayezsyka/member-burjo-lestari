// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
  created_at?: string;
};

export default function MembersScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchMembers = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent;
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setFetching(true);
      }
      const response = await fetch(`${BASE_URL}/api/members`);
      const json = await response.json();
      setMembers(json);
    } catch (error) {
      console.error("Error fetch members", error);
      Alert.alert("Error", "Gagal mengambil data member");
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setFetching(false);
      }
    }
  }, []);

  async function handleAddMember() {
    if (!name.trim()) {
      Alert.alert("Validasi", "Nama wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        Alert.alert("Error", body.message || "Gagal menambah member");
        return;
      }

      const newMember: Member = body;
      setMembers((prev) => [newMember, ...prev]);
      setName("");
      setPhone("");
      Alert.alert("Sukses", "Member berhasil ditambahkan");
    } catch (error) {
      console.error("Error add member", error);
      Alert.alert("Error", "Terjadi kesalahan saat menambah member");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const getMembershipStatus = (until?: string | null) => {
    if (!until) return { text: "Belum aktif", color: "#6b7280" };
    const untilDate = new Date(`${until}T00:00:00`);
    const todayDate = new Date(`${today}T00:00:00`);
    if (untilDate >= todayDate) {
      return { text: `Aktif s/d ${until}`, color: "#16a34a" };
    }
    return { text: `Kedaluwarsa ${until}`, color: "#dc2626" };
  };

  const renderItem = ({ item }: { item: Member }) => {
    const membershipInfo = getMembershipStatus(item.membership_active_until);
    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() =>
          router.push({
            pathname: "/member/[id]",
            params: { id: item.id, name: item.name },
          })
        }
      >
        <Text style={styles.memberName}>{item.name}</Text>
        {item.phone ? (
          <Text style={styles.memberPhone}>{item.phone}</Text>
        ) : null}
        <Text style={[styles.memberStatus, { color: membershipInfo.color }]}>
          {membershipInfo.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Member</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Tambah Member</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="No HP"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.button} onPress={handleAddMember}>
          <Text style={styles.buttonText}>
            {submitting ? "Menyimpan..." : "Simpan"}
          </Text>
        </TouchableOpacity>
      </View>

      {fetching && members.length === 0 && (
        <ActivityIndicator size="small" style={{ marginBottom: 12 }} />
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMembers({ silent: true })}
          />
        }
        ListEmptyComponent={!fetching ? (
          <Text style={styles.emptyText}>
            Belum ada member. Tambahkan satu untuk mulai memakai aplikasi.
          </Text>
        ) : null}
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
  form: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    paddingVertical: 8,
  },
  memberItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
  memberStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 32,
  },
});
