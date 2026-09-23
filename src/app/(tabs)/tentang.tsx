import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
    return (
        <SafeAreaView style={{ padding: spacing.besar }}>
            <Text
                accessibilityLabel="Tentang aplikasi Jelajah Aman"
                style={{ fontSize: typeScale.judul, fontWeight: "bold" }}>
                Tentang Jelajah Aman
            </Text>
            <Text style={{ fontSize: typeScale.isi }}>Versi v1.0</Text>
            <Text style={{ fontSize: typeScale.isi }}>Pembuat: Meiffio</Text>
        </SafeAreaView>
    );
}