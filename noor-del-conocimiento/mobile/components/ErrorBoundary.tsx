import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Colors } from "../constants/colors";
import { NoorButton } from "./ui/NoorButton";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Log to console in dev; swap for Sentry.captureException(error) in prod
    console.error("[ErrorBoundary]", error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    router.replace("/home");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.content}>
          <Text style={styles.icon}>☁️</Text>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.subtitle}>Something went wrong · حدث خطأ ما</Text>
          <NoorButton
            onPress={this.handleReset}
            label="Volver al inicio"
            variant="primary"
            size="md"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }
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
