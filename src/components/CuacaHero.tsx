import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    type DimensionValue,
} from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

import { type TingkatAQI } from "../../types/cuaca";
import { type SkemaWarna } from "../constants/theme";
import { labelKodeCuaca } from "../constants/weatherCodes";
import { useThemePreference } from "../providers/tema-provider";

type JenisCuaca = "cerah" | "berawan" | "mendung" | "hujan" | "badai" | "salju";

type PaletCuaca = {
    gradient: readonly [string, string, string];
    awan: string;
    hujan: string;
    matahari: string;
    matahariGlow: string;
};

type CuacaHeroProps = {
    kota: string;
    suhu: number;
    kodeCuaca: number;
    kecepatanAngin: number;
    indeksAQI: number;
    tingkatAQI: TingkatAQI;
};

const PALET: Record<JenisCuaca, Record<SkemaWarna, PaletCuaca>> = {
    cerah: {
        light: {
            gradient: ["#3D8FD1", "#77BDEB", "#CFEFFF"],
            awan: "rgba(255,255,255,0.82)",
            hujan: "#D7E8F7",
            matahari: "#FFD166",
            matahariGlow: "rgba(255,209,102,0.38)",
        },
        dark: {
            gradient: ["#081C33", "#0E3A5E", "#15517D"],
            awan: "rgba(255,255,255,0.28)",
            hujan: "#A8D4F0",
            matahari: "#FFD98A",
            matahariGlow: "rgba(255,217,138,0.28)",
        },
    },
    berawan: {
        light: {
            gradient: ["#6C8AA6", "#9CB6CB", "#D8E7F2"],
            awan: "rgba(255,255,255,0.84)",
            hujan: "#D7E8F7",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.26)",
        },
        dark: {
            gradient: ["#101C28", "#26384A", "#3D5265"],
            awan: "rgba(220,230,240,0.28)",
            hujan: "#9FD3F0",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.18)",
        },
    },
    mendung: {
        light: {
            gradient: ["#4C6175", "#71889C", "#B3C4D1"],
            awan: "rgba(244,248,251,0.58)",
            hujan: "#D7E8F7",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.2)",
        },
        dark: {
            gradient: ["#0B1219", "#1A2733", "#2B3B49"],
            awan: "rgba(190,205,220,0.22)",
            hujan: "#9FD3F0",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.16)",
        },
    },
    hujan: {
        light: {
            gradient: ["#2F4A61", "#4C6A83", "#7B98AD"],
            awan: "rgba(215,228,238,0.46)",
            hujan: "#CFE8FA",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.18)",
        },
        dark: {
            gradient: ["#07131D", "#102535", "#1B3A50"],
            awan: "rgba(150,175,195,0.28)",
            hujan: "#9FD3F0",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.15)",
        },
    },
    badai: {
        light: {
            gradient: ["#111827", "#263449", "#3D5268"],
            awan: "rgba(148,163,184,0.34)",
            hujan: "#B6D4EA",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.16)",
        },
        dark: {
            gradient: ["#04080D", "#0B1420", "#152435"],
            awan: "rgba(120,140,160,0.26)",
            hujan: "#8FC3E3",
            matahari: "#FFE3A3",
            matahariGlow: "rgba(255,227,163,0.14)",
        },
    },
    salju: {
        light: {
            gradient: ["#7FA6C8", "#BBD6EA", "#EEF8FF"],
            awan: "rgba(255,255,255,0.9)",
            hujan: "#FFFFFF",
            matahari: "#FFF1C4",
            matahariGlow: "rgba(255,241,196,0.3)",
        },
        dark: {
            gradient: ["#0D1B2A", "#1B3247", "#31516D"],
            awan: "rgba(255,255,255,0.42)",
            hujan: "#FFFFFF",
            matahari: "#FFF1C4",
            matahariGlow: "rgba(255,241,196,0.2)",
        },
    },
};

const POSISI_HUJAN = [
    4, 10, 16, 23, 29, 35, 42, 48, 55, 61, 67, 73, 79, 85, 91, 94, 7, 20, 38, 64,
];
const POSISI_SALJU = [6, 14, 23, 32, 41, 50, 59, 68, 77, 86, 92, 47];

function jenisCuaca(kode: number): JenisCuaca {
    if (kode === 0 || kode === 1) return "cerah";
    if (kode === 2 || kode === 45 || kode === 48) return "berawan";
    if (kode === 3) return "mendung";
    if (kode === 71 || kode === 73 || kode === 75 || kode === 77) return "salju";
    if (kode === 85 || kode === 86) return "salju";
    if (kode === 95 || kode === 96 || kode === 99) return "badai";
    return "hujan";
}

