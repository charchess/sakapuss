import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { SyncQueue } from '../store/syncQueue';
import { Colors, Radius } from '../constants/theme';

export function SyncBadge() {
  const [count, setCount] = useState(0);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const refresh = async () => {
    const n = await SyncQueue.getPendingCount();
    setCount(n);
    Animated.timing(opacity, {
      toValue: n > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    refresh();
    const unsubscribe = SyncQueue.subscribe(refresh);
    return unsubscribe;
  }, []);

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.badge, { opacity }]}>
      <Text style={styles.text}>
        {count} en attente de sync
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${Colors.accent}CC`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginRight: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3436',
  },
});
