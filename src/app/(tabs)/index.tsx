// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import SearchBox from "../../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/statusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan } from "../../services/cacheRepository";
import { catatRiwayat } from "../../services/riwayatStorage";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../../types/cache";

type SumberPilih = "pencarian" | "tersimpan" | "lokasi";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition
  // Parameter dikirim saat pengguna mengetuk entri "Pencarian Terakhir"
  const params = useLocalSearchParams<{
    id?: string;
    nama?: string;
    lat?: string;
    lon?: string;
    ts?: string;
  }>();
  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }
  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => { });
  }, []);
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);
  async function pilihKota(
    kota: HasilGeocoding,
    paksaPerbarui = false,
    sumber: SumberPilih = "pencarian",
    kataKunci?: string
  ) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      // Riwayat hanya mencatat kota yang dipilih dari hasil pencarian.
      if (sumber === "pencarian") {
        const kueri = (kataKunci ?? teksCari).trim();
        void catatRiwayat(
          {
            id: kota.id,
            nama: kota.name,
            latitude: kota.latitude,
            longitude: kota.longitude,
          },
          kueri || undefined
        ).catch(() => { });
      }
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Referensi agar effect parameter selalu memakai versi pilihKota terbaru.
  const pilihKotaRef = useRef(pilihKota);
  useEffect(() => {
    pilihKotaRef.current = pilihKota;
  });

  // Buka kota yang diklik dari daftar "Pencarian Terakhir" di tab Riwayat.
  const tsTerakhirRef = useRef<string | null>(null);
  useEffect(() => {
    const { id, nama, lat, lon, ts } = params;
    if (!nama || !lat || !lon || !ts) return;
    if (tsTerakhirRef.current === ts) return;
    const lintang = Number(lat);
    const bujur = Number(lon);
    if (!Number.isFinite(lintang) || !Number.isFinite(bujur)) return;
    tsTerakhirRef.current = ts;
    const idKota = Number(id);
    // Sengaja langsung mengisi kolom pencarian agar konteks kota terlihat.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeksCari(nama);
    void pilihKotaRef.current(
      {
        id: Number.isFinite(idKota) ? idKota : -1,
        name: nama,
        latitude: lintang,
        longitude: bujur,
        country: "",
      },
      false,
      "pencarian",
      nama
    );
  }, [params]);
  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    }, false, "lokasi");
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox nilai={teksCari} onCari={setTeksCari} />
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && <Text accessibilityLabel={pesanLokasi}>{pesanLokasi}</Text>}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text>{kota.name}</Text>
          </TouchableOpacity>
        ))}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold" }}>Tersimpan di perangkat (bisa dibuka
              offline)</Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  }, false, "tersimpan")
                }
              >
                <Text>{k.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {sedangMemuat && <ActivityIndicator />}
        {pesanError && (
          <View>
            <Text accessibilityLabel={pesanError}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: "#888888" }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}