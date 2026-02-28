import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category } from '../types';
import { getCategoryInfo } from '../data/categories';

interface Props {
  category: Category;
  small?: boolean;
}

export function CategoryBadge({ category, small }: Props) {
  const info = getCategoryInfo(category);
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: info.bgColor, borderColor: info.color },
        small && styles.small,
      ]}
    >
      <Text style={[styles.text, { color: info.color }, small && styles.smallText]}>
        {small ? info.label : `${info.emoji} ${info.label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 11,
  },
});
