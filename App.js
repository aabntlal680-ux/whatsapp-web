import React from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  // 1. الرابط الصحيح لواجهتك المخصصة (استخدم رابط Replit الخاص بك)
  const MY_CUSTOM_INTERFACE_URL =
    "https://whats-app-business-hub--aabntlal680.replit.app";
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.webContainer}>
        <WebView
          // التوجيه المباشر لواجهتك المخصصة
          source={{ uri: MY_CUSTOM_INTERFACE_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webContainer: {
    flex: 1,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});
