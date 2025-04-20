import { View, StyleSheet } from 'react-native';

export default function SolidTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: '#002233' }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
