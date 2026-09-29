import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';

export interface TabItem<T = string> {
  id: T;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps<T = string> {
  tabs: TabItem<T>[];
  selectedTab: T;
  onSelectTab: (tabId: T) => void;
  variant?: 'pills' | 'segmented' | 'underline';
  style?: StyleProp<ViewStyle>;
}

export function Tabs<T = string>({
  tabs,
  selectedTab,
  onSelectTab,
  variant = 'pills',
  style,
}: TabsProps<T>) {
  return (
    <View style={[styles.container, styles[`container_${variant}`], style]}>
      {tabs.map((tab) => {
        const isSelected = tab.id === selectedTab;
        return (
          <TouchableOpacity
            key={String(tab.id)}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              styles[`tab_${variant}`],
              isSelected && styles[`tabSelected_${variant}`],
            ]}
          >
            {tab.icon && (
              <View style={[styles.iconContainer, isSelected && styles.iconSelected]}>
                {tab.icon}
              </View>
            )}
            <Text
              style={[
                styles.tabText,
                styles[`tabText_${variant}`],
                isSelected && styles[`tabTextSelected_${variant}`],
              ]}
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && (
              <View
                style={[
                  styles.badge,
                  isSelected ? styles.badgeSelected : styles.badgeDefault,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected ? styles.badgeTextSelected : styles.badgeTextDefault,
                  ]}
                >
                  {tab.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container_pills: {
    gap: 8,
  },
  container_segmented: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  container_underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      } as any,
    }),
  },
  tab_pills: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tabSelected_pills: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
  },
  tab_segmented: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  tabSelected_segmented: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      } as any,
    }),
  },
  tab_underline: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected_underline: {
    borderBottomColor: '#2563EB',
  },
  iconContainer: {
    marginRight: 6,
  },
  iconSelected: {},
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabText_pills: {
    color: '#64748B',
  },
  tabTextSelected_pills: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabText_segmented: {
    color: '#64748B',
  },
  tabTextSelected_segmented: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabText_underline: {
    color: '#64748B',
  },
  tabTextSelected_underline: {
    color: '#2563EB',
    fontWeight: '700',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  badgeSelected: {
    backgroundColor: '#EFF6FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextDefault: {
    color: '#64748B',
  },
  badgeTextSelected: {
    color: '#2563EB',
  },
});
