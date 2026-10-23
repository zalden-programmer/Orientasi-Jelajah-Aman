import { useState, useCallback } from "react";
import { View, Text, Button, Pressable, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
    ambilRiwayat,
    hapusRiwayat,
    hapusSemuaRiwayat,
} from "../../services/riwayatStorage";
import { hapusCache } from "../../services/cacheRepository";
import { konfirmasiHapus } from "../../utils/konfirmasiHapus";
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
    const [pesanCache, setPesanCache] = useState<string | null>(null);

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

    function bukaKota(kota: KotaRiwayat) {
        router.navigate({
            pathname: "/",
            params: {
                id: String(kota.id),
                nama: kota.nama,
                lat: String(kota.latitude),
                lon: String(kota.longitude),
                ts: String(kota.dibukaPada),
            },
        });
    }

    function hapusCacheKota(kota: KotaRiwayat) {
        setPesanCache(null);
        konfirmasiHapus(
            "Hapus Cache",
            `Hapus data cuaca tersimpan untuk ${kota.nama}? Riwayat pencarian tetap disimpan.`,
            async () => {
                try {
                    const terhapus = await hapusCache(kota.latitude, kota.longitude);
                    setPesanCache(
                        terhapus
                            ? `Cache ${kota.nama} dihapus.`
                            : `Cache ${kota.nama} sudah tidak ada.`
                    );
                } catch {
                    setPesanCache(`Gagal menghapus cache ${kota.nama}.`);
                }
            }
        );
    }

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
                        <Text style={styles.judulSeksi}>Pencarian Terakhir</Text>
                        <Text style={styles.keterangan}>
                            {daftarRiwayat.length} pencarian terakhir
                        </Text>
                        {pesanCache && (
                            <Text style={styles.pesan} accessibilityLabel={pesanCache}>
                                {pesanCache}
                            </Text>
                        )}
                        {daftarRiwayat.length === 0 && (
                            <Text style={styles.kosong}>
                                Belum ada riwayat pencarian. Cari kota di Beranda lalu pilih
                                salah satu hasilnya.
                            </Text>
                        )}
                        {daftarRiwayat.map((kota) => (
                            <View key={kota.dibukaPada} style={styles.baris}>
                                <Pressable
                                    onPress={() => bukaKota(kota)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Buka ${kota.nama} di Beranda`}
                                    style={({ pressed }) => [
                                        styles.infoKota,
                                        pressed && styles.infoKotaDitekan,
                                    ]}
                                >
                                    <View style={styles.isiInfo}>
                                        <Text style={styles.namaKota}>{kota.nama}</Text>
                                        <Text style={styles.keterangan}>
                                            {kota.kataKunci
                                                ? `Dicari "${kota.kataKunci}" \u2022 `
                                                : ""}
                                            {formatWaktu(kota.dibukaPada)}
                                        </Text>
                                        <Text style={styles.hint}>
                                            Ketuk untuk membuka lagi
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color="#60646C"
                                    />
                                </Pressable>
                                <View style={styles.aksiBaris}>
                                    <Button
                                        title="Hapus Cache"
                                        color="#c0392b"
                                        onPress={() => hapusCacheKota(kota)}
                                    />
                                    <Button
                                        title="Hapus Riwayat"
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
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    infoKotaDitekan: {
        backgroundColor: "#F0F0F3",
    },
    isiInfo: {
        flex: 1,
        gap: 2,
    },
    hint: {
        fontSize: 12,
        color: "#208AEF",
    },
    aksiBaris: {
        gap: 6,
    },
    pesan: {
        fontSize: 13,
        color: "#1e7d32",
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
