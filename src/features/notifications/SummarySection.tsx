import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';

import {
  askNotificationPermission,
  notificationPermission,
  syncDailySummary,
} from '@/services/reminders';
import { usePreferences } from '@/services/preferences';
import { strings } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useTheme } from '@/shared/theme';

type SummarySectionProps = {
  body: string;
};

export function SummarySection({ body }: SummarySectionProps) {
  const theme = useTheme();
  const enabled = usePreferences((state) => state.dailySummaryEnabled);
  const hour = usePreferences((state) => state.dailySummaryHour);
  const minute = usePreferences((state) => state.dailySummaryMinute);
  const setDailySummary = usePreferences((state) => state.setDailySummary);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined',
  );

  useEffect(() => {
    notificationPermission()
      .then(setPermission)
      .catch(() => setPermission('denied'));
  }, []);

  async function allow() {
    const next = await askNotificationPermission();
    setPermission(next);
  }

  async function toggle(next: boolean) {
    setDailySummary(next);
    await syncDailySummary({ enabled: next, hour, minute, body });
  }

  async function pickHour(nextHour: number) {
    setDailySummary(enabled, nextHour, 0);
    await syncDailySummary({ enabled, hour: nextHour, minute: 0, body });
  }

  return (
    <Card>
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.settings.notifications}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.textMuted,
          marginVertical: theme.spacing.xs,
          ...theme.typography.body,
        }}
      >
        {strings.settings.notificationsHelp}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
          ...theme.typography.caption,
        }}
      >
        {permission === 'granted'
          ? strings.settings.permissionGranted
          : strings.settings.permissionDenied}
      </Text>
      {permission !== 'granted' ? (
        <Button label={strings.settings.allowNotifications} onPress={() => void allow()} />
      ) : null}
      {permission === 'denied' && Platform.OS !== 'web' ? (
        <Button
          label={strings.settings.openSystemSettings}
          onPress={() => void Linking.openSettings()}
          tone="secondary"
        />
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
        }}
      >
        <Button
          label={
            enabled
              ? `${strings.settings.summary}: ligado`
              : `${strings.settings.summary}: desligado`
          }
          onPress={() => void toggle(!enabled)}
          tone={enabled ? 'primary' : 'secondary'}
        />
        {[7, 8, 12, 18].map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={`${strings.settings.summaryTime} ${item}:00`}
            onPress={() => void pickHour(item)}
            style={{
              minHeight: 44,
              minWidth: 44,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.radii.chip,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: hour === item ? theme.colors.primary : theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              allowFontScaling
              style={{
                color: hour === item ? theme.colors.background : theme.colors.text,
                ...theme.typography.caption,
              }}
            >
              {String(item).padStart(2, '0')}:00
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