function labelTingkat(tingkat: TingkatAQI): string {
    if (tingkat === "TIDAK_SEHAT") return "Tidak Sehat";
    if (tingkat === "BERBAHAYA") return "Berbahaya";
    if (tingkat === "SEDANG") return "Sedang";
    return "Baik";
}

function Matahari({ warna, glow }: { warna: string; glow: string }) {
    const kurangiGerak = useReducedMotion();
    const denyut = useSharedValue(0.5);

    useEffect(() => {
        if (kurangiGerak) {
            denyut.value = 0.5;
            return;
        }

        denyut.value = withRepeat(
            withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        return () => cancelAnimation(denyut);
    }, [denyut, kurangiGerak]);

    const gaya = useAnimatedStyle(() => ({
        opacity: interpolate(denyut.value, [0, 1], [0.78, 1]),
        transform: [{ scale: interpolate(denyut.value, [0, 1], [0.96, 1.06]) }],
    }));

    return (
        <Animated.View
            style={[styles.matahariGlow, { backgroundColor: glow }, gaya]}
        >
            <View style={[styles.matahariInti, { backgroundColor: warna }]} />
        </Animated.View>
    );
}

function Awan({
    kiri,
    atas,
    skala,
    warna,
    durasi,
    delay,
}: {
    kiri: DimensionValue;
    atas: number;
    skala: number;
    warna: string;
    durasi: number;
    delay: number;
}) {
    const kurangiGerak = useReducedMotion();
    const gerak = useSharedValue(0);

    useEffect(() => {
        if (kurangiGerak) {
            gerak.value = 0.5;
            return;
        }

        gerak.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: durasi, easing: Easing.linear }),
                -1,
                true
            )
        );

        return () => cancelAnimation(gerak);
    }, [delay, durasi, gerak, kurangiGerak]);

    const gaya = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(gerak.value, [0, 1], [-9, 9]) },
            { scale: skala },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.awan,
                { left: kiri, top: atas },
                gaya,
            ]}
        >
            <View style={[styles.awanBadan, { backgroundColor: warna }]} />
            <View style={[styles.awanPuncak, { backgroundColor: warna }]} />
            <View style={[styles.awanEkor, { backgroundColor: warna }]} />
        </Animated.View>
    );
}

function TetesHujan({
    kiri,
    delay,
    durasi,
    warna,
}: {
    kiri: DimensionValue;
    delay: number;
    durasi: number;
    warna: string;
}) {
    const kurangiGerak = useReducedMotion();
    const turun = useSharedValue(0);

    useEffect(() => {
        if (kurangiGerak) {
            turun.value = 0.5;
            return;
        }

        turun.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: durasi, easing: Easing.linear }),
                -1,
                false
            )
        );

        return () => cancelAnimation(turun);
    }, [delay, durasi, kurangiGerak, turun]);

    const gaya = useAnimatedStyle(() => ({
        opacity: interpolate(turun.value, [0, 0.12, 0.78, 1], [0, 0.7, 0.55, 0]),
        transform: [{ translateY: interpolate(turun.value, [0, 1], [-28, 170]) }],
    }));

    return (
        <Animated.View
            style={[
                styles.tetesHujan,
                { left: kiri, backgroundColor: warna },
                gaya,
            ]}
        />
    );
}

function ButirSalju({
    kiri,
    delay,
    durasi,
}: {
    kiri: DimensionValue;
    delay: number;
    durasi: number;
}) {
    const kurangiGerak = useReducedMotion();
    const turun = useSharedValue(0);

    useEffect(() => {
        if (kurangiGerak) {
            turun.value = 0.5;
            return;
        }

        turun.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: durasi, easing: Easing.linear }),
                -1,
                false
            )
        );

        return () => cancelAnimation(turun);
    }, [delay, durasi, kurangiGerak, turun]);

    const gaya = useAnimatedStyle(() => ({
        opacity: interpolate(turun.value, [0, 0.12, 0.8, 1], [0, 0.9, 0.7, 0]),
        transform: [
            { translateX: interpolate(turun.value, [0, 1], [-7, 7]) },
            { translateY: interpolate(turun.value, [0, 1], [-18, 175]) },
        ],
    }));

    return (
        <Animated.View
            style={[styles.butirSalju, { left: kiri }, gaya]}
        />
    );
}

