import * as SQLite from 'expo-sqlite';
import { z } from 'zod';

import { syncAppointmentReminder } from '@/services/reminders';

const rowSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  starts_at: z.string(),
  reminder_minutes: z.number().nullable(),
  done: z.number(),
});

export type Appointment = {
  id: string;
  title: string;
  notes: string;
  startsAt: string;
  reminderMinutes: number | null;
  done: boolean;
};

export type AppointmentInput = {
  title: string;
  notes: string;
  startsAt: string;
  reminderMinutes: number | null;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function database(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('pauta.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          starts_at TEXT NOT NULL,
          reminder_minutes INTEGER,
          done INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    });
  }
  return databasePromise;
}

function toAppointment(row: z.infer<typeof rowSchema>): Appointment {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    startsAt: row.starts_at,
    reminderMinutes: row.reminder_minutes,
    done: row.done === 1,
  };
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await database();
  const rows = await db.getAllAsync('SELECT * FROM appointments ORDER BY starts_at ASC');
  return rows.flatMap((row) => {
    const parsed = rowSchema.safeParse(row);
    return parsed.success ? [toAppointment(parsed.data)] : [];
  });
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  const db = await database();
  const item: Appointment = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    notes: input.notes.trim(),
    startsAt: input.startsAt,
    reminderMinutes: input.reminderMinutes,
    done: false,
  };
  await db.runAsync(
    'INSERT INTO appointments (id, title, notes, starts_at, reminder_minutes, done) VALUES (?, ?, ?, ?, ?, 0)',
    item.id,
    item.title,
    item.notes,
    item.startsAt,
    item.reminderMinutes,
  );
  await syncAppointmentReminder(item);
  return item;
}

export async function setAppointmentDone(id: string, done: boolean): Promise<void> {
  const db = await database();
  await db.runAsync('UPDATE appointments SET done = ? WHERE id = ?', done ? 1 : 0, id);
}

export async function deleteAppointment(id: string): Promise<Appointment | null> {
  const db = await database();
  const rows = await db.getAllAsync('SELECT * FROM appointments WHERE id = ?', id);
  const parsed = rowSchema.safeParse(rows[0]);
  await db.runAsync('DELETE FROM appointments WHERE id = ?', id);
  await syncAppointmentReminder({
    id,
    title: '',
    startsAt: new Date(0).toISOString(),
    reminderMinutes: null,
  });
  return parsed.success ? toAppointment(parsed.data) : null;
}

export async function restoreAppointment(item: Appointment): Promise<void> {
  const db = await database();
  await db.runAsync(
    'INSERT INTO appointments (id, title, notes, starts_at, reminder_minutes, done) VALUES (?, ?, ?, ?, ?, ?)',
    item.id,
    item.title,
    item.notes,
    item.startsAt,
    item.reminderMinutes,
    item.done ? 1 : 0,
  );
  await syncAppointmentReminder(item);
}
