// app/index.tsx
import { View } from "react-native";
import { useState, useEffect } from "react";
// Catatan: gunakan ../components/ jika file berada di dalam folder app/
// yang sejajar dengan folder components/
import WeatherCard from "../../components/WeatherCard";
import IndikatorAQI from "../../components/IndikatorAQI";
import SearchBox from "../../components/SearchBox";
import RiwayatList from "../../components/RiwayatList";
export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);
  // Tambahkan useEffect untuk mencatat perubahan kota aktif
  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);
  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
      <IndikatorAQI
        data={{
          kota: kotaAktif,
          indeksAQI: 85,
          tingkat: "SEDANG",
          diperbaruiPada: "2026-09-15 08:00",
        }}
      />
      <RiwayatList daftarKota={riwayat} />
    </View>
  );
}