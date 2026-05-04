import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccountQualityBadge from "@/components/AccountQualityBadge";
import ConversationItem from "@/components/ConversationItem";
import { useApp } from "@/context/AppContext";
import type { Contact } from "@/types";

interface Props {
  style?: object;
  onSelectContact: (c: Contact) => void;
  selectedContactId?: string | null;
}

export default function ConversationList({ style, onSelectContact, selectedContactId }: Props) {
  const { contacts, isLoadingContacts, refreshContacts } = useApp();
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>المحادثات</Text>
          <View style={styles.headerActions}>
            <AccountQualityBadge />
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              style={styles.iconBtn}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/about")}
              style={styles.iconBtn}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Feather name="info" size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#667781" />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث..."
            placeholderTextColor="#667781"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Feather
              name="x"
              size={16}
              color="#667781"
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            contact={item}
            isSelected={item.id === selectedContactId}
            onPress={() => onSelectContact(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingContacts}
            onRefresh={refreshContacts}
            tintColor="#075E54"
            colors={["#075E54"]}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoadingContacts ? (
              <Text style={styles.emptyText}>جارٍ التحميل...</Text>
            ) : (
              <>
                <Feather name="message-circle" size={48} color="#DFE5E7" />
                <Text style={styles.emptyText}>لا توجد محادثات</Text>
                <Text style={styles.emptySubText}>
                  ستظهر المحادثات هنا عند بدء التواصل مع العملاء
                </Text>
              </>
            )}
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#075E54",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111B21",
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  separator: {
    height: 1,
    backgroundColor: "#E9EDEF",
    marginLeft: 78,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#667781",
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#667781",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
