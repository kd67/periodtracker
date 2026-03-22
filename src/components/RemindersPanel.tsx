import { Bell, Check, Clock } from 'lucide-react';
import { getDaysUntilDate } from '../utils/periodUtils';

interface RemindersPanelProps {
  nextPeriodDate: string | null;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export default function RemindersPanel({
  nextPeriodDate,
  notificationsEnabled,
  onToggleNotifications,
}: RemindersPanelProps) {
  const reminders = [
    { days: 7, label: 'D-7' },
    { days: 3, label: 'D-3' },
    { days: 1, label: 'D-1' },
  ];

  const daysUntil = nextPeriodDate ? getDaysUntilDate(nextPeriodDate) : null;

  const getReminderStatus = (reminderDays: number): 'active' | 'upcoming' | 'passed' => {
    if (!daysUntil) return 'passed';
    if (daysUntil === reminderDays) return 'active';
    if (daysUntil > reminderDays) return 'upcoming';
    return 'passed';
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      onToggleNotifications(true);
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onToggleNotifications(true);
      }
    }
  };

  const handleToggle = () => {
    if (!notificationsEnabled) {
      requestNotificationPermission();
    } else {
      onToggleNotifications(false);
    }
  };

  if (!nextPeriodDate) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-semibold text-gray-800">Period Reminders</h3>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
            notificationsEnabled ? 'bg-rose-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {notificationsEnabled && (
        <div className="space-y-2">
          {reminders.map((reminder) => {
            const status = getReminderStatus(reminder.days);
            return (
              <div
                key={reminder.days}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  status === 'active'
                    ? 'bg-rose-50 border border-rose-200'
                    : status === 'upcoming'
                      ? 'bg-gray-50'
                      : 'bg-gray-50 opacity-50'
                }`}
              >
                {status === 'active' ? (
                  <Clock className="w-4 h-4 text-rose-500" />
                ) : status === 'upcoming' ? (
                  <Clock className="w-4 h-4 text-gray-400" />
                ) : (
                  <Check className="w-4 h-4 text-gray-300" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{reminder.label}</p>
                  <p className="text-xs text-gray-500">
                    {status === 'active'
                      ? 'Reminder active today!'
                      : status === 'upcoming'
                        ? `Coming up in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
                        : 'Reminder sent'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!notificationsEnabled && (
        <p className="text-sm text-gray-600">
          Enable reminders to get notified before your period
        </p>
      )}
    </div>
  );
}
