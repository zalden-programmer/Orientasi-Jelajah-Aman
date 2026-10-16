import { DataKualitasUdara } from "../../types/weather";
const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
// Tambah timeout 15 detik agar tidak hang
const BATAS_WAKTU_MS = 15000;
export async function ambilKualitasUdara(
    latitude: number,
    longitude: number
): Promise<DataKualitasUdara> {
    const url =
        `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Gagal memuat kualitas udara (status ${response.status}): ${text}`);
        }
        const data = await response.json();
        return {
            indeksAQI: data.current.european_aqi,
            pm25: data.current.pm2_5,
            pm10: data.current.pm10,
        };
    } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
            throw new Error("Permintaan kualitas udara melebihi batas waktu (15 detik)");
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}