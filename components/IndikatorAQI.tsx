// components/IndikatorAQI.tsx
import { View, Text } from "react-native";
import { LaporanUdara } from "../types/cuaca";
interface IndikatorAQIProps {
    data: LaporanUdara;
}
const warnaTingkat = {
    BAIK: "green",
    SEDANG: "#D4A017",
    TIDAK_SEHAT: "orange",
    BERBAHAYA: "red",
} as const;
export default function IndikatorAQI({ data }: IndikatorAQIProps) {
    return (
        <View style={{ padding: 16, borderRadius: 8, backgroundColor: "#F4F7FA" }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{data.kota}</Text>
            <Text style={{ fontSize: 32 }}>{data.indeksAQI}</Text>
            <Text style={{ color: warnaTingkat[data.tingkat] }}>Kualitas udara: {data.tingkat}</Text>
            {data.diperbaruiPada && <Text>Diperbarui: {data.diperbaruiPada}</Text>}
        </View>
    );
}