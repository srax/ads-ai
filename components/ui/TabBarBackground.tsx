import { View, StyleSheet } from 'react-native';

export default function SolidTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: '#000000' }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
