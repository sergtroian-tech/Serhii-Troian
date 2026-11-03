import React, { useState } from 'react';
import {
  Search,
  Star,
  Paperclip,
  CheckSquare,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Plus,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  onArchiveEmail: (id: string, e: React.MouseEvent) => void;
  onDeleteEmail: (id: string, e: React.MouseEvent) => void;
  onCreateTaskFromEmail: (email: Email, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  folderTitle: string;
  onBulkArchive: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkMarkRead: (ids: string[], isRead: boolean) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  onToggleRead,
  onArchiveEmail,
  onDeleteEmail,
  onCreateTaskFromEmail,
  searchQuery,
  onSearchChange,
  folderTitle,
  onBulkArchive,
  onBulkDelete,
  onBulkMarkRead,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(emails.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Search Header Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по теме, отправителю или тексту..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List Toolbar / Bulk selection */}
      <div className="h-10 px-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        {selectedIds.length > 0 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === emails.length && emails.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Выбрано: {selectedIds.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onBulkMarkRead(selectedIds, true);
                  clearSelection();
                }}
                title="Отметить прочитанным"
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors"
              >
                <MailOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onBulkArchive(selectedIds);
                  clearSelection();
                }}
                title="В архив"
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onBulkDelete(selectedIds);
                  clearSelection();
                }}
                title="Удалить"
                className="p-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearSelection}
                className="text-[11px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={false}
                onChange={handleSelectAll}
                disabled={emails.length === 0}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {folderTitle}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {emails.length} {emails.length === 1 ? 'письмо' : emails.length < 5 ? 'письма' : 'писем'}
            </span>
          </div>
        )}
      </div>

      {/* Email List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-48">
            <Mail className="w-8 h-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              В этой папке пусто
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Новые письма будут появляться здесь автоматически
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isSelected = selectedEmailId === email.id;
            const isChecked = selectedIds.includes(email.id);

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={`group relative px-3 py-3 cursor-pointer transition-colors border-l-2 ${
                  isSelected
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-l-indigo-600'
                    : !email.isRead
                    ? 'bg-white dark:bg-slate-900 border-l-indigo-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    : 'bg-white dark:bg-slate-900 border-l-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Selection & Star Column */}
                  <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => handleToggleSelectOne(email.id, e)}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <button
                      onClick={(e) => onToggleStar(email.id, e)}
                      className={`p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        email.isStarred
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 hover:text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        fill={email.isStarred ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  {/* Main Email Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-xs truncate ${
                          !email.isRead
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {email.sender.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0 tabular-nums">
                        {email.date}
                      </span>
                    </div>

                    <div
                      className={`text-xs truncate mb-1 ${
                        !email.isRead
                          ? 'font-semibold text-slate-900 dark:text-slate-100'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {email.subject}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {email.snippet}
                    </p>

                    {/* Metadata & Badges Bar */}
                    <div className="mt-2 flex items-center flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {/* Attached Task Indicator */}
                      {email.taskId && (
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                          <CheckSquare className="w-3 h-3 text-indigo-500" />
                          <span>Задача создана</span>
                        </span>
                      )}

                      {/* Attachments Indicator */}
                      {email.attachments && email.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Paperclip className="w-3 h-3" />
                          <span className="font-mono tabular-nums">{email.attachments.length}</span>
                        </span>
                      )}

                      {/* Tags */}
                      {email.labels.map((label) => (
                        <span
                          key={label}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          #{label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Quick Action Bar on Hover */}
                <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-md p-1 z-10">
                  <button
                    onClick={(e) => onCreateTaskFromEmail(email, e)}
                    title="Создать задачу из этого письма"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onToggleRead(email.id, e)}
                    title={email.isRead ? 'Пометить как непрочитанное' : 'Пометить как прочитанное'}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {email.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => onArchiveEmail(email.id, e)}
                    title="В архив"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onDeleteEmail(email.id, e)}
                    title="Удалить"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