function Kilat() {
    const kurangiGerak = useReducedMotion();
    const kilat = useSharedValue(0);

    useEffect(() => {
        if (kurangiGerak) {
            kilat.value = 0;
            return;
        }

        kilat.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 90 }),
                withTiming(0, { duration: 220 }),
                withDelay(4200, withTiming(0, { duration: 0 }))
            ),
            -1,
            false
        );

        return () => cancelAnimation(kilat);
    }, [kilat, kurangiGerak]);

    const gaya = useAnimatedStyle(() => ({ opacity: kilat.value }));

    return (
        <Animated.View
            style={[StyleSheet.absoluteFill, styles.kilat, gaya]}
        />
    );
}

function Pemandangan({
    jenis,
    palet,
}: {
    jenis: JenisCuaca;
    palet: PaletCuaca;
}) {
    const hujan = jenis === "hujan" || jenis === "badai";

    return (
        <View style={[StyleSheet.absoluteFill, styles.nonInteraktif]}>
            {jenis === "cerah" && (
                <>
                    <Matahari warna={palet.matahari} glow={palet.matahariGlow} />
                    <Awan
                        kiri="4%"
                        atas={92}
                        skala={0.8}
                        warna={palet.awan}
                        durasi={17000}
                        delay={0}
                    />
                    <Awan
                        kiri="68%"
                        atas={132}
                        skala={0.55}
                        warna={palet.awan}
                        durasi={21000}
                        delay={1800}
                    />
                </>
            )}

            {jenis === "berawan" && (
                <>
                    <Awan
                        kiri="2%"
                        atas={24}
                        skala={0.9}
                        warna={palet.awan}
                        durasi={18000}
                        delay={0}
                    />
                    <Awan
                        kiri="48%"
                        atas={62}
                        skala={0.7}
                        warna={palet.awan}
                        durasi={23000}
                        delay={900}
                    />
                    <Awan
                        kiri="70%"
                        atas={118}
                        skala={0.55}
                        warna={palet.awan}
                        durasi={20000}
                        delay={2400}
                    />
                </>
            )}

            {jenis === "mendung" && (
                <>
                    <Awan
                        kiri="-4%"
                        atas={18}
                        skala={1.05}
                        warna={palet.awan}
                        durasi={22000}
                        delay={0}
                    />
                    <Awan
                        kiri="35%"
                        atas={38}
                        skala={0.9}
                        warna={palet.awan}
                        durasi={19000}
                        delay={700}
                    />
                    <Awan
                        kiri="68%"
                        atas={16}
                        skala={0.8}
                        warna={palet.awan}
                        durasi={24000}
                        delay={1600}
                    />
                    <Awan
                        kiri="5%"
                        atas={114}
                        skala={0.65}
                        warna={palet.awan}
                        durasi={20000}
                        delay={2600}
                    />
                </>
            )}

            {hujan && (
                <>
                    <Awan
                        kiri="-5%"
                        atas={jenis === "badai" ? 10 : 18}
                        skala={1.1}
                        warna={palet.awan}
                        durasi={21000}
                        delay={0}
                    />
                    <Awan
                        kiri="38%"
                        atas={jenis === "badai" ? 20 : 32}
                        skala={0.9}
                        warna={palet.awan}
                        durasi={18000}
                        delay={800}
                    />
                    <Awan
                        kiri="70%"
                        atas={jenis === "badai" ? 8 : 14}
                        skala={0.78}
                        warna={palet.awan}
                        durasi={24000}
                        delay={1700}
                    />
                    {POSISI_HUJAN.map((kiri, index) => (
                        <TetesHujan
                            key={`hujan-${index}`}
                            kiri={`${kiri}%`}
                            delay={(index * 137) % 1300}
                            durasi={850 + (index % 5) * 120}
                            warna={palet.hujan}
                        />
                    ))}
                </>
            )}

            {jenis === "badai" && <Kilat />}

            {jenis === "salju" && (
                <>
                    <Awan
                        kiri="4%"
                        atas={22}
                        skala={0.9}
                        warna={palet.awan}
                        durasi={22000}
                        delay={0}
                    />
                    <Awan
                        kiri="58%"
                        atas={48}
                        skala={0.7}
                        warna={palet.awan}
                        durasi={20000}
                        delay={1100}
                    />
                    {POSISI_SALJU.map((kiri, index) => (
                        <ButirSalju
                            key={`salju-${index}`}
                            kiri={`${kiri}%`}
                            delay={(index * 420) % 4200}
                            durasi={4800 + (index % 4) * 700}
                        />
                    ))}
                </>
            )}
        </View>
    );
}

