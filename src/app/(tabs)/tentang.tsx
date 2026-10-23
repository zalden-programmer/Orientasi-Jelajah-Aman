import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typeScale, spacing } from "../../constants/styles";
import { useTheme } from "../../hooks/use-theme";

export default function TabTentang() {
    const warna = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                padding: spacing.besar,
                gap: spacing.kecil,
                backgroundColor: warna.background,
            }}
        >
            <Text
                accessibilityLabel="Tentang aplikasi Jelajah Aman"
                style={{
                    fontSize: typeScale.judul,
                    fontWeight: "bold",
                    color: warna.text,
                }}>
                Tentang Jelajah Aman
            </Text>
            <Text style={{ fontSize: typeScale.isi, color: warna.text }}>
                Versi v1.0
            </Text>
            <Text style={{ fontSize: typeScale.isi, color: warna.textSecondary }}>
                Pembuat: Meiffio
            </Text>
        </SafeAreaView>
    );
}
