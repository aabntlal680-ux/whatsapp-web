import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@/constants/colors";
import type { Contact } from "@/types";

interface Props {
  contact: Contact;
  isSelected: boolean;
  onPress: () => void;
}

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "أمس";
  return `منذ ${diffDays} أيام`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ConversationItem({ contact, isSelected, onPress }: Props) {
  const c = colors.light;
  const timeStr = formatLastSeen(contact.last_message_at);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, isSelected && { backgroundColor: "#F0F2F5" }]}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(contact.name)}</Text>
        {contact.is_online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={[styles.time, { color: c.mutedForeground }]}>{timeStr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.preview, { color: c.mutedForeground }]} numberOfLines={1}>
            {contact.last_message_preview ?? contact.phone}
          </Text>
          {(contact.unread_count ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{contact.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#DFE5E7",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#667781",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#25D366",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  body: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  preview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#25D366",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
