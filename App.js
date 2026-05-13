import React from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  // بيانات مشروعك في Supabase التي أرسلتها
  const PROJECT_URL =
    "https://supabase.com/dashboard/project/vahqnlqbayqjriicexxs/editor/17547";
  const ANON_KEY =
    "EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaHFubHFiYXlxanJpaWNleHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTAwMTYsImV4cCI6MjA5Mzk4NjAxNn0.SdtX254OWrABLo0js6FM6zPk19VYOxkHHaSkR2qelaA";

  // رابط لوحة تحكم سوبابيس لمشروعك مباشرة
  const dashboardUrl = `https://supabase.com/dashboard/project/vahqnlqbayqjriicexxs`;

  return (
    <SafeAreaView style={styles.container}>
      {/* شريط الحالة العلوي للهاتف */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: dashboardUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          // استخدام UserAgent حديث لتجنب حظر المتصفحات المدمجة
          userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
          // إعدادات إضافية لتحسين تجربة المستخدم
          allowsInlineMediaPlayback={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          onOpenWindow={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            const { targetUrl } = nativeEvent;
            console.log("Opening window to: ", targetUrl);
          }}
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
