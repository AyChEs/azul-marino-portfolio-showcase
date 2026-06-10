import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors } from "../constants/colors";
import { NoorButton } from "../components/ui/NoorButton";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>Página no encontrada</Text>
        <Text style={styles.subtitle}>Page not found · الصفحة غير موجودة</Text>
        <NoorButton
          onPress={() => router.replace("/home")}
          label="Volver al inicio"
          variant="primary"
          size="md"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.parchment.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  button: { width: "100%" },
});
