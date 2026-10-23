import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { useThemePreference } from "@/providers/tema-provider";

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
    const { warna } = useThemePreference();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: warna.background },
                headerTintColor: warna.text,
                headerShadowVisible: false,
                tabBarActiveTintColor: warna.primary,
                tabBarInactiveTintColor: warna.textSecondary,
                tabBarStyle: {
                    backgroundColor: warna.background,
                    borderTopColor: warna.border,
                },
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
                    title: "Favorit & Riwayat",
                    tabBarLabel: "Favorit",
                    tabBarAccessibilityLabel: "Favorit dan Riwayat",
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
