import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import type { Template } from "@/types";

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "d1",
    name: "ترحيب",
    content: "مرحباً، كيف يمكننا مساعدتك اليوم؟",
    language: "ar",
    category: "UTILITY",
  },
  {
    id: "d2",
    name: "متابعة طلب",
    content: "شكراً لتواصلك معنا. سنعود إليك في أقرب وقت ممكن.",
    language: "ar",
    category: "UTILITY",
  },
  {
    id: "d3",
    name: "تأكيد موعد",
    content: "تم تأكيد موعدك. نتطلع إلى خدمتك.",
    language: "ar",
    category: "UTILITY",
  },
  {
    id: "d4",
    name: "إشعار شحن",
    content: "طلبك في الطريق إليك! سيصل خلال 2-3 أيام عمل.",
    language: "ar",
    category: "UTILITY",
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TemplateModal({ visible, onClose }: Props) {
  const { templates, sendMessage } = useApp();
  const [sending, setSending] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const list = templates.length > 0 ? templates : DEFAULT_TEMPLATES;

  const handleSend = async (template: Template) => {
    setSending(template.id);
    await sendMessage(template.content, "template", template.name);
    setSending(null);
    onClose();
  };

  const renderItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSend(item)}
      disabled={sending === item.id}
      activeOpacity={0.7}
    >
      <View style={styles.itemBody}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemContent} numberOfLines={2}>
          {item.content}
        </Text>
        {item.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.sendIcon}>
        {sending === item.id ? (
          <Feather name="loader" size={20} color="#075E54" />
        ) : (
          <Feather name="send" size={20} color="#075E54" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>القوالب الرسمية</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color="#667781" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            انتهت نافذة الـ 24 ساعة. يمكنك إرسال قالب رسمي فقط.
          </Text>
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={list.length > 4}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E9EDEF",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#111B21",
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#667781",
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  itemBody: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#111B21",
  },
  itemContent: {
    fontSize: 13,
    color: "#667781",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F2F5",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    color: "#667781",
    fontFamily: "Inter_500Medium",
  },
  sendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#E9EDEF",
    marginHorizontal: 20,
  },
});
