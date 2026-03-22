import { useState, useEffect } from 'react';
import { Calendar, Plus, Droplets } from 'lucide-react';
import PeriodCalendar from './components/PeriodCalendar';
import StatsPanel from './components/StatsPanel';
import RemindersPanel from './components/RemindersPanel';
import AddPeriodModal from './components/AddPeriodModal';
import { Period, calculateCycleStats, getDaysUntilDate } from './utils/periodUtils';
import { notificationManager } from './utils/notificationManager';

function App() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notifications_enabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const saved = localStorage.getItem('periods');
    if (saved) {
      setPeriods(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('periods', JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem('notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const stats = calculateCycleStats(periods);
    if (!stats.nextPeriodDate) return;

    const daysUntil = getDaysUntilDate(stats.nextPeriodDate);
    const reminders: Array<{ days: number; label: 'D-7' | 'D-3' | 'D-1' }> = [
      { days: 7, label: 'D-7' },
      { days: 3, label: 'D-3' },
      { days: 1, label: 'D-1' },
    ];

    reminders.forEach((reminder) => {
      if (
        daysUntil === reminder.days &&
        !notificationManager.hasNotificationBeenSent(reminder.label, stats.nextPeriodDate)
      ) {
        notificationManager.sendNotification(
          'Period Reminder',
          {
            body: `Your period is expected in ${reminder.days} day${reminder.days > 1 ? 's' : ''}`,
            tag: `period-reminder-${reminder.label}`,
          }
        );
        notificationManager.recordNotificationSent(reminder.label);
      }
    });
  }, [periods, notificationsEnabled]);

  const addPeriod = (startDate: string, endDate: string) => {
    if (editingPeriod) {
      const updated = periods.map(p =>
        p.id === editingPeriod.id ? { ...p, startDate, endDate } : p
      ).sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setPeriods(updated);
      setEditingPeriod(null);
    } else {
      const newPeriod: Period = {
        id: Date.now().toString(),
        startDate,
        endDate,
      };
      setPeriods([...periods, newPeriod].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
    }
    setShowAddModal(false);
  };

  const deletePeriod = (id: string) => {
    setPeriods(periods.filter(p => p.id !== id));
  };

  const handleEditPeriod = (period: Period) => {
    setEditingPeriod(period);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPeriod(null);
  };

  const stats = calculateCycleStats(periods);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Droplets className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-800">Period Tracker</h1>
          </div>
          <p className="text-gray-600">Track your cycle privately in your browser</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <StatsPanel stats={stats} />
          </div>
          <RemindersPanel
            nextPeriodDate={stats.nextPeriodDate}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-gray-800">Your Periods</h2>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>

          <PeriodCalendar
            periods={periods}
            onDeletePeriod={deletePeriod}
            onEditPeriod={handleEditPeriod}
            nextPeriodDate={stats.nextPeriodDate}
          />
        </div>

        {showAddModal && (
          <AddPeriodModal
            onAdd={addPeriod}
            onClose={handleCloseModal}
            editingPeriod={editingPeriod}
          />
        )}
      </div>
    </div>
  );
}

export default App;
