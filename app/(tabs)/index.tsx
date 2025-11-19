// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

export default function MembersScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function fetchMembers() {
    try {
      setLoading(true);
      console.log("Fetch members dari", `${BASE_URL}/api/members`);
      const response = await fetch(`${BASE_URL}/api/members`);
      console.log("Status fetch members", response.status);
      const json = await response.json();
      console.log("Data members", json);
      setMembers(json);
    } catch (error) {
      console.error("Error fetch members", error);
      Alert.alert("Error", "Gagal mengambil data member");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember() {
    if (!name.trim()) {
      Alert.alert("Validasi", "Nama wajib diisi");
      return;
    }

    try {
      setLoading(true);
      console.log("POST member ke", `${BASE_URL}/api/members`);
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
      console.log("Response POST member", response.status, body);

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
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const renderItem = ({ item }: { item: Member }) => (
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
      {item.phone ? <Text style={styles.memberPhone}>{item.phone}</Text> : null}
    </TouchableOpacity>
  );

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
          <Text style={styles.buttonText}>Simpan</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="small" />}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text>Belum ada member.</Text> : null}
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
});
