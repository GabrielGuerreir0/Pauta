import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCalendars } from 'expo-localization';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppointmentForm } from '@/features/agenda/AppointmentForm';
import type { Appointment } from '@/features/agenda/db';
import { useAppointments } from '@/features/agenda/useAppointments';
import { strings } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useTheme } from '@/shared/theme';

export default function AgendaScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const agenda = useAppointments();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [formSession, setFormSession] = useState(0);
  const [removed, setRemoved] = useState<Appointment | null>(null);
  const hour12 = getCalendars()[0]?.uses24hourClock === false;
  const days = eachDayOfInterval({
    start: startOfWeek(cursor, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });
  const selectedKey = format(selected, 'yyyy-MM-dd');
  const marked = new Set(agenda.items.map((item) => format(parseISO(item.startsAt), 'yyyy-MM-dd')));
  const dayItems = agenda.items.filter(
    (item) => format(parseISO(item.startsAt), 'yyyy-MM-dd') === selectedKey,
  );

  async function remove(item: Appointment) {
    setRemoved(item);
    await agenda.remove(item);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 96,
        }}
      >
        <Text
          accessibilityRole="header"
          allowFontScaling
          style={{ color: theme.colors.text, ...theme.typography.title }}
        >
          {strings.agenda.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: theme.spacing.sm,
          }}
        >
          <Button label="‹" onPress={() => setCursor(addMonths(cursor, -1))} tone="ghost" />
          <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
            {format(cursor, 'MMMM yyyy', { locale: ptBR })}
          </Text>
          <Button label="›" onPress={() => setCursor(addMonths(cursor, 1))} tone="ghost" />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const active = isSameDay(day, selected);
            const inMonth = isSameMonth(day, cursor);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={format(day, "d 'de' MMMM", { locale: ptBR })}
                onPress={() => setSelected(day)}
                style={{
                  width: '14.28%',
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radii.button,
                  backgroundColor: active ? theme.colors.primary : 'transparent',
                }}
              >
                <Text
                  allowFontScaling
                  style={{
                    color: active
                      ? theme.colors.background
                      : inMonth
                        ? theme.colors.text
                        : theme.colors.textMuted,
                    ...theme.typography.caption,
                  }}
                >
                  {format(day, 'd')}
                </Text>
                {marked.has(key) ? (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: active ? theme.colors.background : theme.colors.primary,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {agenda.error ? (
          <ErrorState
            message={strings.today.offline}
            actionLabel={strings.today.retry}
            onAction={() => void agenda.reload()}
          />
        ) : null}

        <Text
          allowFontScaling
          style={{
            color: theme.colors.text,
            marginTop: theme.spacing.lg,
            ...theme.typography.body,
          }}
        >
          {format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </Text>
        {dayItems.length === 0 ? (
          <EmptyState title={strings.agenda.emptyTitle} message={strings.agenda.emptyMessage} />
        ) : (
          dayItems.map((item) => (
            <View key={item.id} style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
              <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
                {format(parseISO(item.startsAt), hour12 ? 'h:mm a' : 'HH:mm')} · {item.title}
              </Text>
              {item.notes ? (
                <Text
                  allowFontScaling
                  style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
                >
                  {item.notes}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                <Button
                  label={item.done ? strings.agenda.reopen : strings.agenda.done}
                  onPress={() => void agenda.toggle(item)}
                  tone="secondary"
                />
                <Button
                  label={strings.agenda.delete}
                  onPress={() => void remove(item)}
                  tone="ghost"
                />
              </View>
            </View>
          ))
        )}
        {removed ? (
          <View style={{ marginTop: theme.spacing.md }}>
            <Text
              allowFontScaling
              style={{ color: theme.colors.text, ...theme.typography.caption }}
            >
              {strings.agenda.deleted}
            </Text>
            <Button
              label={strings.agenda.undo}
              tone="secondary"
              onPress={() => {
                void agenda.restore(removed);
                setRemoved(null);
              }}
            />
          </View>
        ) : null}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: insets.bottom + theme.spacing.lg,
        }}
      >
        <Button
          label="+"
          onPress={() => {
            setFormSession((value) => value + 1);
            setOpen(true);
          }}
        />
      </View>
      <AppointmentForm
        key={formSession}
        visible={open}
        initialDate={selected}
        onClose={() => setOpen(false)}
        onSave={agenda.save}
      />
    </View>
  );
}
