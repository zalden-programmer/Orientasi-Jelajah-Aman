// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../../types/favorit";
import { KotaRiwayat } from "../../types/riwayat";

const KUNCI_PENYIMPANAN = "@jelajah_aman:riwayat";
export const BATAS_RIWAYAT = 10;

// Koordinat dibulatkan 3 desimal (~110 m) supaya kota yang sama tidak dobel
// walaupun koordinat dari GPS/geocoding bergeser sedikit.
function kunciLokasi(kota: KotaFavorit): string {
    return `${kota.latitude.toFixed(3)},${kota.longitude.toFixed(3)}`;
}

function samaLokasi(a: KotaFavorit, b: KotaFavorit): boolean {
    if (a.id >= 0 && b.id >= 0 && a.id === b.id) return true;
    return kunciLokasi(a) === kunciLokasi(b);
}

export async function ambilRiwayat(): Promise<KotaRiwayat[]> {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    if (!json) return [];
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data)) return [];
        // Hanya tampilkan entri yang berasal dari pencarian. Data lama
        // (dari daftar tersimpan/lokasi) otomatis tidak ikut tampil.
        return (data as KotaRiwayat[])
            .filter((k) => k?.sumber === "pencarian")
            .slice(0, BATAS_RIWAYAT);
    } catch {
        return [];
    }
}

export async function catatRiwayat(
    kota: KotaFavorit,
    kataKunci?: string
): Promise<void> {
    const daftar = await ambilRiwayat();
    const kueri = kataKunci?.trim();
    const entriBaru: KotaRiwayat = {
        ...kota,
        dibukaPada: Date.now(),
        sumber: "pencarian",
        ...(kueri ? { kataKunci: kueri } : {}),
    };
    const tanpaDuplikat = daftar.filter((k) => !samaLokasi(k, kota));
    const daftarBaru = [entriBaru, ...tanpaDuplikat].slice(0, BATAS_RIWAYAT);
    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}

export async function hapusRiwayat(dibukaPada: number): Promise<void> {
    const daftar = await ambilRiwayat();
    const daftarBaru = daftar.filter((k) => k.dibukaPada !== dibukaPada);
    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}

export async function hapusSemuaRiwayat(): Promise<void> {
    await AsyncStorage.removeItem(KUNCI_PENYIMPANAN);
}
