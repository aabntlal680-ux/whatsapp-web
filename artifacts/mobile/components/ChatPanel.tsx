import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MessageBubble from "@/components/MessageBubble";
import TemplateModal from "@/components/TemplateModal";
import { useApp } from "@/context/AppContext";
import type { Contact } from "@/types";

interface Props {
  contact: Contact;
  onBack?: () => void;
}

function formatWindowTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getLastSeen(contact: Contact): string {
  if (contact.is_online) return "متصل الآن";
  if (!contact.last_message_at) return "";
  const date = new Date(contact.last_message_at);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 2) return "آخر ظهور: الآن";
  if (diffMins < 60) return `آخر ظهور: منذ ${diffMins} دقيقة`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `آخر ظهور: منذ ${diffH} ساعة`;
  if (diffH < 48) return "آخر ظهور: أمس";
  return `آخر ظهور: منذ ${Math.floor(diffH / 24)} أيام`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ChatPanel({ contact, onBack }: Props) {
  const { messages, isLoadingMessages, isSending, windowOpen, windowSecondsLeft, sendMessage } =
    useApp();
  const [text, setText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setText("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(trimmed, "text");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarInitials}>{getInitials(contact.name)}</Text>
          {contact.is_online && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.lastSeen}>{getLastSeen(contact)}</Text>
        </View>
        <View style={styles.headerActions}>
          {windowOpen && windowSecondsLeft > 0 && (
            <View style={styles.windowTimer}>
              <Feather name="clock" size={12} color="#FFD700" />
              <Text style={styles.windowTimerText}>
                {formatWindowTime(windowSecondsLeft)}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="phone" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="more-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {isLoadingMessages ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#075E54" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Feather name="lock" size={18} color="#667781" />
                <Text style={styles.emptyChatText}>
                  الرسائل محمية بالتشفير الكامل
                </Text>
              </View>
            }
            style={styles.chatBg}
          />
        )}

        <View style={[styles.inputArea, { paddingBottom: bottomPadding + 8 }]}>
          {!windowOpen ? (
            <TouchableOpacity
              style={styles.templateBtn}
              onPress={() => setShowTemplates(true)}
              activeOpacity={0.8}
            >
              <Feather name="layout" size={18} color="#FFFFFF" />
              <Text style={styles.templateBtnText}>إرسال قالب رسمي</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={() => setShowTemplates(true)}
              >
                <Feather name="paperclip" size={22} color="#667781" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="اكتب رسالة..."
                placeholderTextColor="#667781"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={4096}
                returnKeyType="default"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!text.trim() || isSending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!text.trim() || isSending}
                activeOpacity={0.8}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <TemplateModal
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: "#075E54",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: {
    padding: 6,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DFE5E7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#667781",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#25D366",
    borderWidth: 2,
    borderColor: "#075E54",
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  lastSeen: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  windowTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  windowTimerText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#FFD700",
  },
  iconBtn: {
    padding: 8,
  },
  chatBg: {
    backgroundColor: "#ECE5DD",
  },
  messageList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: 8,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    fontSize: 13,
    color: "#667781",
    fontFamily: "Inter_400Regular",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 8,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111B21",
    maxHeight: 120,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#075E54",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#25D366",
  },
  templateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#075E54",
    borderRadius: 24,
    paddingVertical: 12,
    gap: 8,
  },
  templateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
