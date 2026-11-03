import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, Text, View } from 'react-native';

import type { Appointment } from '@/features/agenda/db';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTheme } from '@/shared/theme';

type TodayListProps = {
  items: Appointment[];
  hour12: boolean;
  onToggle: (item: Appointment) => void;
};

export function TodayList({ items, hour12, onToggle }: TodayListProps) {
  const theme = useTheme();
  const nextId = items.find((item) => !item.done)?.id;

  return (
    <Card>
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.today.agenda}
      </Text>
      {items.length === 0 ? (
        <EmptyState title={strings.today.freeDay} message={strings.today.freeDayHint} />
      ) : (
        items.map((item) => {
          const highlighted = item.id === nextId;
          return (
            <View
              key={item.id}
              style={{
                marginTop: theme.spacing.sm,
                minHeight: 44,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.xs,
                borderRadius: theme.radii.button,
                backgroundColor: highlighted ? theme.colors.background : 'transparent',
              }}
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.done }}
                accessibilityLabel={`${item.title}, ${format(parseISO(item.startsAt), hour12 ? 'h:mm a' : 'HH:mm')}`}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    void Haptics.selectionAsync();
                  }
                  onToggle(item);
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.done ? theme.colors.primary : theme.colors.surface,
                }}
              >
                <Text style={{ color: item.done ? theme.colors.background : theme.colors.text }}>
                  {item.done ? '✓' : ''}
                </Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling
                  style={{
                    color: theme.colors.text,
                    textDecorationLine: item.done ? 'line-through' : 'none',
                    ...theme.typography.body,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  allowFontScaling
                  style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
                >
                  {format(parseISO(item.startsAt), hour12 ? 'h:mm a' : 'HH:mm')}
                  {highlighted ? ` · ${strings.agenda.nextUp}` : ''}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}
