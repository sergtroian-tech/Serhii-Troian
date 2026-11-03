import React from 'react';
import {
  Inbox,
  Star,
  Send,
  FileEdit,
  Archive,
  Trash2,
  CheckSquare,
  Tag,
  PenSquare,
  Columns,
  Mail,
  CalendarCheck2,
  Keyboard,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  Download,
} from 'lucide-react';
import { EmailFolder, ViewMode } from '../types';
import { AppLogo } from './AppLogo';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SidebarProps {
  currentFolder: EmailFolder;
  onSelectFolder: (folder: EmailFolder) => void;
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
  filterOnlyWithTasks: boolean;
  onToggleFilterWithTasks: () => void;
  filterOnlyUnread: boolean;
  onToggleFilterUnread: () => void;
  unreadCount: number;
  totalWithTasksCount: number;
  todayTasksDone: number;
  todayTasksTotal: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenCompose: () => void;
  onOpenShortcuts: () => void;
  userEmail: string;
  isAuthenticated: boolean;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
  isAuthLoading?: boolean;
  isSyncing?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  onOpenDownload?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolder,
  onSelectFolder,
  selectedLabel,
  onSelectLabel,
  filterOnlyWithTasks,
  onToggleFilterWithTasks,
  filterOnlyUnread,
  onToggleFilterUnread,
  unreadCount,
  totalWithTasksCount,
  todayTasksDone,
  todayTasksTotal,
  viewMode,
  onChangeViewMode,
  onOpenCompose,
  onOpenShortcuts,
  userEmail,
  isAuthenticated,
  userDisplayName,
  userPhotoURL,
  isAuthLoading = false,
  isSyncing = false,
  onLogin,
  onLogout,
  onSync,
  onOpenDownload,
}) => {
  const folders: { id: EmailFolder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'inbox', label: 'Входящие', icon: <Inbox className="w-4 h-4" />, count: unreadCount },
    { id: 'starred', label: 'Важные', icon: <Star className="w-4 h-4" /> },
    { id: 'sent', label: 'Отправленные', icon: <Send className="w-4 h-4" /> },
    { id: 'drafts', label: 'Черновики', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'archive', label: 'Архив', icon: <Archive className="w-4 h-4" /> },
    { id: 'trash', label: 'Корзина', icon: <Trash2 className="w-4 h-4" /> },
  ];

  const labels = [
    { name: 'Проекты', color: 'bg-emerald-500' },
    { name: 'Клиенты', color: 'bg-blue-500' },
    { name: 'Финансы', color: 'bg-amber-500' },
    { name: 'Срочно', color: 'bg-rose-500' },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-none">
      {/* Brand & Wordmark */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <AppLogo size="md" showText={true} />

        {/* Shortcuts button */}
        <button
          onClick={onOpenShortcuts}
          title="Горячие клавиши (нажмите ?)"
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Main Action: Compose button */}
      <div className="p-3">
        <button
          onClick={onOpenCompose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <PenSquare className="w-4 h-4" />
          <span>Написать письмо</span>
          <kbd className="ml-auto text-[10px] bg-indigo-700/60 text-indigo-100 px-1.5 py-0.5 rounded font-mono">C</kbd>
        </button>
      </div>

      {/* View Mode Switcher (Clean Segmented Control) */}
      <div className="px-3 pb-3">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
          Режим экрана
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs">
          <button
            onClick={() => onChangeViewMode('split')}
            title="Сплит-режим: Почта и Планировщик рядом"
            className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">Сплит</span>
          </button>
          <button
            onClick={() => onChangeViewMode('mail')}
            title="Фокус на почте"
            className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all ${
              viewMode === 'mail'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">Почта</span>
          </button>
          <button
            onClick={() => onChangeViewMode('planner')}
            title="Фокус на задачах и планировании"
            className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all ${
              viewMode === 'planner'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">Задачи</span>
          </button>
        </div>
      </div>

      {/* Navigation scrollable */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {/* Mail Folders */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
            Папки
          </div>
          <div className="space-y-0.5">
            {folders.map((f) => {
              const isActive = currentFolder === f.id && selectedLabel === null && !filterOnlyWithTasks && !filterOnlyUnread;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectFolder(f.id);
                    onSelectLabel(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                      {f.icon}
                    </span>
                    <span className="truncate">{f.label}</span>
                  </div>
                  {f.count !== undefined && f.count > 0 && (
                    <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded-full tabular-nums">
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Workflow Filters */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
            Быстрые фильтры
          </div>
          <div className="space-y-0.5">
            <button
              onClick={onToggleFilterWithTasks}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                filterOnlyWithTasks
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span className="truncate">С задачами в работе</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {totalWithTasksCount}
              </span>
            </button>

            <button
              onClick={onToggleFilterUnread}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                filterOnlyUnread
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="truncate">Только новые</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {unreadCount}
              </span>
            </button>
          </div>
        </div>

        {/* Labels / Tags */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
            <span>Категории</span>
            {selectedLabel && (
              <button
                onClick={() => onSelectLabel(null)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer lowercase"
              >
                сброс
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {labels.map((lbl) => {
              const isSelected = selectedLabel === lbl.name;
              return (
                <button
                  key={lbl.name}
                  onClick={() => onSelectLabel(isSelected ? null : lbl.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${lbl.color}`} />
                    <span>{lbl.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Tasks Quick Metric */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Сегодня
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums text-[11px]">
              {todayTasksDone}/{todayTasksTotal}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${todayTasksTotal > 0 ? (todayTasksDone / todayTasksTotal) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{todayTasksTotal - todayTasksDone} осталось</span>
            <button
              onClick={() => onChangeViewMode('planner')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Открыть план →
            </button>
          </div>
        </div>

        {/* Download Project ZIP */}
        <div className="pt-1">
          <button
            onClick={onOpenDownload}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Установить / Скачать</span>
          </button>
        </div>
      </div>

      {/* Account Info Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt={userDisplayName || 'User'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                  {userDisplayName ? userDisplayName.slice(0, 2).toUpperCase() : 'G'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                  <span className="truncate">{userDisplayName || 'Gmail Аккаунт'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Подключено" />
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Синхронизировать почту Gmail"
                className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Обновление...' : 'Синхронизировать'}</span>
              </button>

              <button
                onClick={onLogout}
                title="Выйти из аккаунта"
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Подключите Google, чтобы видеть ваши настоящие письма из Gmail:
            </div>
            <GoogleSignInButton
              onClick={onLogin}
              isLoading={isAuthLoading}
              className="w-full"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
