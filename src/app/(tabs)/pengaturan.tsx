// src/app/(tabs)/pengaturan.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type WarnaTema } from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";
import {
    type PreferensiTema,
    useThemePreference,
} from "../../providers/tema-provider";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasiHapus } from "../../utils/konfirmasiHapus";

const PILIHAN_TEMA: {
    nilai: PreferensiTema;
    judul: string;
    keterangan: string;
    ikon: "sunny-outline" | "moon-outline" | "contrast-outline";
}[] = [
    {
        nilai: "light",
        judul: "Terang",
        keterangan: "Selalu gunakan tampilan cerah.",
        ikon: "sunny-outline",
    },
    {
        nilai: "dark",
        judul: "Gelap",
        keterangan: "Selalu gunakan tampilan gelap.",
        ikon: "moon-outline",
    },
    {
        nilai: "system",
        judul: "Ikuti Sistem",
        keterangan: "Menyesuaikan pengaturan tema perangkat.",
        ikon: "contrast-outline",
    },
];

export default function TabPengaturan() {
    const warna = useTheme();
    const { preferensi, aturPreferensi } = useThemePreference();
    const [pesan, setPesan] = useState<string | null>(null);
    const styles = useMemo(() => buatGaya(warna), [warna]);

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
        <SafeAreaView style={styles.layar}>
            <ScrollView contentContainerStyle={styles.isi}>
                <View style={styles.bagian}>
                    <Text style={styles.judul}>Mode Tampilan</Text>
                    <Text style={styles.keterangan}>
                        Pilih warna antarmuka yang paling nyaman untuk Anda.
                    </Text>

                    <View style={styles.pilihanGrup} accessibilityRole="radiogroup">
                        {PILIHAN_TEMA.map((pilihan) => {
                            const aktif = preferensi === pilihan.nilai;

                            return (
                                <Pressable
                                    key={pilihan.nilai}
                                    onPress={() => aturPreferensi(pilihan.nilai)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: aktif }}
                                    aria-checked={aktif}
                                    accessibilityLabel={`Mode ${pilihan.judul}`}
                                    style={({ pressed }) => [
                                        styles.pilihan,
                                        aktif && styles.pilihanAktif,
                                        pressed && styles.pilihanDitekan,
                                    ]}
                                >
                                    <Ionicons
                                        name={pilihan.ikon}
                                        size={22}
                                        color={aktif ? warna.primary : warna.textSecondary}
                                    />
                                    <View style={styles.isiPilihan}>
                                        <Text style={styles.judulPilihan}>
                                            {pilihan.judul}
                                        </Text>
                                        <Text style={styles.keteranganPilihan}>
                                            {pilihan.keterangan}
                                        </Text>
                                    </View>
                                    {aktif && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={22}
                                            color={warna.primary}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.bagian}>
                    <Text style={styles.judul}>Penyimpanan</Text>
                    <Text style={styles.keterangan}>
                        Data cuaca tersimpan bisa dibuka kembali tanpa internet.
                    </Text>
                    <Button
                        title="Hapus Semua Cache Cuaca"
                        color={warna.danger}
                        onPress={hapusDataTersimpan}
                    />
                    <Text style={styles.keterangan}>
                        Menghapus cache tidak menghapus riwayat pencarian atau favorit.
                    </Text>
                    {pesan && (
                        <Text
                            style={styles.pesan}
                            accessibilityLabel={pesan}
                        >
                            {pesan}
                        </Text>
                    )}
                </View>

                <View style={styles.bagian}>
                    <Text style={styles.judul}>Jelajah Aman</Text>
                    <Text style={styles.keterangan}>Versi 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function buatGaya(warna: WarnaTema) {
    return StyleSheet.create({
        layar: {
            flex: 1,
            backgroundColor: warna.background,
        },
        isi: {
            padding: 16,
            gap: 24,
        },
        bagian: {
            gap: 10,
        },
        judul: {
            fontSize: 18,
            fontWeight: "bold",
            color: warna.text,
        },
        keterangan: {
            fontSize: 12,
            color: warna.textSecondary,
        },
        pilihanGrup: {
            gap: 8,
            marginTop: 2,
        },
        pilihan: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: warna.border,
            backgroundColor: warna.backgroundElement,
        },
        pilihanAktif: {
            borderColor: warna.primary,
            backgroundColor: warna.backgroundSelected,
        },
        pilihanDitekan: {
            opacity: 0.8,
        },
        isiPilihan: {
            flex: 1,
            gap: 2,
        },
        judulPilihan: {
            fontSize: 15,
            fontWeight: "600",
            color: warna.text,
        },
        keteranganPilihan: {
            fontSize: 12,
            color: warna.textSecondary,
        },
        pesan: {
            fontSize: 13,
            color: warna.success,
        },
    });
}
