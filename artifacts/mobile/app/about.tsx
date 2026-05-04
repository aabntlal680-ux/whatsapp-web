import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";
const EXPO_DASHBOARD_URL = "https://expo.dev/accounts/-/builds";
const SUPABASE_URL = "https://rixxshbiyahqogaythej.supabase.co";

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent ? { color: accent } : undefined]}>{value}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function AboutScreen() {
  const { realtimeConnected, statusLoaded, accountStatus } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const connectionLabel = !statusLoaded
    ? "جارٍ الاتصال..."
    : realtimeConnected
    ? "متصل — Realtime نشط"
    : "متصل — Polling فعّال";
  const connectionColor = !statusLoaded ? "#667781" : realtimeConnected ? "#25D366" : "#FFC107";

  const qualityLabel = !accountStatus
    ? "غير محدد"
    : accountStatus.status === "GREEN"
    ? "آمن ✓"
    : accountStatus.status === "YELLOW"
    ? "تحذير"
    : "خطر";
  const qualityColor = !accountStatus
    ? "#667781"
    : accountStatus.status === "GREEN"
    ? "#25D366"
    : accountStatus.status === "YELLOW"
    ? "#FFC107"
    : "#FF3B30";

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حول التطبيق</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Feather name="message-circle" size={52} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>WhatsApp Business Dashboard</Text>
          <Text style={styles.tagline}>لوحة إدارة واتساب بيزنس API</Text>
        </View>

        <SectionHeader title="معلومات التطبيق" />
        <View style={styles.card}>
          <InfoRow label="الإصدار" value={`v${APP_VERSION} (build ${BUILD_NUMBER})`} />
          <View style={styles.divider} />
          <InfoRow label="المنصة" value={Platform.OS === "android" ? "Android" : Platform.OS === "ios" ? "iOS" : "Web"} />
          <View style={styles.divider} />
          <InfoRow label="إطار العمل" value="Expo SDK 54 · React Native" />
        </View>

        <SectionHeader title="حالة الاتصال بـ Supabase" />
        <View style={styles.card}>
          <InfoRow label="الحالة" value={connectionLabel} accent={connectionColor} />
          <View style={styles.divider} />
          <InfoRow label="جودة الحساب" value={qualityLabel} accent={qualityColor} />
          <View style={styles.divider} />
          <InfoRow
            label="المشروع"
            value={SUPABASE_URL.replace("https://", "").split(".")[0]}
          />
        </View>

        <SectionHeader title="روابط مفيدة" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL(EXPO_DASHBOARD_URL)}
            activeOpacity={0.7}
          >
            <Feather name="package" size={18} color="#075E54" />
            <Text style={styles.linkText}>Expo Build Dashboard</Text>
            <Feather name="external-link" size={14} color="#667781" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL("https://business.facebook.com/wa/manage/home")}
            activeOpacity={0.7}
          >
            <Feather name="bar-chart-2" size={18} color="#075E54" />
            <Text style={styles.linkText}>Meta Business Suite</Text>
            <Feather name="external-link" size={14} color="#667781" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL("https://supabase.com/dashboard")}
            activeOpacity={0.7}
          >
            <Feather name="database" size={18} color="#075E54" />
            <Text style={styles.linkText}>Supabase Dashboard</Text>
            <Feather name="external-link" size={14} color="#667781" />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          © 2026 WhatsApp Business Dashboard{"\n"}
          جميع الحقوق محفوظة
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  header: {
    backgroundColor: "#075E54",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#075E54",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111B21",
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#667781",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#075E54",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9EDEF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#667781",
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#111B21",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginHorizontal: 16,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#111B21",
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#aab0b7",
    lineHeight: 20,
  },
});
