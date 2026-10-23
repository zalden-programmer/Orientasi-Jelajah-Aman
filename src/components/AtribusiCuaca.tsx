import { Text, TouchableOpacity, Linking } from "react-native";

import { useTheme } from "../hooks/use-theme";

export default function AtribusiCuaca() {
    const warna = useTheme();

    return (
        <TouchableOpacity onPress={() => Linking.openURL("https://open-meteo.com/")}>
            <Text
                style={{
                    fontSize: 11,
                    color: warna.textSecondary,
                    textAlign: "center",
                }}
            >
                Data cuaca disediakan oleh Open-Meteo.com
            </Text>
        </TouchableOpacity>
    );
}
