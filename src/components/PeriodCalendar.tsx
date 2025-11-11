import { Trash2, Edit2 } from 'lucide-react';
import { Period, formatDate, getDaysBetween } from '../utils/periodUtils';

interface PeriodCalendarProps {
  periods: Period[];
  onDeletePeriod: (id: string) => void;
  onEditPeriod: (period: Period) => void;
  nextPeriodDate: string | null;
}

export default function PeriodCalendar({
  periods,
  onDeletePeriod,
  onEditPeriod,
  nextPeriodDate,
}: PeriodCalendarProps) {
  if (periods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No periods tracked yet</p>
        <p className="text-gray-400 text-sm">Click "Add Period" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nextPeriodDate && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Predicted Next Period</p>
          <p className="text-lg font-semibold text-gray-800">{formatDate(nextPeriodDate)}</p>
        </div>
      )}

      <div className="space-y-3">
        {periods.map((period, index) => {
          const periodLength = getDaysBetween(period.startDate, period.endDate) + 1;
          let cycleLength = null;

          if (index < periods.length - 1) {
            cycleLength = getDaysBetween(period.startDate, periods[index + 1].startDate);
          }

          return (
            <div
              key={period.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-gray-800">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                    {periodLength} {periodLength === 1 ? 'day' : 'days'}
                  </span>
                </div>
                {cycleLength !== null && (
                  <p className="text-sm text-gray-500">Cycle: {cycleLength} days</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditPeriod(period)}
                  className="text-gray-400 hover:text-blue-500 transition-colors p-2"
                  aria-label="Edit period"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeletePeriod(period.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  aria-label="Delete period"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
