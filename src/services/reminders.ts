import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_CHANNEL = 'reminders';
const SUMMARY_CHANNEL = 'daily-summary';
const ANDROID_IMPORTANCE_DEFAULT = 5;

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: 'Lembretes',
    importance: ANDROID_IMPORTANCE_DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(SUMMARY_CHANNEL, {
    name: 'Resumo diário',
    importance: ANDROID_IMPORTANCE_DEFAULT,
  });
}

export async function notificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') {
    return 'denied';
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return 'granted';
  }
  if (current.status === 'denied') {
    return 'denied';
  }
  return 'undetermined';
}

export async function askNotificationPermission(): Promise<'granted' | 'denied'> {
  if (Platform.OS === 'web') {
    return 'denied';
  }
  const result = await Notifications.requestPermissionsAsync();
  return result.status === 'granted' ? 'granted' : 'denied';
}

export async function syncAppointmentReminder(item: {
  id: string;
  title: string;
  startsAt: string;
  reminderMinutes: number | null;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await ensureNotificationChannels();
  await Notifications.cancelScheduledNotificationAsync(item.id).catch(() => undefined);
  if (item.reminderMinutes === null) {
    return;
  }
  const permission = await notificationPermission();
  if (permission !== 'granted') {
    return;
  }
  const when = new Date(new Date(item.startsAt).getTime() - item.reminderMinutes * 60_000);
  if (when.getTime() <= Date.now()) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: item.id,
    content: { title: item.title, body: 'Seu compromisso está chegando.', sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: REMINDER_CHANNEL,
    },
  });
}

export async function syncDailySummary(input: {
  enabled: boolean;
  hour: number;
  minute: number;
  body: string;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await ensureNotificationChannels();
  await Notifications.cancelScheduledNotificationAsync(SUMMARY_CHANNEL).catch(() => undefined);
  if (!input.enabled) {
    return;
  }
  const permission = await notificationPermission();
  if (permission !== 'granted') {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: SUMMARY_CHANNEL,
    content: { title: 'Pauta', body: input.body, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: input.hour,
      minute: input.minute,
      channelId: SUMMARY_CHANNEL,
    },
  });
}
