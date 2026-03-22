export interface Period {
  id: string;
  startDate: string;
  endDate: string;
}

export interface CycleStats {
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  nextPeriodDate: string | null;
}

export function calculateCycleStats(periods: Period[]): CycleStats {
  if (periods.length === 0) {
    return {
      averageCycleLength: null,
      averagePeriodLength: null,
      nextPeriodDate: null,
    };
  }

  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const periodLengths = sortedPeriods.map((period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  const averagePeriodLength =
    periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length;

  let averageCycleLength: number | null = null;
  let nextPeriodDate: string | null = null;

  if (sortedPeriods.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < sortedPeriods.length; i++) {
      const prevStart = new Date(sortedPeriods[i - 1].startDate);
      const currStart = new Date(sortedPeriods[i].startDate);
      const cycleLength = Math.round(
        (currStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(cycleLength);
    }

    averageCycleLength =
      cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;

    const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
    const lastStart = new Date(lastPeriod.startDate);
    const predictedNext = new Date(lastStart);
    predictedNext.setDate(predictedNext.getDate() + Math.round(averageCycleLength));
    nextPeriodDate = predictedNext.toISOString().split('T')[0];
  }

  return {
    averageCycleLength: averageCycleLength ? Math.round(averageCycleLength) : null,
    averagePeriodLength: Math.round(averagePeriodLength),
    nextPeriodDate,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysUntilDate(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getReminderDates(nextPeriodDate: string | null): { daysUntil: number; message: string }[] {
  if (!nextPeriodDate) return [];

  const reminders = [
    { days: 7, label: 'D-7' },
    { days: 3, label: 'D-3' },
    { days: 1, label: 'D-1' },
  ];

  return reminders
    .map((reminder) => {
      const daysUntil = getDaysUntilDate(nextPeriodDate);
      return {
        daysUntil,
        message: `Period expected in ${reminder.days} day${reminder.days > 1 ? 's' : ''}`,
        label: reminder.label,
        triggerDay: daysUntil <= reminder.days && daysUntil > reminder.days - 1,
      };
    })
    .filter((r) => r.triggerDay);
}
