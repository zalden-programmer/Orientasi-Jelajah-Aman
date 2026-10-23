import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Colors, type SkemaWarna, type WarnaTema } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type PreferensiTema = "light" | "dark" | "system";

type NilaiTema = {
  preferensi: PreferensiTema;
  skema: SkemaWarna;
  warna: WarnaTema;
  aturPreferensi: (preferensi: PreferensiTema) => void;
};

const KUNCI_PREFERENSI = "@jelajah_aman:preferensi-tema";

const KonteksTema = createContext<NilaiTema | null>(null);

function preferensiValid(nilai: string | null): nilai is PreferensiTema {
  return nilai === "light" || nilai === "dark" || nilai === "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const skemaSistem = useColorScheme();
  const [preferensi, setPreferensi] = useState<PreferensiTema>("system");

  useEffect(() => {
    let masihAktif = true;

    AsyncStorage.getItem(KUNCI_PREFERENSI)
      .then((tersimpan) => {
        if (masihAktif && preferensiValid(tersimpan)) {
          setPreferensi(tersimpan);
        }
      })
      .catch(() => {
        // Jika penyimpanan gagal dibaca, gunakan preferensi sistem.
      });

    return () => {
      masihAktif = false;
    };
  }, []);

  const aturPreferensi = useCallback((baru: PreferensiTema) => {
    setPreferensi(baru);
    void AsyncStorage.setItem(KUNCI_PREFERENSI, baru).catch(() => {
      // Pilihan tetap berlaku selama aplikasi berjalan meski gagal disimpan.
    });
  }, []);

  const skema: SkemaWarna =
    preferensi === "system"
      ? skemaSistem === "dark"
        ? "dark"
        : "light"
      : preferensi;

  const nilai = useMemo<NilaiTema>(
    () => ({
      preferensi,
      skema,
      warna: Colors[skema],
      aturPreferensi,
    }),
    [aturPreferensi, preferensi, skema]
  );

  return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
}

export function useThemePreference(): NilaiTema {
  const nilai = useContext(KonteksTema);

  if (!nilai) {
    throw new Error("useThemePreference harus dipakai di dalam ThemeProvider.");
  }

  return nilai;
}
