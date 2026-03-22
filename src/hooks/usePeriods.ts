import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Period } from '../utils/periodUtils';
import { useAuth } from '../context/AuthContext';

export function usePeriods() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPeriods = async () => {
      try {
        const { data, error } = await supabase
          .from('periods')
          .select('id, start_date, end_date')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (error) throw error;

        const formattedPeriods: Period[] = (data || []).map((p) => ({
          id: p.id,
          startDate: p.start_date,
          endDate: p.end_date,
        }));

        setPeriods(formattedPeriods);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch periods';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, [user]);

  const addPeriod = async (startDate: string, endDate: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('periods')
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
        })
        .select('id, start_date, end_date')
        .single();

      if (error) throw error;

      const newPeriod: Period = {
        id: data.id,
        startDate: data.start_date,
        endDate: data.end_date,
      };

      setPeriods([newPeriod, ...periods].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add period';
      setError(message);
      return false;
    }
  };

  const updatePeriod = async (id: string, startDate: string, endDate: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('periods')
        .update({
          start_date: startDate,
          end_date: endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const updated = periods.map(p =>
        p.id === id ? { ...p, startDate, endDate } : p
      ).sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      setPeriods(updated);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update period';
      setError(message);
      return false;
    }
  };

  const deletePeriod = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPeriods(periods.filter(p => p.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete period';
      setError(message);
      return false;
    }
  };

  return {
    periods,
    loading,
    error,
    addPeriod,
    updatePeriod,
    deletePeriod,
  };
}
