import { TrendingUp, Clock, CalendarDays } from 'lucide-react';
import { CycleStats } from '../utils/periodUtils';

interface StatsPanelProps {
  stats: CycleStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <>
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        label="Avg Cycle Length"
        value={stats.averageCycleLength ? `${stats.averageCycleLength} days` : 'Add 2+ periods'}
        color="rose"
      />
      <StatCard
        icon={<Clock className="w-6 h-6" />}
        label="Avg Period Length"
        value={stats.averagePeriodLength ? `${stats.averagePeriodLength} days` : 'No data yet'}
        color="pink"
      />
      <StatCard
        icon={<CalendarDays className="w-6 h-6" />}
        label="Next Period"
        value={
          stats.nextPeriodDate
            ? new Date(stats.nextPeriodDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : 'Add 2+ periods'
        }
        color="purple"
      />
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'rose' | 'pink' | 'purple';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    rose: 'bg-rose-100 text-rose-600',
    pink: 'bg-pink-100 text-pink-600',
    purple: 'bg-violet-100 text-violet-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
