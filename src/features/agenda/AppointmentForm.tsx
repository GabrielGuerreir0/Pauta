import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';

import type { AppointmentInput } from '@/features/agenda/db';
import { strings } from '@/shared/i18n';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { useTheme } from '@/shared/theme';

function startTime(day: Date): Date {
  const next = new Date(day);
  const now = new Date();
  const sameDay = next.toDateString() === now.toDateString();
  next.setHours(sameDay ? now.getHours() + 1 : 9, 0, 0, 0);
  return next;
}

const reminders: { label: string; value: number | null }[] = [
  { label: strings.agenda.reminderNone, value: null },
  { label: strings.agenda.reminderOnTime, value: 0 },
  { label: strings.agenda.reminder10, value: 10 },
  { label: strings.agenda.reminderHour, value: 60 },
  { label: strings.agenda.reminderDay, value: 1440 },
];

type AppointmentFormProps = {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSave: (input: AppointmentInput) => Promise<void>;
};

export function AppointmentForm({ visible, initialDate, onClose, onSave }: AppointmentFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [when, setWhen] = useState(() => startTime(initialDate));
  const [reminder, setReminder] = useState<number | null>(10);
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [message, setMessage] = useState('');

  async function submit() {
    if (title.trim().length === 0) {
      setMessage(strings.agenda.required);
      return;
    }
    try {
      await onSave({
        title,
        notes,
        startsAt: when.toISOString(),
        reminderMinutes: reminder,
      });
    } catch {
      setMessage(strings.agenda.saveFailed);
      return;
    }
    setTitle('');
    setNotes('');
    setMessage('');
    onClose();
  }

  return (
    <BottomSheet visible={visible} title={strings.agenda.newItem} onClose={onClose}>
      <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.caption }}>
        {strings.agenda.titleLabel}
      </Text>
      <TextInput
        accessibilityLabel={strings.agenda.titleLabel}
        value={title}
        onChangeText={setTitle}
        placeholder={strings.agenda.titlePlaceholder}
        placeholderTextColor={theme.colors.textMuted}
        style={{
          minHeight: 44,
          color: theme.colors.text,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.button,
          paddingHorizontal: theme.spacing.sm,
          marginTop: theme.spacing.xxs,
          marginBottom: theme.spacing.sm,
          ...theme.typography.body,
        }}
      />
      <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.caption }}>
        {strings.agenda.notesLabel}
      </Text>
      <TextInput
        accessibilityLabel={strings.agenda.notesLabel}
        value={notes}
        onChangeText={setNotes}
        placeholder={strings.agenda.notesPlaceholder}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        style={{
          minHeight: 72,
          color: theme.colors.text,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.button,
          paddingHorizontal: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          marginTop: theme.spacing.xxs,
          marginBottom: theme.spacing.sm,
          ...theme.typography.body,
        }}
      />
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginBottom: theme.spacing.sm }}>
        <Button
          label={`${strings.agenda.date}: ${when.toLocaleDateString('pt-BR')}`}
          onPress={() => setPicker('date')}
          tone="secondary"
        />
        <Button
          label={`${strings.agenda.time}: ${when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          onPress={() => setPicker('time')}
          tone="secondary"
        />
      </View>
      {picker ? (
        <DateTimePicker
          value={when}
          mode={picker}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, selected) => {
            if (Platform.OS !== 'ios') {
              setPicker(null);
            }
            if (selected) {
              setWhen(selected);
            }
          }}
        />
      ) : null}
      <Text
        allowFontScaling
        style={{
          color: theme.colors.text,
          marginBottom: theme.spacing.xs,
          ...theme.typography.caption,
        }}
      >
        {strings.agenda.reminder}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
        {reminders.map((item) => (
          <Chip
            key={item.label}
            label={item.label}
            selected={reminder === item.value}
            onPress={() => setReminder(item.value)}
          />
        ))}
      </View>
      {message ? (
        <Text
          allowFontScaling
          style={{
            color: theme.colors.danger,
            marginTop: theme.spacing.sm,
            ...theme.typography.caption,
          }}
        >
          {message}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        }}
      >
        <Button label={strings.agenda.cancel} onPress={onClose} tone="ghost" />
        <Button label={strings.agenda.save} onPress={() => void submit()} />
      </View>
    </BottomSheet>
  );
}
