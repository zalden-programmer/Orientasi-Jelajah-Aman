import { View, TextInput } from "react-native";

interface SearchBoxProps {
    nilai: string;
    onCari: (teks: string) => void;
}

export default function SearchBox({ nilai, onCari }: SearchBoxProps) {
    return (
        <View>
            <TextInput
                placeholder="Cari nama kota..."
                value={nilai}
                onChangeText={onCari}
                accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
                style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
            />
        </View>
    );
}
