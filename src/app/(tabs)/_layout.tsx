import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

const WARNA_IKON_AKTIF = "#208AEF"; // biru, senada dengan warna splash aplikasi
const WARNA_IKON_NONAKTIF = "#000000";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type TabIconProps = {
    focused: boolean;
    color: ColorValue;
    size: number;
};

function tabIcon(aktif: IoniconName, nonaktif: IoniconName) {
    function TabIcon({ focused, color, size }: TabIconProps) {
        return <Ionicons name={focused ? aktif : nonaktif} size={size} color={color} />;
    }
    return TabIcon;
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: WARNA_IKON_AKTIF,
                tabBarInactiveTintColor: WARNA_IKON_NONAKTIF,
                tabBarLabelStyle: { fontSize: 11 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Beranda",
                    tabBarAccessibilityLabel: "Beranda",
                    tabBarIcon: tabIcon("home", "home-outline"),
                }}
            />
            <Tabs.Screen
                name="riwayat"
                options={{
                    title: "Favorit",
                    tabBarAccessibilityLabel: "Kota Favorit",
                    tabBarIcon: tabIcon("heart", "heart-outline"),
                }}
            />
            <Tabs.Screen
                name="pengaturan"
                options={{
                    title: "Pengaturan",
                    tabBarAccessibilityLabel: "Pengaturan",
                    tabBarIcon: tabIcon("settings", "settings-outline"),
                }}
            />
            <Tabs.Screen
                name="tentang"
                options={{
                    title: "Tentang",
                    tabBarAccessibilityLabel: "Tentang",
                    tabBarIcon: tabIcon("information-circle", "information-circle-outline"),
                }}
            />
        </Tabs>
    );
}
