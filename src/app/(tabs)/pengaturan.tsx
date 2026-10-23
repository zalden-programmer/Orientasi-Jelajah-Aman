// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasiHapus } from "../../utils/konfirmasiHapus";
export default function TabPengaturan() {
    const [pesan, setPesan] = useState<string | null>(null);
    function hapusDataTersimpan() {
        setPesan(null);
        konfirmasiHapus(
            "Hapus Semua Cache Cuaca",
            "Semua data cuaca tersimpan akan dihapus dari perangkat. Riwayat pencarian dan favorit tidak ikut terhapus. Kota hanya bisa dibuka lagi saat online.",
            async () => {
                try {
                    await hapusSemuaCache();
                    setPesan("Semua cache cuaca sudah dihapus.");
                } catch {
                    setPesan("Gagal menghapus cache cuaca.");
                }
            }
        );
    }
    return (
        <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Jelajah Aman</Text>
            <Text>Versi 1.0.0</Text>
            <Button title="Hapus Semua Cache Cuaca" onPress={hapusDataTersimpan} />
            <Text style={{ fontSize: 12, color: "#60646C" }}>
                Menghapus cache tidak menghapus riwayat pencarian atau favorit.
            </Text>
            {pesan && <Text accessibilityLabel={pesan}>{pesan}</Text>}
        </SafeAreaView>
    );
}