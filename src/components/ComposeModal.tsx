import React, { useState } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Email } from '../types';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (newEmail: {
    to: string;
    subject: string;
    body: string;
    labels: string[];
  }) => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSendEmail,
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [label, setLabel] = useState('Проекты');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;

    onSendEmail({
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      labels: [label],
    });

    setTo('');
    setCc('');
    setSubject('');
    setBody('');
    onClose();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-8 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-t-xl w-72 px-4 py-2.5 flex items-center justify-between cursor-pointer">
        <span
          onClick={() => setIsMinimized(false)}
          className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
        >
          {subject || 'Новое сообщение (черновик)'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 sm:right-12 z-50 w-full sm:w-[560px] max-w-[95vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-2xl flex flex-col overflow-hidden max-h-[85vh]">
      {/* Compose Header */}
      <div className="h-12 px-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold">Новое сообщение</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compose Form */}
      <form onSubmit={handleSend} className="flex-1 flex flex-col p-4 space-y-2.5 overflow-y-auto">
        {/* Recipient */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
          <span className="w-16 text-slate-400">Кому:</span>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          {!showCc && (
            <button
              type="button"
              onClick={() => setShowCc(true)}
              className="text-[11px] text-slate-400 hover:text-indigo-600 cursor-pointer"
            >
              Копия
            </button>
          )}
        </div>

        {/* CC */}
        {showCc && (
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
            <span className="w-16 text-slate-400">Копия:</span>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="дополнительные получатели..."
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
          <span className="w-16 text-slate-400">Тема:</span>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема письма..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
          />
        </div>

        {/* Body */}
        <textarea
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Текст сообщения..."
          className="w-full flex-1 min-h-[160px] p-2 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-body leading-relaxed"
        />

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!to.trim() || !subject.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Прикрепление файлов поддерживается: выберите файл')}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Прикрепить файл"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="Проекты">#Проекты</option>
              <option value="Клиенты">#Клиенты</option>
              <option value="Финансы">#Финансы</option>
              <option value="Срочно">#Срочно</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Удалить черновик"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
