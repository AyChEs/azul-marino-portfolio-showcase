// Micro section header — "MODO DE JUEGO ──────── 01 / 03"
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { MicroLabel } from "../../constants/fonts";

export function SectionLabel({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={styles.row} accessibilityRole="header">
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { ...MicroLabel, color: Colors.gold.dusty },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border.subtle },
  meta: { ...MicroLabel, color: Colors.text.muted },
});
