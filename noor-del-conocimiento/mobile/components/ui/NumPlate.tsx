import React from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

/** "E_NumPlate" convention: mono 9px w700, tracking 1.5, uppercase, gold. */
export function NumPlate({ label, style }: { label: string; style?: TextStyle }) {
  return (
    <Text style={[styles.plate, style]} accessibilityRole="text">
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  plate: {
    fontFamily: Fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.gold,
    textTransform: 'uppercase',
  },
});
