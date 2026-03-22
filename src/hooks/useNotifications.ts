import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notifications_enabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const hasNotificationBeenSent = async (
    reminderType: 'D-7' | 'D-3' | 'D-1'
  ): Promise<boolean> => {
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('notification_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('reminder_type', reminderType)
      .eq('sent_date', today)
      .maybeSingle();

    if (error) {
      console.error('Error checking notification record:', error);
      return false;
    }

    return !!data;
  };

  const recordNotificationSent = async (reminderType: 'D-7' | 'D-3' | 'D-1'): Promise<boolean> => {
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('notification_records')
      .insert({
        user_id: user.id,
        reminder_type: reminderType,
        sent_date: today,
      });

    if (error) {
      console.error('Error recording notification:', error);
      return false;
    }

    return true;
  };

  return {
    notificationsEnabled,
    setNotificationsEnabled,
    hasNotificationBeenSent,
    recordNotificationSent,
  };
}