export default function CuacaHero({
    kota,
    suhu,
    kodeCuaca,
    kecepatanAngin,
    indeksAQI,
    tingkatAQI,
}: CuacaHeroProps) {
    const kurangiGerak = useReducedMotion();
    const { skema } = useThemePreference();
    const jenis = jenisCuaca(kodeCuaca);
    const palet = PALET[jenis][skema];
    const kondisi = labelKodeCuaca(kodeCuaca);
    const labelAksesibilitas = `Cuaca ${kota}, suhu ${Math.round(
        suhu
    )} derajat, ${kondisi}, angin ${Math.round(
        kecepatanAngin
    )} kilometer per jam, indeks kualitas udara ${indeksAQI}, kategori ${labelTingkat(
        tingkatAQI
    )}`;

    return (
        <View
            accessible
            accessibilityLabel={labelAksesibilitas}
            style={styles.bingkai}
        >
            <View style={styles.hero}>
                <LinearGradient
                    colors={palet.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <Animated.View
                    key={jenis}
                    entering={kurangiGerak ? undefined : FadeIn.duration(450)}
                    style={[StyleSheet.absoluteFill, styles.nonInteraktif]}
                >
                    <Pemandangan jenis={jenis} palet={palet} />
                </Animated.View>

                <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.46)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[StyleSheet.absoluteFill, styles.nonInteraktif]}
                />

                <View style={styles.konten}>
                    <View style={styles.barisAtas}>
                        <Text numberOfLines={1} style={styles.kota}>
                            {kota}
                        </Text>
                    </View>

                    <View style={styles.barisBawah}>
                        <View style={styles.infoBawah}>
                            <Text style={styles.suhu}>{Math.round(suhu)}°</Text>
                            <Text style={styles.kondisi}>
                                {kondisi} · Angin {Math.round(kecepatanAngin)} km/j
                            </Text>
                        </View>

                        <View style={styles.badge}>
                            <Text style={styles.badgeAngka}>AQI {indeksAQI}</Text>
                            <Text style={styles.badgeKategori}>
                                {labelTingkat(tingkatAQI)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bingkai: {
        borderRadius: 20,
        backgroundColor: "transparent",
        shadowColor: "#000000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 7 },
        elevation: 5,
    },
    hero: {
        height: 232,
        borderRadius: 20,
        overflow: "hidden",
    },
    konten: {
        flex: 1,
        justifyContent: "space-between",
        padding: 18,
    },
    barisAtas: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    kota: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    badge: {
        alignItems: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },
    badgeAngka: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    badgeKategori: {
        color: "rgba(255,255,255,0.82)",
        fontSize: 10,
        fontWeight: "500",
        marginTop: 1,
    },
    barisBawah: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
    },
    infoBawah: {
        flex: 1,
        gap: 2,
    },
    suhu: {
        color: "#FFFFFF",
        fontSize: 58,
        fontWeight: "300",
        lineHeight: 64,
        fontVariant: ["tabular-nums"],
        textShadowColor: "rgba(0,0,0,0.28)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    kondisi: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 13,
        fontWeight: "500",
        textShadowColor: "rgba(0,0,0,0.25)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    matahariGlow: {
        pointerEvents: "none",
        position: "absolute",
        right: 20,
        top: 12,
        width: 108,
        height: 108,
        borderRadius: 54,
        alignItems: "center",
        justifyContent: "center",
    },
    matahariInti: {
        width: 62,
        height: 62,
        borderRadius: 31,
        shadowColor: "#FFD166",
        shadowOpacity: 0.7,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
    },
    awan: {
        pointerEvents: "none",
        position: "absolute",
        width: 100,
        height: 55,
    },
    awanBadan: {
        position: "absolute",
        left: 8,
        top: 20,
        width: 82,
        height: 32,
        borderRadius: 17,
    },
    awanPuncak: {
        position: "absolute",
        left: 27,
        top: 2,
        width: 46,
        height: 40,
        borderRadius: 23,
    },
    awanEkor: {
        position: "absolute",
        left: 56,
        top: 25,
        width: 36,
        height: 26,
        borderRadius: 14,
    },
    tetesHujan: {
        pointerEvents: "none",
        position: "absolute",
        top: 20,
        width: 1.5,
        height: 18,
        borderRadius: 1,
    },
    butirSalju: {
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#FFFFFF",
    },
    kilat: {
        pointerEvents: "none",
        backgroundColor: "rgba(253,230,138,0.38)",
    },
    nonInteraktif: {
        pointerEvents: "none",
    },
});
