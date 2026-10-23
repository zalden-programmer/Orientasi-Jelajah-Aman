import { View, Text, Button } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
    const warna = useTheme();
    const { id, nama, lat, lon } = useLocalSearchParams<{
        id: string;
        nama: string;
        lat: string;
        lon: string;
    }>();
    async function simpan() {
        await tambahFavorit({
            id: Number(id),
            nama,
            latitude: Number(lat),
            longitude: Number(lon),
        });
        router.back();
    }
    return (
        <View
            style={{
                padding: 16,
                gap: 16,
                flex: 1,
                backgroundColor: warna.background,
            }}
        >
            <Text style={{ color: warna.text }}>
                Tambahkan {nama} ke daftar favorit?
            </Text>
            <Button title="Simpan" color={warna.primary} onPress={simpan} />
        </View>
    );
}
