import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={{ flex: 1, backgroundColor: 'rgba(16,19,24,0.4)' }}
        />
        <View
          style={{
            maxHeight: '85%',
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.sheet,
            borderTopRightRadius: theme.radii.sheet,
            paddingBottom: insets.bottom + theme.spacing.md,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            accessibilityRole="header"
            allowFontScaling
            style={{
              color: theme.colors.text,
              ...theme.typography.title,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.sm,
            }}
          >
            {title}
          </Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
