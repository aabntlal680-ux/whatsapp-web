import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Message } from "@/types";

interface Props {
  message: Message;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message }: Props) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <View style={[styles.wrapper, isOutgoing ? styles.wrapperOut : styles.wrapperIn]}>
      <View
        style={[
          styles.bubble,
          isOutgoing ? styles.bubbleOut : styles.bubbleIn,
        ]}
      >
        {message.type === "template" && (
          <View style={styles.templateTag}>
            <Feather name="layout" size={11} color="#667781" />
            <Text style={styles.templateLabel}>قالب رسمي</Text>
          </View>
        )}
        <Text style={[styles.text, isOutgoing ? styles.textOut : styles.textIn]}>
          {message.content}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{formatTime(message.created_at)}</Text>
          {isOutgoing && (
            <Feather
              name={message.status === "read" ? "check-circle" : "check"}
              size={13}
              color={message.status === "read" ? "#34B7F1" : "#667781"}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  wrapperOut: {
    alignItems: "flex-end",
  },
  wrapperIn: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    minWidth: 80,
  },
  bubbleOut: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 2,
  },
  bubbleIn: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 2,
  },
  templateTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  templateLabel: {
    fontSize: 11,
    color: "#667781",
    fontFamily: "Inter_500Medium",
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  textOut: {
    color: "#111B21",
  },
  textIn: {
    color: "#111B21",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: "#667781",
    fontFamily: "Inter_400Regular",
  },
});
