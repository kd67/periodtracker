import { useState, useEffect } from 'react';
import { Calendar, Plus, Droplets } from 'lucide-react';
import PeriodCalendar from './components/PeriodCalendar';
import StatsPanel from './components/StatsPanel';
import AddPeriodModal from './components/AddPeriodModal';
import { Period, calculateCycleStats } from './utils/periodUtils';

function App() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('periods');
    if (saved) {
      setPeriods(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('periods', JSON.stringify(periods));
  }, [periods]);

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
          <StatsPanel stats={stats} />
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
