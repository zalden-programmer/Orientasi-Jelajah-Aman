import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useThemePreference } from "@/providers/tema-provider";

function NavigasiUtama() {
  const { skema, warna } = useThemePreference();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: warna.background },
          headerStyle: { backgroundColor: warna.background },
          headerTintColor: warna.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
        <Stack.Screen
          name="tambah-favorit"
          options={{ presentation: "modal", title: "Tambah Favorit" }}
        />
      </Stack>
      <StatusBar style={skema === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigasiUtama />
    </ThemeProvider>
  );
}
