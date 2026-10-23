/**
 * Warna tema aktif. Nilainya mengikuti pilihan pengguna di Pengaturan
 * (Terang, Gelap, atau Ikuti Sistem).
 */

import { useThemePreference } from "@/providers/tema-provider";

export function useTheme() {
  return useThemePreference().warna;
}
