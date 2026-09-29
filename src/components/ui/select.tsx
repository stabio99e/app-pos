import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  badge?: string;
  badgeIntent?: 'danger' | 'gray' | 'warning' | 'success';
}

export interface SelectProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  shape?: 'rounded' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  prefix?: React.ReactNode;
}

export function Select<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  shape = 'pill',
  size = 'md',
  style,
  prefix,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
        style={[
          styles.trigger,
          styles[`shape_${shape}`],
          styles[`size_${size}`],
          style,
        ]}
      >
        <View style={styles.triggerLeft}>
          {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
          <Text
            numberOfLines={1}
            style={[
              styles.triggerText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#64748B" style={styles.chevron} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {label && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.value}_${index}`}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                const isDisabled = !!item.isDisabled;

                return (
                  <TouchableOpacity
                    disabled={isDisabled}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionSelected,
                      isDisabled && styles.optionDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        onChange(item.value);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <View style={styles.optionContent}>
                      {item.icon && <View style={styles.optionIcon}>{item.icon}</View>}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                          isDisabled && styles.optionTextDisabled,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.badge && (
                        <View
                          style={[
                            styles.optionBadge,
                            item.badgeIntent === 'danger'
                              ? styles.badgeDanger
                              : styles.badgeGray,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionBadgeText,
                              item.badgeIntent === 'danger'
                                ? styles.badgeTextDanger
                                : styles.badgeTextGray,
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    {isSelected && !isDisabled && (
                      <Ionicons name="checkmark" size={18} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      } as any,
    }),
  },
  shape_rounded: {
    borderRadius: 12,
  },
  shape_pill: {
    borderRadius: 9999,
  },
  size_sm: {
    height: 34,
    paddingHorizontal: 10,
  },
  size_md: {
    height: 42,
    paddingHorizontal: 14,
  },
  size_lg: {
    height: 48,
    paddingHorizontal: 18,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  prefixContainer: {
    marginRight: 6,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(3px)',
      } as any,
    }),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionDisabled: {
    opacity: 0.45,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#2563EB',
  },
  optionTextDisabled: {
    color: '#94A3B8',
  },
  optionBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeGray: {
    backgroundColor: '#F1F5F9',
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextDanger: {
    color: '#DC2626',
  },
  badgeTextGray: {
    color: '#64748B',
  },
});
