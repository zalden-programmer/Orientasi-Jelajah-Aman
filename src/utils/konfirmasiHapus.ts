import { Alert, Platform } from "react-native";

// Konfirmasi lintas platform sebelum menghapus data dari perangkat.
// Android/iOS memakai Alert bawaan, web memakai window.confirm.
export function konfirmasiHapus(
    judul: string,
    pesan: string,
    onHapus: () => void | Promise<void>
): void {
    if (Platform.OS === "web") {
        if (window.confirm(pesan)) {
            void onHapus();
        }
        return;
    }

    Alert.alert(judul, pesan, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => void onHapus() },
    ]);
}
