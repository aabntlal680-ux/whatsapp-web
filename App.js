import React from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* هذا الجزء سيقوم بفتح واجهة واتساب ويب أو الرابط الذي تريده */}
        <WebView
          source={{ uri: "https://web.whatsapp.com" }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});