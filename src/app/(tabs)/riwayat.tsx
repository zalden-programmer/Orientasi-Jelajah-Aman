import { useState, useCallback } from "react";
import { View, Text, Button, Pressable, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
    ambilRiwayat,
    hapusRiwayat,
    hapusSemuaRiwayat,
} from "../../services/riwayatStorage";
import { KotaFavorit } from "../../../types/favorit";
import { KotaRiwayat } from "../../../types/riwayat";
import ConfirmModal from "../../../components/ConfirmModal";

type Seksi = "favorit" | "riwayat";

type TargetHapus =
    | { tipe: "favorit"; id: number; nama: string }
    | { tipe: "riwayat"; dibukaPada: number; nama: string }
    | { tipe: "semua-riwayat" };

function formatWaktu(ms: number): string {
    const tanggal = new Date(ms);
    try {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(tanggal);
    } catch {
        return tanggal.toLocaleString();
    }
}

export default function TabRiwayat() {
    const [seksi, setSeksi] = useState<Seksi>("favorit");
    const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
    const [daftarRiwayat, setDaftarRiwayat] = useState<KotaRiwayat[]>([]);
    const [targetHapus, setTargetHapus] = useState<TargetHapus | null>(null);

    useFocusEffect(
        useCallback(() => {
            ambilSemuaFavorit()
                .then(setDaftarFavorit)
                .catch(() => setDaftarFavorit([]));
            ambilRiwayat()
                .then(setDaftarRiwayat)
                .catch(() => setDaftarRiwayat([]));
        }, [])
    );

    async function prosesHapus() {
        if (!targetHapus) return;
        if (targetHapus.tipe === "favorit") {
            await hapusFavorit(targetHapus.id);
            setDaftarFavorit((prev) => prev.filter((k) => k.id !== targetHapus.id));
        } else if (targetHapus.tipe === "riwayat") {
            await hapusRiwayat(targetHapus.dibukaPada);
            setDaftarRiwayat((prev) =>
                prev.filter((k) => k.dibukaPada !== targetHapus.dibukaPada)
            );
        } else {
            await hapusSemuaRiwayat();
            setDaftarRiwayat([]);
        }
        setTargetHapus(null);
    }

    const judulHapus =
        targetHapus?.tipe === "semua-riwayat"
            ? "Hapus Semua Riwayat"
            : targetHapus?.tipe === "riwayat"
              ? "Hapus Riwayat"
              : "Hapus Favorit";

    const pesanHapus =
        targetHapus?.tipe === "semua-riwayat"
            ? `Hapus semua ${daftarRiwayat.length} riwayat kota?`
            : `Yakin hapus ${targetHapus?.nama ?? ""}?`;

    return (
        <SafeAreaView style={styles.layar}>
            <ScrollView contentContainerStyle={styles.isi}>
                <View style={styles.segmen} accessibilityRole="tablist">
                    <Pressable
                        onPress={() => setSeksi("favorit")}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: seksi === "favorit" }}
                        accessibilityLabel={`Favorit, ${daftarFavorit.length} kota`}
                        style={[styles.segmenItem, seksi === "favorit" && styles.segmenItemAktif]}
                    >
                        <Text
                            style={[
                                styles.segmenTeks,
                                seksi === "favorit" && styles.segmenTeksAktif,
                            ]}
                        >
                            Favorit ({daftarFavorit.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setSeksi("riwayat")}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: seksi === "riwayat" }}
                        accessibilityLabel={`Riwayat, ${daftarRiwayat.length} kota`}
                        style={[styles.segmenItem, seksi === "riwayat" && styles.segmenItemAktif]}
                    >
                        <Text
                            style={[
                                styles.segmenTeks,
                                seksi === "riwayat" && styles.segmenTeksAktif,
                            ]}
                        >
                            Riwayat ({daftarRiwayat.length})
                        </Text>
                    </Pressable>
                </View>

                {seksi === "favorit" ? (
                    <View style={styles.daftar}>
                        <Text style={styles.judulSeksi}>Kota Favorit</Text>
                        <Text style={styles.keterangan}>
                            Tersimpan {daftarFavorit.length} kota
                        </Text>
                        {daftarFavorit.length === 0 && (
                            <Text style={styles.kosong}>Belum ada kota favorit</Text>
                        )}
                        {daftarFavorit.map((kota) => (
                            <View key={kota.id} style={styles.baris}>
                                <Text style={styles.namaKota}>{kota.nama}</Text>
                                <Button
                                    title="Hapus"
                                    color="#c0392b"
                                    onPress={() =>
                                        setTargetHapus({
                                            tipe: "favorit",
                                            id: kota.id,
                                            nama: kota.nama,
                                        })
                                    }
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.daftar}>
                        <Text style={styles.judulSeksi}>Riwayat Kota Dibuka</Text>
                        <Text style={styles.keterangan}>
                            {daftarRiwayat.length} kota terakhir dilihat
                        </Text>
                        {daftarRiwayat.length === 0 && (
                            <Text style={styles.kosong}>
                                Belum ada riwayat. Cari dan buka kota di Beranda.
                            </Text>
                        )}
                        {daftarRiwayat.map((kota) => (
                            <View key={kota.dibukaPada} style={styles.baris}>
                                <View style={styles.infoKota}>
                                    <Text style={styles.namaKota}>{kota.nama}</Text>
                                    <Text style={styles.keterangan}>
                                        {formatWaktu(kota.dibukaPada)}
                                    </Text>
                                </View>
                                <Button
                                    title="Hapus"
                                    color="#c0392b"
                                    onPress={() =>
                                        setTargetHapus({
                                            tipe: "riwayat",
                                            dibukaPada: kota.dibukaPada,
                                            nama: kota.nama,
                                        })
                                    }
                                />
                            </View>
                        ))}
                        {daftarRiwayat.length > 0 && (
                            <View style={styles.aksiBawah}>
                                <Button
                                    title="Hapus Semua Riwayat"
                                    color="#c0392b"
                                    onPress={() => setTargetHapus({ tipe: "semua-riwayat" })}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <ConfirmModal
                visible={!!targetHapus}
                title={judulHapus}
                message={pesanHapus}
                onConfirm={prosesHapus}
                onCancel={() => setTargetHapus(null)}
                confirmText="Hapus"
                cancelText="Batal"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    layar: {
        flex: 1,
    },
    isi: {
        padding: 16,
        gap: 16,
    },
    segmen: {
        flexDirection: "row",
        backgroundColor: "#F0F0F3",
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    segmenItem: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    segmenItemAktif: {
        backgroundColor: "#208AEF",
    },
    segmenTeks: {
        fontSize: 14,
        fontWeight: "600",
        color: "#60646C",
    },
    segmenTeksAktif: {
        color: "#FFFFFF",
    },
    daftar: {
        gap: 12,
    },
    judulSeksi: {
        fontSize: 18,
        fontWeight: "bold",
    },
    keterangan: {
        fontSize: 12,
        color: "#60646C",
    },
    kosong: {
        fontSize: 14,
        color: "#60646C",
        fontStyle: "italic",
    },
    baris: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E0E1E6",
    },
    infoKota: {
        flexShrink: 1,
        gap: 2,
    },
    namaKota: {
        fontSize: 16,
        fontWeight: "600",
    },
    aksiBawah: {
        marginTop: 8,
        alignItems: "flex-end",
    },
});
