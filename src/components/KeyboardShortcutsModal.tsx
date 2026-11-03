import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'C', description: 'Написать новое письмо (Compose)' },
    { key: 'T', description: 'Создать новую задачу в планировщике' },
    { key: '/', description: 'Быстрый фокус на поиск' },
    { key: '1', description: 'Режим раздельного экрана (Сплит)' },
    { key: '2', description: 'Режим фокуса на почте' },
    { key: '3', description: 'Режим фокуса на планировщике задач' },
    { key: 'E', description: 'Архивировать выбранное письмо' },
    { key: 'S', description: 'Добавить в избранное / снять звездочку' },
    { key: 'Esc', description: 'Закрыть модальное окно' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              Горячие клавиши
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">
                {sc.description}
              </span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px] min-w-[28px] text-center shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
