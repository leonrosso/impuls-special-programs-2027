import type { ReminderDays } from "../notifications";

interface Props {
  supported: boolean;
  permission: NotificationPermission;
  reminderDays: ReminderDays;
  onChangeReminderDays: (days: ReminderDays) => void;
}

const OPTIONS: ReminderDays[] = [1, 3, 7];

export function SettingsPanel({ supported, permission, reminderDays, onChangeReminderDays }: Props) {
  return (
    <section className="settings">
      <h2 className="settings__title">Notifiche</h2>

      {!supported && (
        <p className="status-message">Il tuo browser non supporta le notifiche.</p>
      )}

      {supported && permission === "denied" && (
        <p className="status-message status-message--error">
          Le notifiche sono bloccate per questo sito. Abilitale nelle impostazioni del browser per
          ricevere i promemoria.
        </p>
      )}

      <p className="settings__hint">
        Scegli quanti giorni prima della scadenza vuoi ricevere il promemoria. Vale per tutti gli
        eventi a cui ti iscrivi con la campanella sulla scheda.
      </p>

      <div className="settings__options" role="radiogroup" aria-label="Giorni di preavviso">
        {OPTIONS.map((days) => (
          <label key={days} className="settings__option">
            <input
              type="radio"
              name="reminder-days"
              value={days}
              checked={reminderDays === days}
              onChange={() => onChangeReminderDays(days)}
              disabled={!supported}
            />
            <span>
              {days} giorn{days === 1 ? "o" : "i"} prima
            </span>
          </label>
        ))}
      </div>

      <p className="settings__note">
        I promemoria vengono mostrati mentre l'app è aperta (o installata sul telefono): non è
        previsto un server di invio, quindi funzionano solo quando l'app viene aperta nella
        finestra di preavviso scelta.
      </p>
    </section>
  );
}
