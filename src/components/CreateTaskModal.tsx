import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Mail,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Email, Task, TaskPriority } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  sourceEmail?: Email | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  sourceEmail,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [estimateMinutes, setEstimateMinutes] = useState<number>(30);
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Auto-fill when sourceEmail is provided
  useEffect(() => {
    if (sourceEmail) {
      setTitle(`Ответить: ${sourceEmail.subject}`);
      setDescription(`По письму от ${sourceEmail.sender.name} (${sourceEmail.sender.email})\n\n«${sourceEmail.snippet}»`);
      setPriority(sourceEmail.labels.includes('Срочно') ? 'urgent' : 'high');
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setChecklistItems([
        { id: 'c-1', text: 'Изучить подробности письма и вложения', completed: false },
        { id: 'c-2', text: 'Подготовить ответ / решение задачи', completed: false },
      ]);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setChecklistItems([]);
    }
  }, [sourceEmail, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      dueDate,
      dueTime,
      estimateMinutes,
      emailId: sourceEmail?.id,
      emailSubject: sourceEmail?.subject,
      emailSender: sourceEmail?.sender.name,
      tags: sourceEmail ? [...sourceEmail.labels, 'Из почты'] : ['Задачи'],
      checklist: checklistItems,
    });
    onClose();
  };

  const setRelativeDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              {sourceEmail ? 'Создать задачу из письма' : 'Новая задача'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {sourceEmail && (
            <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
              <Mail className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <div className="truncate">
                <span className="font-semibold">{sourceEmail.sender.name}: </span>
                <span>{sourceEmail.subject}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Название задачи *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Описание / Заметки
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Контекст, детали или ссылки..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-body"
            />
          </div>

          {/* Due Date & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Срок выполнения
              </label>
              <div className="flex items-center gap-1 mb-1.5">
                <button
                  type="button"
                  onClick={() => setRelativeDate(0)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 rounded cursor-pointer"
                >
                  Сегодня
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(1)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 rounded cursor-pointer"
                >
                  Завтра
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(3)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 rounded cursor-pointer"
                >
                  Через 3 дня
                </button>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="urgent">Срочный (Критично)</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Обычный</option>
              </select>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Оценка времени:</span>
                <select
                  value={estimateMinutes}
                  onChange={(e) => setEstimateMinutes(Number(e.target.value))}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 font-mono"
                >
                  <option value={15}>15 мин</option>
                  <option value={30}>30 мин</option>
                  <option value={45}>45 мин</option>
                  <option value={60}>1 час</option>
                  <option value={120}>2 часа</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist Builder */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Подзадачи ({checklistItems.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {checklistItems.map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                >
                  <span className="truncate text-slate-800 dark:text-slate-200">
                    • {chk.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(chk.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Добавить подзадачу..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer font-medium"
              >
                + Пункт
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Сохранить задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
