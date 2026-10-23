import { View, Text } from "react-native";
import { WeatherCardProps, TingkatAQI } from "../../types/cuaca";
import { typeScale, spacing } from "../constants/styles";
import { useTheme } from "../hooks/use-theme";

const warnaPerTingkat: Record<TingkatAQI, string> = {
    BAIK: "green",
    SEDANG: "goldenrod",
    TIDAK_SEHAT: "orange",
    BERBAHAYA: "crimson",
};

export default function WeatherCard({
    kota,
    suhu,
    tingkatAQI,
    indeksAQI,
}: WeatherCardProps) {
    const warna = useTheme();
    const teksAQI =
        indeksAQI !== undefined
            ? `AQI: ${indeksAQI} (${tingkatAQI})`
            : `AQI: ${tingkatAQI}`;
    const labelAksesibilitas =
        indeksAQI !== undefined
            ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori
${tingkatAQI}`
            : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;
    return (
        <View
            accessible
            accessibilityLabel={labelAksesibilitas}
            style={{
                padding: spacing.sedang,
                borderRadius: 8,
                backgroundColor: warna.backgroundElement,
            }}
        >
            <Text
                style={{
                    fontWeight: "bold",
                    fontSize: typeScale.judul,
                    color: warna.text,
                }}
            >
                {kota}
            </Text>
            <Text style={{ fontSize: 32, color: warna.text }}>{suhu}°C</Text>
            <Text style={{ color: warnaPerTingkat[tingkatAQI], fontSize: typeScale.isi }}>
                {teksAQI}
            </Text>
        </View>
    );
}
