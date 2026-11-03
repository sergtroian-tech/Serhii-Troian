import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Inbox,
  CheckSquare,
  Columns,
  Mail,
  CalendarCheck2,
  Moon,
  Sun,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Email, EmailFolder, Task, TaskPriority, TaskStatus, ViewMode } from './types';
import { INITIAL_EMAILS, INITIAL_TASKS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { TaskPlanner } from './components/TaskPlanner';
import { CreateTaskModal } from './components/CreateTaskModal';
import { ComposeModal } from './components/ComposeModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DownloadModal } from './components/DownloadModal';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { initAuth, googleSignIn, logout } from './services/auth';
import { fetchRealEmails, modifyGmailLabels, sendRealGmailMessage } from './services/gmail';
import { playChime } from './utils/formatters';

const STORAGE_KEY_EMAILS = 'nexusmail_emails_v1';
const STORAGE_KEY_TASKS = 'nexusmail_tasks_v1';
const STORAGE_KEY_THEME = 'nexusmail_theme_v1';
const DEFAULT_USER_EMAIL = 'sergtroian@gmail.com';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Persistence for emails & tasks
  const [emails, setEmails] = useState<Email[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMAILS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_EMAILS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TASKS;
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Save demo emails only if not signed in
  useEffect(() => {
    if (!accessToken) {
      try {
        localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emails));
      } catch {
        // ignore
      }
    }
  }, [emails, accessToken]);

  // Navigation & View States
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [filterOnlyWithTasks, setFilterOnlyWithTasks] = useState(false);
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('em-1');
  const [viewMode, setViewMode] = useState<ViewMode>('split'); // 'split' | 'mail' | 'planner'

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskSourceEmail, setCreateTaskSourceEmail] = useState<Email | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Workspace Mandatory Confirmation Dialog State
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Load real emails from Gmail
  const loadRealEmails = useCallback(
    async (token: string, folder: EmailFolder = currentFolder) => {
      setIsSyncing(true);
      setSyncFeedback(null);
      try {
        const realEmails = await fetchRealEmails(token, folder);
        if (realEmails.length > 0) {
          setEmails((prev) => {
            // Preserve taskId linkage when updating emails
            const taskMap = new Map<string, string>();
            prev.forEach((e) => {
              if (e.taskId) taskMap.set(e.id, e.taskId);
            });
            return realEmails.map((re) => ({
              ...re,
              taskId: taskMap.get(re.id),
            }));
          });
          setSelectedEmailId((prev) => {
            const exists = realEmails.some((e) => e.id === prev);
            return exists ? prev : realEmails[0].id;
          });
          setSyncFeedback(`Загружено ${realEmails.length} писем из Gmail`);
        } else {
          setEmails([]);
          setSelectedEmailId(null);
          setSyncFeedback('В этой папке нет сообщений');
        }
      } catch (err: any) {
        console.error('Failed to load Gmail messages:', err);
        setSyncFeedback(`Ошибка загрузки: ${err.message || 'Проверьте соединение'}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [currentFolder]
  );

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        loadRealEmails(token, currentFolder);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, [loadRealEmails, currentFolder]);

  // When folder changes and authenticated, fetch from Gmail
  useEffect(() => {
    if (accessToken) {
      loadRealEmails(accessToken, currentFolder);
    }
  }, [currentFolder, accessToken, loadRealEmails]);

  // Google Sign-In Handler
  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await loadRealEmails(result.accessToken, currentFolder);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      alert('Ошибка входа: ' + (err.message || 'Попробуйте снова'));
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Google Logout Handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setEmails(INITIAL_EMAILS);
    setSelectedEmailId('em-1');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
        e.preventDefault();
        setIsComposeOpen(true);
      } else if (e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') {
        e.preventDefault();
        setCreateTaskSourceEmail(null);
        setIsCreateTaskOpen(true);
      } else if (e.key === '1') {
        setViewMode('split');
      } else if (e.key === '2') {
        setViewMode('mail');
      } else if (e.key === '3') {
        setViewMode('planner');
      } else if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsComposeOpen(false);
        setIsCreateTaskOpen(false);
        setIsShortcutsOpen(false);
        setConfirmation(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered emails list
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      if (currentFolder === 'starred') {
        if (!email.isStarred) return false;
      } else {
        if (email.folder !== currentFolder) return false;
      }

      if (selectedLabel && !email.labels.includes(selectedLabel)) {
        return false;
      }

      if (filterOnlyWithTasks && !email.taskId) {
        return false;
      }

      if (filterOnlyUnread && email.isRead) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = email.subject.toLowerCase().includes(q);
        const matchesSender = email.sender.name.toLowerCase().includes(q) || email.sender.email.toLowerCase().includes(q);
        const matchesSnippet = email.snippet.toLowerCase().includes(q);
        if (!matchesSubject && !matchesSender && !matchesSnippet) {
          return false;
        }
      }

      return true;
    });
  }, [emails, currentFolder, selectedLabel, filterOnlyWithTasks, filterOnlyUnread, searchQuery]);

  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const linkedTask = useMemo(() => {
    if (!selectedEmail?.taskId) return undefined;
    return tasks.find((t) => t.id === selectedEmail.taskId);
  }, [selectedEmail, tasks]);

  const unreadCount = useMemo(() => {
    return emails.filter((e) => e.folder === 'inbox' && !e.isRead).length;
  }, [emails]);

  const totalWithTasksCount = useMemo(() => {
    return emails.filter((e) => !!e.taskId && e.folder !== 'trash').length;
  }, [emails]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayTasksDone = todayTasks.filter((t) => t.status === 'done').length;
  const todayTasksTotal = todayTasks.length;

  // Handlers for Emails
  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
    if (accessToken) {
      // Mark as read in Gmail (remove UNREAD label)
      modifyGmailLabels(accessToken, id, [], ['UNREAD']).catch((err) =>
        console.warn('Failed to mark read in Gmail:', err)
      );
    }
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = emails.find((item) => item.id === id);
    if (!target) return;
    const nextStar = !target.isStarred;

    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: nextStar } : item
      )
    );

    if (accessToken) {
      modifyGmailLabels(
        accessToken,
        id,
        nextStar ? ['STARRED'] : [],
        nextStar ? [] : ['STARRED']
      ).catch((err) => console.warn('Failed to star in Gmail:', err));
    }
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = emails.find((item) => item.id === id);
    if (!target) return;
    const nextRead = !target.isRead;

    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: nextRead } : item
      )
    );

    if (accessToken) {
      modifyGmailLabels(
        accessToken,
        id,
        nextRead ? [] : ['UNREAD'],
        nextRead ? ['UNREAD'] : []
      ).catch((err) => console.warn('Failed to toggle read in Gmail:', err));
    }
  };

  // Archive with mandatory user confirmation when mutating real Gmail data
  const handleArchiveEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = emails.find((item) => item.id === id);

    const performArchive = () => {
      setEmails((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, folder: 'archive' } : item
        )
      );
      if (selectedEmailId === id) {
        const remaining = filteredEmails.filter((item) => item.id !== id);
        setSelectedEmailId(remaining.length > 0 ? remaining[0].id : null);
      }
      if (accessToken) {
        modifyGmailLabels(accessToken, id, [], ['INBOX']).catch((err) =>
          console.warn('Failed to archive in Gmail:', err)
        );
      }
      setConfirmation(null);
    };

    if (accessToken && target) {
      setConfirmation({
        isOpen: true,
        title: 'Архивировать письмо в Gmail?',
        message: `Письмо «${target.subject}» будет перемещено из Входящих в Архив в вашем реальном аккаунте Google.`,
        confirmLabel: 'Архивировать',
        onConfirm: performArchive,
      });
    } else {
      performArchive();
    }
  };

  // Delete with mandatory user confirmation when mutating real Gmail data
  const handleDeleteEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = emails.find((item) => item.id === id);

    const performDelete = () => {
      setEmails((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, folder: 'trash' } : item
        )
      );
      if (selectedEmailId === id) {
        const remaining = filteredEmails.filter((item) => item.id !== id);
        setSelectedEmailId(remaining.length > 0 ? remaining[0].id : null);
      }
      if (accessToken) {
        modifyGmailLabels(accessToken, id, ['TRASH'], ['INBOX']).catch((err) =>
          console.warn('Failed to trash in Gmail:', err)
        );
      }
      setConfirmation(null);
    };

    if (accessToken && target) {
      setConfirmation({
        isOpen: true,
        title: 'Удалить письмо в корзину Gmail?',
        message: `Письмо «${target.subject}» будет перемещено в Корзину вашего почтового ящика Google.`,
        confirmLabel: 'Удалить',
        isDestructive: true,
        onConfirm: performDelete,
      });
    } else {
      performDelete();
    }
  };

  const handleBulkArchive = (ids: string[]) => {
    const perform = () => {
      setEmails((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, folder: 'archive' } : item))
      );
      if (accessToken) {
        ids.forEach((id) => modifyGmailLabels(accessToken, id, [], ['INBOX']));
      }
      setConfirmation(null);
    };

    if (accessToken) {
      setConfirmation({
        isOpen: true,
        title: 'Архивировать выбранные письма?',
        message: `${ids.length} писем будут перемещены в архив вашего аккаунта Gmail.`,
        confirmLabel: 'Архивировать все',
        onConfirm: perform,
      });
    } else {
      perform();
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    const perform = () => {
      setEmails((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, folder: 'trash' } : item))
      );
      if (accessToken) {
        ids.forEach((id) => modifyGmailLabels(accessToken, id, ['TRASH'], ['INBOX']));
      }
      setConfirmation(null);
    };

    if (accessToken) {
      setConfirmation({
        isOpen: true,
        title: 'Удалить выбранные письма?',
        message: `${ids.length} писем будут перемещены в корзину вашего аккаунта Gmail.`,
        confirmLabel: 'Удалить все',
        isDestructive: true,
        onConfirm: perform,
      });
    } else {
      perform();
    }
  };

  const handleBulkMarkRead = (ids: string[], isRead: boolean) => {
    setEmails((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, isRead } : item))
    );
    if (accessToken) {
      ids.forEach((id) =>
        modifyGmailLabels(
          accessToken,
          id,
          isRead ? [] : ['UNREAD'],
          isRead ? ['UNREAD'] : []
        )
      );
    }
  };

  // Convert Email to Task
  const handleOpenCreateTaskFromEmail = (email: Email, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCreateTaskSourceEmail(email);
    setIsCreateTaskOpen(true);
  };

  // Handlers for Tasks
  const handleSaveNewTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newId = `tsk-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);

    if (taskData.emailId) {
      setEmails((prev) =>
        prev.map((e) => (e.id === taskData.emailId ? { ...e, taskId: newId } : e))
      );
    }

    playChime('create');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isNowDone = t.status !== 'done';
          return {
            ...t,
            status: isNowDone ? 'done' : 'todo',
            completedAt: isNowDone ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'done' ? Date.now() : undefined,
            }
          : t
      )
    );
    if (newStatus === 'done') playChime('complete');
  };

  const handleToggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map((chk) =>
              chk.id === checklistId ? { ...chk, completed: !chk.completed } : chk
            ),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (taskToDelete?.emailId) {
      setEmails((prev) =>
        prev.map((e) => (e.id === taskToDelete.emailId ? { ...e, taskId: undefined } : e))
      );
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleQuickAddTask = (title: string, priority: TaskPriority, dueDate: string) => {
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      title,
      status: 'todo',
      priority,
      dueDate,
      tags: ['Быстрые'],
      checklist: [],
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleOpenLinkedEmail = (emailId: string) => {
    const targetEmail = emails.find((e) => e.id === emailId);
    if (targetEmail) {
      setCurrentFolder(targetEmail.folder);
      setSelectedEmailId(emailId);
      if (viewMode === 'planner') {
        setViewMode('split');
      }
    }
  };

  const handleOpenLinkedTask = (taskId: string) => {
    if (viewMode === 'mail') {
      setViewMode('split');
    }
  };

  // Send new email with user confirmation when using real Gmail account
  const handleSendEmail = (data: { to: string; subject: string; body: string; labels: string[] }) => {
    const executeSend = async () => {
      if (accessToken) {
        try {
          await sendRealGmailMessage(accessToken, data.to, data.subject, data.body);
          setSyncFeedback('Письмо успешно отправлено через Gmail!');
        } catch (err: any) {
          alert('Ошибка при отправке: ' + err.message);
          return;
        }
      }

      const newEmail: Email = {
        id: `em-${Date.now()}`,
        sender: {
          name: user?.displayName || 'Вы',
          email: user?.email || DEFAULT_USER_EMAIL,
          initials: user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'Я',
          color: 'bg-indigo-600',
        },
        to: [data.to],
        subject: data.subject,
        snippet: data.body.slice(0, 120),
        body: data.body,
        date: 'Сегодня',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        folder: 'sent',
        labels: data.labels,
        isRead: true,
        isStarred: false,
      };

      setEmails((prev) => [newEmail, ...prev]);
      playChime('create');
      setConfirmation(null);
    };

    if (accessToken) {
      setConfirmation({
        isOpen: true,
        title: 'Отправить письмо через Gmail?',
        message: `Письмо с темой «${data.subject}» будет отправлено на адрес ${data.to} от имени аккаунта ${user?.email}.`,
        confirmLabel: 'Отправить',
        onConfirm: executeSend,
      });
    } else {
      executeSend();
    }
  };

  // Reply with user confirmation when using real Gmail
  const handleSendReply = (emailId: string, replyText: string) => {
    const targetEmail = emails.find((e) => e.id === emailId);
    if (!targetEmail) return;

    const executeReply = async () => {
      if (accessToken) {
        try {
          await sendRealGmailMessage(accessToken, targetEmail.sender.email, `Re: ${targetEmail.subject}`, replyText);
          setSyncFeedback('Ответ успешно отправлен через Gmail!');
        } catch (err: any) {
          alert('Ошибка при отправке ответа: ' + err.message);
          return;
        }
      }

      const replyEmail: Email = {
        id: `em-rep-${Date.now()}`,
        sender: {
          name: user?.displayName || 'Вы',
          email: user?.email || DEFAULT_USER_EMAIL,
          initials: user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'СТ',
          color: 'bg-indigo-600',
        },
        to: [targetEmail.sender.email],
        subject: `Re: ${targetEmail.subject}`,
        snippet: replyText.slice(0, 120),
        body: `${replyText}\n\n--- Исходное сообщение ---\nОт: ${targetEmail.sender.name}\n${targetEmail.body}`,
        date: 'Сегодня',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        folder: 'sent',
        labels: targetEmail.labels,
        isRead: true,
        isStarred: false,
      };

      setEmails((prev) => [replyEmail, ...prev]);
      playChime('create');
      setConfirmation(null);
    };

    if (accessToken) {
      setConfirmation({
        isOpen: true,
        title: 'Отправить ответ через Gmail?',
        message: `Ответ будет отправлен на адрес ${targetEmail.sender.email} через ваш аккаунт Google.`,
        confirmLabel: 'Отправить',
        onConfirm: executeReply,
      });
    } else {
      executeReply();
    }
  };

  const getFolderTitle = () => {
    if (selectedLabel) return `Категория: ${selectedLabel}`;
    if (filterOnlyWithTasks) return 'Письма с задачами';
    if (filterOnlyUnread) return 'Непрочитанные письма';
    switch (currentFolder) {
      case 'inbox':
        return 'Входящие';
      case 'starred':
        return 'Важные';
      case 'sent':
        return 'Отправленные';
      case 'drafts':
        return 'Черновики';
      case 'archive':
        return 'Архив';
      case 'trash':
        return 'Корзина';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 1. Sidebar */}
      <Sidebar
        currentFolder={currentFolder}
        onSelectFolder={(f) => {
          setCurrentFolder(f);
          setSelectedLabel(null);
          setFilterOnlyWithTasks(false);
          setFilterOnlyUnread(false);
        }}
        selectedLabel={selectedLabel}
        onSelectLabel={setSelectedLabel}
        filterOnlyWithTasks={filterOnlyWithTasks}
        onToggleFilterWithTasks={() => setFilterOnlyWithTasks((prev) => !prev)}
        filterOnlyUnread={filterOnlyUnread}
        onToggleFilterUnread={() => setFilterOnlyUnread((prev) => !prev)}
        unreadCount={unreadCount}
        totalWithTasksCount={totalWithTasksCount}
        todayTasksDone={todayTasksDone}
        todayTasksTotal={todayTasksTotal}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenCompose={() => setIsComposeOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        userEmail={user?.email || DEFAULT_USER_EMAIL}
        isAuthenticated={!!user}
        userDisplayName={user?.displayName}
        userPhotoURL={user?.photoURL}
        isAuthLoading={isAuthLoading}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSync={() => accessToken && loadRealEmails(accessToken, currentFolder)}
        onOpenDownload={() => setIsDownloadModalOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar (Complies with Top Bar Contract: 3 zones separated by gap-8) */}
        <header className="h-14 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-8 shrink-0">
          {/* Zone 1: Single text element wordmark / contextual breadcrumb */}
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
              {getFolderTitle()}
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs text-slate-500 font-body">
              {user ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Gmail: {user.email}
                </span>
              ) : (
                'Демо-режим'
              )}
            </span>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => {
                setCurrentFolder('inbox');
                setSelectedLabel(null);
                setFilterOnlyWithTasks(false);
                setFilterOnlyUnread(false);
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Входящие ({unreadCount})
            </button>
            <button
              onClick={() => setFilterOnlyWithTasks(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              С задачами ({totalWithTasksCount})
            </button>
            <button
              onClick={() => setViewMode('planner')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              План на сегодня ({todayTasksTotal - todayTasksDone} ост.)
            </button>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Шорткаты [?]
            </button>
          </nav>

          {/* Zone 3: 1 primary action / theme control */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                onClick={() => accessToken && loadRealEmails(accessToken, currentFolder)}
                disabled={isSyncing}
                title="Обновить почту из Gmail"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Синхронизация</span>
              </button>
            ) : (
              <GoogleSignInButton
                onClick={handleLogin}
                isLoading={isAuthLoading}
                className="py-1 px-3"
              />
            )}

            <button
              onClick={() => setIsDownloadModalOpen(true)}
              title="Как пользоваться или скачать программу"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Установить / Скачать</span>
            </button>

            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              title={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setCreateTaskSourceEmail(null);
                setIsCreateTaskOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать задачу</span>
            </button>
          </div>
        </header>

        {/* Sync Feedback Toast if any */}
        {syncFeedback && (
          <div className="bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/60 px-4 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-indigo-400 hover:text-indigo-600 text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* View Content Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* MODE A: SPLIT */}
          {viewMode === 'split' && (
            <div className="flex-1 flex h-full overflow-hidden">
              <div className="w-80 md:w-96 shrink-0 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
                <EmailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={handleSelectEmail}
                  onToggleStar={handleToggleStar}
                  onToggleRead={handleToggleRead}
                  onArchiveEmail={handleArchiveEmail}
                  onDeleteEmail={handleDeleteEmail}
                  onCreateTaskFromEmail={handleOpenCreateTaskFromEmail}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  folderTitle={getFolderTitle()}
                  onBulkArchive={handleBulkArchive}
                  onBulkDelete={handleBulkDelete}
                  onBulkMarkRead={handleBulkMarkRead}
                />
              </div>

              <div className="hidden xl:flex flex-1 h-full border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                {selectedEmail ? (
                  <EmailDetail
                    email={selectedEmail}
                    linkedTask={linkedTask}
                    onToggleStar={handleToggleStar}
                    onArchiveEmail={handleArchiveEmail}
                    onDeleteEmail={handleDeleteEmail}
                    onToggleRead={handleToggleRead}
                    onCreateTask={handleOpenCreateTaskFromEmail}
                    onOpenLinkedTask={handleOpenLinkedTask}
                    onSendReply={handleSendReply}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Mail className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                    <span className="text-sm font-medium">Выберите письмо для чтения</span>
                  </div>
                )}
              </div>

              <div className="flex-1 xl:w-[480px] xl:flex-none h-full overflow-hidden">
                <TaskPlanner
                  tasks={tasks}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onDeleteTask={handleDeleteTask}
                  onOpenCreateTaskModal={() => {
                    setCreateTaskSourceEmail(null);
                    setIsCreateTaskOpen(true);
                  }}
                  onQuickAddTask={handleQuickAddTask}
                  onOpenLinkedEmail={handleOpenLinkedEmail}
                  isCompact={true}
                />
              </div>
            </div>
          )}

          {/* MODE B: MAIL ONLY */}
          {viewMode === 'mail' && (
            <div className="flex-1 flex h-full overflow-hidden">
              <div className="w-80 md:w-96 shrink-0 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
                <EmailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={handleSelectEmail}
                  onToggleStar={handleToggleStar}
                  onToggleRead={handleToggleRead}
                  onArchiveEmail={handleArchiveEmail}
                  onDeleteEmail={handleDeleteEmail}
                  onCreateTaskFromEmail={handleOpenCreateTaskFromEmail}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  folderTitle={getFolderTitle()}
                  onBulkArchive={handleBulkArchive}
                  onBulkDelete={handleBulkDelete}
                  onBulkMarkRead={handleBulkMarkRead}
                />
              </div>

              <div className="flex-1 h-full overflow-hidden">
                {selectedEmail ? (
                  <EmailDetail
                    email={selectedEmail}
                    linkedTask={linkedTask}
                    onToggleStar={handleToggleStar}
                    onArchiveEmail={handleArchiveEmail}
                    onDeleteEmail={handleDeleteEmail}
                    onToggleRead={handleToggleRead}
                    onCreateTask={handleOpenCreateTaskFromEmail}
                    onOpenLinkedTask={handleOpenLinkedTask}
                    onSendReply={handleSendReply}
                  />
                ) : (
                  <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Mail className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                    <span className="text-sm font-medium">Выберите письмо для чтения</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE C: PLANNER ONLY */}
          {viewMode === 'planner' && (
            <div className="flex-1 h-full overflow-hidden">
              <TaskPlanner
                tasks={tasks}
                onToggleTaskStatus={handleToggleTaskStatus}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onToggleChecklistItem={handleToggleChecklistItem}
                onDeleteTask={handleDeleteTask}
                onOpenCreateTaskModal={() => {
                  setCreateTaskSourceEmail(null);
                  setIsCreateTaskOpen(true);
                }}
                onQuickAddTask={handleQuickAddTask}
                onOpenLinkedEmail={handleOpenLinkedEmail}
                isCompact={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setCreateTaskSourceEmail(null);
        }}
        onSaveTask={handleSaveNewTask}
        sourceEmail={createTaskSourceEmail}
      />

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSendEmail={handleSendEmail}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Required Confirmation Modal for Workspace Mutating Operations */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          confirmLabel={confirmation.confirmLabel}
          cancelLabel={confirmation.cancelLabel}
          isDestructive={confirmation.isDestructive}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}
