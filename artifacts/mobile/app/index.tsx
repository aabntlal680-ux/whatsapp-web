import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import ChatPanel from "@/components/ChatPanel";
import ConversationList from "@/components/ConversationList";
import { useApp } from "@/context/AppContext";
import type { Contact } from "@/types";

function EmptyChatPlaceholder() {
  return (
    <View style={styles.emptyPlaceholder}>
      <View style={styles.iconWrap}>
        <Feather name="message-circle" size={80} color="#DFE5E7" />
      </View>
      <Text style={styles.emptyTitle}>واتساب بيزنس API</Text>
      <Text style={styles.emptySubtitle}>
        اختر محادثة من القائمة للبدء
      </Text>
      <View style={styles.featureRow}>
        <FeatureTag icon="shield" label="مشفر بالكامل" />
        <FeatureTag icon="clock" label="نافذة 24 ساعة" />
        <FeatureTag icon="layout" label="قوالب رسمية" />
      </View>
    </View>
  );
}

function FeatureTag({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureTag}>
      <Feather name={icon as any} size={14} color="#075E54" />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

export default function MainScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { setSelectedContact: setAppContact } = useApp();

  const handleSelect = (c: Contact) => {
    setSelectedContact(c);
    setAppContact(c);
  };

  const handleBack = () => {
    setSelectedContact(null);
    setAppContact(null);
  };

  if (isTablet) {
    return (
      <View style={styles.splitContainer}>
        {/* LEFT: Active Chat panel */}
        <View style={styles.leftPanel}>
          {selectedContact ? (
            <ChatPanel contact={selectedContact} />
          ) : (
            <EmptyChatPlaceholder />
          )}
        </View>
        <View style={styles.divider} />
        {/* RIGHT: Conversation list */}
        <View style={styles.rightPanel}>
          <ConversationList
            onSelectContact={handleSelect}
            selectedContactId={selectedContact?.id}
          />
        </View>
      </View>
    );
  }

  if (selectedContact) {
    return (
      <View style={styles.flex}>
        <ChatPanel contact={selectedContact} onBack={handleBack} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ConversationList onSelectContact={handleSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  divider: {
    width: 1,
    backgroundColor: "#E9EDEF",
  },
  rightPanel: {
    width: 380,
    borderLeftWidth: 1,
    borderLeftColor: "#E9EDEF",
  },
  emptyPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
    backgroundColor: "#F8F9FA",
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111B21",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#667781",
    textAlign: "center",
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E9EDEF",
  },
  featureLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#075E54",
  },
});
