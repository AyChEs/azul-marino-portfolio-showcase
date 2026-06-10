import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { t } from '../lib/i18n';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Global "Erratum · 500" boundary. Reports error name only — no PII. */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    if (__DEV__) console.error('ErrorBoundary:', error);
    // Production: log error name only (no message/stack — could contain user data).
    else console.warn('app_error', error.name);
  }

  override render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.page}>
        <Text style={styles.ornament}>۞</Text>
        <Text style={styles.title}>{t('errors.erratumTitle')}</Text>
        <Text style={styles.body}>{t('errors.erratumBody')}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  ornament: { fontSize: 28, color: Colors.gold },
  title: { fontFamily: Fonts.displayItalic, fontStyle: 'italic', fontSize: 24, color: Colors.ink },
  body: { fontFamily: Fonts.body, fontSize: 14, color: Colors.inkMuted, textAlign: 'center' },
});
