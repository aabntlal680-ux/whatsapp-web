import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NotificationType } from "@/hooks/useSettings";
import { useSettings } from "@/hooks/useSettings";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ToggleRow({
  icon,
  label,
  sublabel,
  value,
  onToggle,
  disabled,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowIcon}>
        <Feather name={icon as any} size={18} color={disabled ? "#C5CDD2" : "#075E54"} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, disabled && styles.labelDisabled]}>{label}</Text>
        {sublabel ? (
          <Text style={styles.rowSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#E9EDEF", true: "#25D366" }}
        thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
        ios_backgroundColor="#E9EDEF"
      />
    </View>
  );
}

function RadioRow({
  icon,
  label,
  selected,
  onPress,
  disabled,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.rowIcon}>
        <Feather name={icon as any} size={18} color={disabled ? "#C5CDD2" : "#075E54"} />
      </View>
      <Text style={[styles.rowLabel, { flex: 1 }, disabled && styles.labelDisabled]}>
        {label}
      </Text>
      <View
        style={[
          styles.radio,
          selected && !disabled && styles.radioSelected,
        ]}
      >
        {selected && !disabled && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { settings, loaded, updateSetting, resetSettings } = useSettings();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!loaded) return null;

  const handleReset = () => {
    Alert.alert(
      "إعادة تعيين الإعدادات",
      "هل تريد إعادة جميع الإعدادات إلى القيم الافتراضية؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إعادة تعيين",
          style: "destructive",
          onPress: resetSettings,
        },
      ]
    );
  };

  const notifTypes: { key: NotificationType; icon: string; label: string }[] = [
    { key: "sound", icon: "volume-2", label: "صوت" },
    { key: "vibrate", icon: "smartphone", label: "اهتزاز" },
    { key: "silent", icon: "bell-off", label: "صامت" },
  ];

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="الإشعارات" />
        <View style={styles.card}>
          <ToggleRow
            icon="bell"
            label="تفعيل الإشعارات"
            sublabel="استقبال إشعارات الرسائل الجديدة"
            value={settings.notificationsEnabled}
            onToggle={(v) => updateSetting("notificationsEnabled", v)}
          />
        </View>

        <SectionHeader title="نوع الإشعار" />
        <View style={styles.card}>
          {notifTypes.map((nt, idx) => (
            <React.Fragment key={nt.key}>
              {idx > 0 && <View style={styles.divider} />}
              <RadioRow
                icon={nt.icon}
                label={nt.label}
                selected={settings.notificationType === nt.key}
                onPress={() => updateSetting("notificationType", nt.key)}
                disabled={!settings.notificationsEnabled}
              />
            </React.Fragment>
          ))}
        </View>

        <SectionHeader title="إعدادات العرض" />
        <View style={styles.card}>
          <ToggleRow
            icon="list"
            label="العرض المدمج"
            sublabel="عرض المحادثات بشكل أكثر إحكاماً"
            value={settings.compactView}
            onToggle={(v) => updateSetting("compactView", v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="eye"
            label="إظهار حالة الاتصال"
            sublabel="عرض مؤشر الاتصال بـ Supabase"
            value={settings.showOnlineStatus}
            onToggle={(v) => updateSetting("showOnlineStatus", v)}
          />
        </View>

        <SectionHeader title="المحادثات" />
        <View style={styles.card}>
          <ToggleRow
            icon="check-circle"
            label="تعليم مقروء تلقائياً"
            sublabel="تعليم الرسائل كمقروءة عند فتح المحادثة"
            value={settings.autoMarkRead}
            onToggle={(v) => updateSetting("autoMarkRead", v)}
          />
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Feather name="refresh-ccw" size={16} color="#FF3B30" />
          <Text style={styles.resetText}>إعادة تعيين الإعدادات</Text>
        </TouchableOpacity>
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
    paddingBottom: 48,
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
  divider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#111B21",
  },
  labelDisabled: {
    color: "#C5CDD2",
  },
  rowSublabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#667781",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#C5CDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#075E54",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#075E54",
  },
  resetBtn: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFF0EF",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  resetText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FF3B30",
  },
});
