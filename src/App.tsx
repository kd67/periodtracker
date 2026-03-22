import { useState, useEffect } from 'react';
import { Calendar, Plus, Droplets } from 'lucide-react';
import PeriodCalendar from './components/PeriodCalendar';
import StatsPanel from './components/StatsPanel';
import RemindersPanel from './components/RemindersPanel';
import AddPeriodModal from './components/AddPeriodModal';
import { Period, calculateCycleStats, getDaysUntilDate } from './utils/periodUtils';
import { notificationManager } from './utils/notificationManager';
import { useAuth } from './context/AuthContext';
import { usePeriods } from './hooks/usePeriods';
import { useNotifications } from './hooks/useNotifications';

function AppContent() {
  const { loading: authLoading } = useAuth();
  const {
    periods,
    loading: periodsLoading,
    addPeriod: addPeriodToDb,
    updatePeriod: updatePeriodInDb,
    deletePeriod: deletePeriodFromDb,
  } = usePeriods();
  const { notificationsEnabled, setNotificationsEnabled, hasNotificationBeenSent, recordNotificationSent } = useNotifications();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  useEffect(() => {
    if (!notificationsEnabled || authLoading) return;

    const stats = calculateCycleStats(periods);
    if (!stats.nextPeriodDate) return;

    const daysUntil = getDaysUntilDate(stats.nextPeriodDate);
    const reminders: Array<{ days: number; label: 'D-7' | 'D-3' | 'D-1' }> = [
      { days: 7, label: 'D-7' },
      { days: 3, label: 'D-3' },
      { days: 1, label: 'D-1' },
    ];

    reminders.forEach(async (reminder) => {
      if (daysUntil === reminder.days) {
        const hasBeenSent = await hasNotificationBeenSent(reminder.label);
        if (!hasBeenSent) {
          notificationManager.sendNotification(
            'Period Reminder',
            {
              body: `Your period is expected in ${reminder.days} day${reminder.days > 1 ? 's' : ''}`,
              tag: `period-reminder-${reminder.label}`,
            }
          );
          await recordNotificationSent(reminder.label);
        }
      }
    });
  }, [periods, notificationsEnabled, authLoading, hasNotificationBeenSent, recordNotificationSent]);

  const addPeriod = async (startDate: string, endDate: string) => {
    if (editingPeriod) {
      await updatePeriodInDb(editingPeriod.id, startDate, endDate);
      setEditingPeriod(null);
    } else {
      await addPeriodToDb(startDate, endDate);
    }
    setShowAddModal(false);
  };

  const deletePeriod = async (id: string) => {
    await deletePeriodFromDb(id);
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

  if (authLoading || periodsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
