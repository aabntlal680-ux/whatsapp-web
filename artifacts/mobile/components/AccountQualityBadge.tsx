import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useApp } from "@/context/AppContext";

export default function AccountQualityBadge() {
  const { accountStatus, realtimeConnected, statusLoaded } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!accountStatus || accountStatus.status === "GREEN") {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [accountStatus, pulseAnim]);

  // Still waiting for first fetch
  if (!statusLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
        <Feather name="loader" size={11} color="rgba(255,255,255,0.55)" />
        <Text style={[styles.label, { color: "rgba(255,255,255,0.55)" }]}>جارٍ الاتصال...</Text>
      </View>
    );
  }

  // Fetched but table is empty
  if (!accountStatus) {
    return (
      <View style={[styles.container, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
        <Feather
          name={realtimeConnected ? "radio" : "wifi-off"}
          size={11}
          color="rgba(255,255,255,0.7)"
        />
        <Text style={[styles.label, { color: "rgba(255,255,255,0.7)" }]}>
          {realtimeConnected ? "Realtime متصل" : "لا يوجد تقييم"}
        </Text>
      </View>
    );
  }

  const { status } = accountStatus;

  const dotColor =
    status === "GREEN" ? "#25D366" : status === "YELLOW" ? "#FFC107" : "#FF3B30";

  const label =
    status === "GREEN"
      ? "الحساب آمن"
      : status === "YELLOW"
      ? "تحذير: مراجعة مطلوبة"
      : "تنبيه: بلاغات نشطة";

  const bgColor =
    status === "GREEN"
      ? "rgba(37,211,102,0.22)"
      : status === "YELLOW"
      ? "rgba(255,193,7,0.28)"
      : "rgba(255,59,48,0.28)";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]} />
      <Text style={[styles.label, { color: dotColor }]}>{label}</Text>
      {realtimeConnected && (
        <View style={[styles.liveTag, { borderColor: dotColor }]}>
          <Text style={[styles.liveText, { color: dotColor }]}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  liveTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveText: {
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
