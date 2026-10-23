// src/types/riwayat.ts
import { KotaFavorit } from "./favorit";
// Riwayat hanya mencatat kota yang dipilih dari hasil pencarian
export type SumberRiwayat = "pencarian";
// Satu entri riwayat = kota yang pernah dicari, beserta waktu akses terakhir
export interface KotaRiwayat extends KotaFavorit {
    dibukaPada: number; // epoch milidetik
    sumber?: SumberRiwayat;
    kataKunci?: string; // teks pencarian saat kota dipilih
}
