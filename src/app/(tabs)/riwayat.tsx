import { useState, useCallback } from "react";
import { View, Text, Button } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../../types/favorit";
import ConfirmModal from "../../../components/ConfirmModal";
export default function TabRiwayat() {
    const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
    const [hapusTarget, setHapusTarget] = useState<{ id: number; nama: string } | null>(null);
    useFocusEffect(
        useCallback(() => {
            ambilSemuaFavorit().then(setDaftarFavorit);
        }, [])
    );
    function bukaKonfirmasi(id: number, nama: string) {
        setHapusTarget({ id, nama });
    }
    async function konirmasiHapus() {
        if (!hapusTarget) return;
        await hapusFavorit(hapusTarget.id);
        setDaftarFavorit((prev) => prev.filter((k) => k.id !== hapusTarget.id));
        setHapusTarget(null);
    }
    function batalHapus() {
        setHapusTarget(null);
    }
    return (
        <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
            <Text>Tersimpan {daftarFavorit.length} kota</Text>
            {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}
            {daftarFavorit.map((kota) => (
                <View
                    key={kota.id}
                    style={{
                        flexDirection: "row", justifyContent: "space-between", alignItems: "center"
                    }}
                >
                    <Text>{kota.nama}</Text>
                    <Button title="Hapus" onPress={() => bukaKonfirmasi(kota.id, kota.nama)} />
                </View>
            ))}
            <ConfirmModal
                visible={!!hapusTarget}
                title="Hapus Favorit"
                message={`Yakin hapus ${hapusTarget?.nama}?`}
                onConfirm={konirmasiHapus}
                onCancel={batalHapus}
                confirmText="Hapus"
                cancelText="Batal"
            />
        </SafeAreaView>
    );
}