// src/types/riwayat.ts
import { KotaFavorit } from "./favorit";
// Satu entri riwayat = kota yang pernah dibuka, beserta waktu akses terakhir
export interface KotaRiwayat extends KotaFavorit {
    dibukaPada: number; // epoch milidetik
}
