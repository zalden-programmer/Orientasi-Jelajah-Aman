import { View, TextInput } from "react-native";

import { useTheme } from "../src/hooks/use-theme";

interface SearchBoxProps {
    nilai: string;
    onCari: (teks: string) => void;
}

export default function SearchBox({ nilai, onCari }: SearchBoxProps) {
    const warna = useTheme();

    return (
        <View>
            <TextInput
                placeholder="Cari nama kota..."
                placeholderTextColor={warna.textSecondary}
                value={nilai}
                onChangeText={onCari}
                accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
                style={{
                    borderWidth: 1,
                    padding: 8,
                    borderRadius: 8,
                    borderColor: warna.border,
                    backgroundColor: warna.inputBackground,
                    color: warna.text,
                }}
            />
        </View>
    );
}
