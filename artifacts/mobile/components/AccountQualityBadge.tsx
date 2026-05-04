import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useApp } from "@/context/AppContext";

export default function AccountQualityBadge() {
  const { accountStatus } = useApp();

  if (!accountStatus) return null;

  const { status } = accountStatus;

  const dotColor =
    status === "GREEN" ? "#25D366" : status === "YELLOW" ? "#FFC107" : "#EA0038";

  const label =
    status === "GREEN"
      ? "الحساب آمن"
      : status === "YELLOW"
      ? "تحذير: مراجعة مطلوبة"
      : "تنبيه: بلاغات نشطة";

  const bgColor =
    status === "GREEN"
      ? "rgba(37,211,102,0.15)"
      : status === "YELLOW"
      ? "rgba(255,193,7,0.2)"
      : "rgba(234,0,56,0.15)";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: dotColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
