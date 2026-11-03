import { TaskPriority, TaskStatus } from '../types';

export const playChime = (type: 'complete' | 'click' | 'create') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'complete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'create') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {
    // Ignore audio failures if restricted by browser autoplay
  }
};

export const formatDueDateDisplay = (dateStr: string): { label: string; isOverdue: boolean; isToday: boolean } => {
  if (!dateStr) return { label: 'Без срока', isOverdue: false, isToday: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Просрочено на ${Math.abs(diffDays)} дн.`,
      isOverdue: true,
      isToday: false,
    };
  }
  if (diffDays === 0) {
    return { label: 'Сегодня', isOverdue: false, isToday: true };
  }
  if (diffDays === 1) {
    return { label: 'Завтра', isOverdue: false, isToday: false };
  }
  if (diffDays === 2) {
    return { label: 'Послезавтра', isOverdue: false, isToday: false };
  }

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return {
    label: target.toLocaleDateString('ru-RU', options),
    isOverdue: false,
    isToday: false,
  };
};

export const getPriorityDetails = (priority: TaskPriority) => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Срочный',
        textColor: 'text-rose-600 dark:text-rose-400',
        dotColor: 'bg-rose-500',
        badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
        order: 1,
      };
    case 'high':
      return {
        label: 'Высокий',
        textColor: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        order: 2,
      };
    case 'medium':
      return {
        label: 'Средний',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        dotColor: 'bg-indigo-500',
        badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
        order: 3,
      };
    case 'low':
    default:
      return {
        label: 'Обычный',
        textColor: 'text-slate-500 dark:text-slate-400',
        dotColor: 'bg-slate-400',
        badgeBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        order: 4,
      };
  }
};

export const getStatusDetails = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return { label: 'К выполнению', badgeClass: 'text-slate-600 dark:text-slate-300' };
    case 'in_progress':
      return { label: 'В процессе', badgeClass: 'text-blue-600 dark:text-blue-400' };
    case 'waiting':
      return { label: 'Ожидает ответа', badgeClass: 'text-amber-600 dark:text-amber-400' };
    case 'done':
      return { label: 'Завершено', badgeClass: 'text-emerald-600 dark:text-emerald-400' };
  }
};
