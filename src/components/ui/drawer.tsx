import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  Animated,
} from 'react-native';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  width = 280,
  style,
}: DrawerProps) {
  const [slideAnim] = React.useState(new Animated.Value(-width));

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, width, slideAnim]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.drawerContainer,
            { width, transform: [{ translateX: slideAnim }] },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(3px)',
      } as any,
    }),
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 20,
  },
});
