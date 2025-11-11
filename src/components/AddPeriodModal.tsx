import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Period } from '../utils/periodUtils';

interface AddPeriodModalProps {
  onAdd: (startDate: string, endDate: string) => void;
  onClose: () => void;
  editingPeriod?: Period | null;
}

export default function AddPeriodModal({ onAdd, onClose, editingPeriod }: AddPeriodModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPeriod) {
      setStartDate(editingPeriod.startDate);
      setEndDate(editingPeriod.endDate);
    } else {
      setStartDate('');
      setEndDate('');
    }
    setError('');
  }, [editingPeriod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please fill in both dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    onAdd(startDate, endDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{editingPeriod ? 'Edit Period' : 'Add Period'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              {editingPeriod ? 'Update Period' : 'Add Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
