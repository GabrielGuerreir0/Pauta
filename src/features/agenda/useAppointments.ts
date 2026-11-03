import { useCallback, useEffect, useState } from 'react';

import {
  createAppointment,
  deleteAppointment,
  listAppointments,
  restoreAppointment,
  setAppointmentDone,
  type Appointment,
  type AppointmentInput,
} from '@/features/agenda/db';

export function useAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listAppointments()
      .then((rows) => {
        if (!cancelled) {
          setItems(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const save = useCallback(
    async (input: AppointmentInput) => {
      await createAppointment(input);
      await reload();
    },
    [reload],
  );

  const toggle = useCallback(
    async (item: Appointment) => {
      await setAppointmentDone(item.id, !item.done);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (item: Appointment) => {
      await deleteAppointment(item.id);
      await reload();
    },
    [reload],
  );

  const restore = useCallback(
    async (item: Appointment) => {
      await restoreAppointment(item);
      await reload();
    },
    [reload],
  );

  return { items, ready, error, reload, save, toggle, remove, restore };
}
