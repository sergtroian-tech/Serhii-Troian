import React, { useState } from 'react';
import {
  Archive,
  Trash2,
  Mail,
  CheckSquare,
  Reply,
  Forward,
  Paperclip,
  Star,
  ExternalLink,
  Send,
  Sparkles,
  Calendar,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { Email, Task } from '../types';

interface EmailDetailProps {
  email: Email;
  linkedTask?: Task;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onArchiveEmail: (id: string) => void;
  onDeleteEmail: (id: string) => void;
  onToggleRead: (id: string) => void;
  onCreateTask: (email: Email) => void;
  onOpenLinkedTask: (taskId: string) => void;
  onSendReply: (emailId: string, replyText: string) => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  linkedTask,
  onToggleStar,
  onArchiveEmail,
  onDeleteEmail,
  onToggleRead,
  onCreateTask,
  onOpenLinkedTask,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);

  const quickTemplates = [
    'Принято в работу, сделаю сегодня до вечера.',
    'Спасибо за информацию! Ознакомился, дам развернутый ответ завтра.',
    'Согласовано без замечаний, можно запускать в работу.',
  ];

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(email.id, replyText);
    setReplyText('');
    setSentFeedback(true);
    setTimeout(() => {
      setSentFeedback(false);
      setShowReplyBox(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Top Action Toolbar */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onArchiveEmail(email.id)}
            title="В архив"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteEmail(email.id)}
            title="Удалить"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleRead(email.id)}
            title="Пометить как непрочитанное"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onToggleStar(email.id, e)}
            title="Добавить в важное"
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              email.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
            }`}
          >
            <Star className="w-4 h-4" fill={email.isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Primary Action: Create Task or Jump to Task */}
        <div>
          {linkedTask ? (
            <button
              onClick={() => onOpenLinkedTask(linkedTask.id)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Задача: {linkedTask.status === 'done' ? 'Завершена' : 'В планировщике'}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => onCreateTask(email)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Создать задачу из письма</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl space-y-6">
        {/* Linked Task Banner if present */}
        {linkedTask && (
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <span>{linkedTask.title}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Срок: {linkedTask.dueDate} {linkedTask.dueTime && `(${linkedTask.dueTime})`}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                  {linkedTask.checklist.length > 0 &&
                    `Подзадач: ${linkedTask.checklist.filter((c) => c.completed).length}/${linkedTask.checklist.length} · `}
                  Приоритет: {linkedTask.priority}
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpenLinkedTask(linkedTask.id)}
              className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              Перейти к задаче →
            </button>
          </div>
        )}

        {/* Email Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
            {email.subject}
          </h1>

          <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${email.sender.color} text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs`}
              >
                {email.sender.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {email.sender.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    &lt;{email.sender.email}&gt;
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Кому: {email.to.join(', ')}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {email.date}, {email.time}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                {email.labels.map((lbl) => (
                  <span key={lbl}>#{lbl}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-body whitespace-pre-line space-y-4">
          {email.body}
        </div>

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Вложения ({email.attachments.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {email.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {att.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {att.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Загрузка файла ${att.name}...`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                    title="Скачать файл"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Reply & Workflow Actions */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          {!showReplyBox ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReplyBox(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Reply className="w-4 h-4" />
                <span>Ответить</span>
              </button>
              <button
                onClick={() => setShowReplyBox(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Forward className="w-4 h-4" />
                <span>Переслать</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Быстрый ответ для {email.sender.name}
                </span>
                <button
                  onClick={() => setShowReplyBox(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Свернуть
                </button>
              </div>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => setReplyText(tpl)}
                    className="text-[11px] px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
                  >
                    "{tpl}"
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Введите текст ответа..."
                className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {sentFeedback && (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Ответ отправлен!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Отправить</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
