import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Mail,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Kanban,
  Grid2X2,
  AlertCircle,
  ArrowRight,
  Filter,
  Check,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, PlannerSubView } from '../types';
import {
  formatDueDateDisplay,
  getPriorityDetails,
  getStatusDetails,
  playChime,
} from '../utils/formatters';

interface TaskPlannerProps {
  tasks: Task[];
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, checklistId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateTaskModal: () => void;
  onQuickAddTask: (title: string, priority: TaskPriority, dueDate: string) => void;
  onOpenLinkedEmail: (emailId: string) => void;
  isCompact?: boolean; // When in split view mode
}

export const TaskPlanner: React.FC<TaskPlannerProps> = ({
  tasks,
  onToggleTaskStatus,
  onUpdateTaskStatus,
  onToggleChecklistItem,
  onDeleteTask,
  onOpenCreateTaskModal,
  onQuickAddTask,
  onOpenLinkedEmail,
  isCompact = false,
}) => {
  const [subView, setSubView] = useState<PlannerSubView>('agenda');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    onQuickAddTask(quickTitle.trim(), quickPriority, today);
    setQuickTitle('');
    playChime('create');
  };

  // Metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = totalTasks - doneTasks;
  const totalMinutes = tasks
    .filter((t) => t.status !== 'done')
    .reduce((acc, t) => acc + (t.estimateMinutes || 0), 0);
  const totalHoursFormatted =
    totalMinutes > 0
      ? `${Math.floor(totalMinutes / 60)}ч ${totalMinutes % 60 ? `${totalMinutes % 60}м` : ''}`
      : '0ч';

  // Grouping for Agenda view
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr
  );
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const upcomingTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate > todayStr && t.status !== 'done'
  );
  const noDateOrDoneTasks = tasks.filter(
    (t) => !t.dueDate || (t.status === 'done' && t.dueDate !== todayStr)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/70 dark:bg-slate-950/60 overflow-hidden select-none">
      {/* Planner Header */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              Планировщик задач
            </h2>
          </div>

          {/* SubView Segmented Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setSubView('agenda')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                subView === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Расписание</span>
            </button>
            <button
              onClick={() => setSubView('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                subView === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Канбан</span>
            </button>
            <button
              onClick={() => setSubView('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                subView === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>Матрица</span>
            </button>
          </div>
        </div>

        {/* Action + Metrics */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span>
              {doneTasks}/{totalTasks} завершено
            </span>
            <span>·</span>
            <span>Оценка: {totalHoursFormatted}</span>
          </div>

          <button
            onClick={onOpenCreateTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Новая задача</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Быстро добавить задачу на сегодня (Enter)..."
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
            className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="urgent">Срочно</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Обычный</option>
          </select>
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Добавить
          </button>
        </form>
      </div>

      {/* Main View Port */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* SUBVIEW 1: AGENDA & TIMELINE */}
        {subView === 'agenda' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Просрочено ({overdueTasks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {overdueTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTaskIds.includes(task.id)}
                      onToggleExpand={() => toggleExpand(task.id)}
                      onToggleStatus={() => onToggleTaskStatus(task.id)}
                      onUpdateStatus={(s) => onUpdateTaskStatus(task.id, s)}
                      onToggleChecklist={(chkId) => onToggleChecklistItem(task.id, chkId)}
                      onDelete={() => onDeleteTask(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Задачи на сегодня ({todayTasks.length})</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                  {todayTasks.filter((t) => t.status === 'done').length}/{todayTasks.length} сделано
                </span>
              </div>
              {todayTasks.length === 0 ? (
                <div className="p-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  На сегодня задач нет. Добавьте задачу выше или перенесите письмо в работу!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTaskIds.includes(task.id)}
                      onToggleExpand={() => toggleExpand(task.id)}
                      onToggleStatus={() => onToggleTaskStatus(task.id)}
                      onUpdateStatus={(s) => onUpdateTaskStatus(task.id, s)}
                      onToggleChecklist={(chkId) => onToggleChecklistItem(task.id, chkId)}
                      onDelete={() => onDeleteTask(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Section */}
            {upcomingTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Предстоящие ({upcomingTasks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {upcomingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTaskIds.includes(task.id)}
                      onToggleExpand={() => toggleExpand(task.id)}
                      onToggleStatus={() => onToggleTaskStatus(task.id)}
                      onUpdateStatus={(s) => onUpdateTaskStatus(task.id, s)}
                      onToggleChecklist={(chkId) => onToggleChecklistItem(task.id, chkId)}
                      onDelete={() => onDeleteTask(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed / Later Section */}
            {noDateOrDoneTasks.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Выполненные ранее ({noDateOrDoneTasks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {noDateOrDoneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTaskIds.includes(task.id)}
                      onToggleExpand={() => toggleExpand(task.id)}
                      onToggleStatus={() => onToggleTaskStatus(task.id)}
                      onUpdateStatus={(s) => onUpdateTaskStatus(task.id, s)}
                      onToggleChecklist={(chkId) => onToggleChecklistItem(task.id, chkId)}
                      onDelete={() => onDeleteTask(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 2: KANBAN BOARD */}
        {subView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full items-start">
            {(
              [
                { id: 'todo', title: 'К выполнению', color: 'border-t-slate-400' },
                { id: 'in_progress', title: 'В процессе', color: 'border-t-blue-500' },
                { id: 'waiting', title: 'Ожидает ответа', color: 'border-t-amber-500' },
                { id: 'done', title: 'Завершено', color: 'border-t-emerald-500' },
              ] as const
            ).map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-2 ${col.color} rounded-xl p-3 flex flex-col gap-2.5 min-h-[380px] shadow-xs`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{col.title}</span>
                    <span className="font-mono text-slate-400 text-[11px] tabular-nums">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs space-y-2 hover:border-indigo-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`font-semibold ${
                              task.status === 'done'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                              getPriorityDetails(task.priority).dotColor
                            }`}
                          />
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Linked Email Chip */}
                        {task.emailId && (
                          <button
                            onClick={() => onOpenLinkedEmail(task.emailId!)}
                            className="w-full flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{task.emailSubject || 'Письмо'}</span>
                          </button>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                          <span className="font-mono tabular-nums">{task.dueDate}</span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'done' ? (
                              <button
                                onClick={() => {
                                  const next: Record<TaskStatus, TaskStatus> = {
                                    todo: 'in_progress',
                                    in_progress: 'waiting',
                                    waiting: 'done',
                                    done: 'done',
                                  };
                                  onUpdateTaskStatus(task.id, next[task.status]);
                                }}
                                title="Переместить вперед"
                                className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUBVIEW 3: EISENHOWER MATRIX */}
        {subView === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {/* Quadrant 1: Urgent & Important */}
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    1. Срочно и Важно (Сделать сейчас)
                  </h3>
                  <p className="text-[11px] text-slate-400">Критические дедлайны и блокирующие задачи</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done')
                  .map((task) => (
                    <MatrixTaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTaskStatus(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
              </div>
            </div>

            {/* Quadrant 2: Important & Not Urgent */}
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-950/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    2. Важно, но не срочно (Запланировать)
                  </h3>
                  <p className="text-[11px] text-slate-400">Стратегия, оптимизация, развитие</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.priority === 'medium' && t.status !== 'done')
                  .map((task) => (
                    <MatrixTaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTaskStatus(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
              </div>
            </div>

            {/* Quadrant 3: Urgent, Not Important */}
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    3. Срочно, но не важно (Делегировать/Быстро)
                  </h3>
                  <p className="text-[11px] text-slate-400">Короткие ответы, запросы справок</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === 'waiting')
                  .map((task) => (
                    <MatrixTaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTaskStatus(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
              </div>
            </div>

            {/* Quadrant 4: Routine / Low priority */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    4. Рутина и архив
                  </h3>
                  <p className="text-[11px] text-slate-400">Задачи с низким приоритетом и завершенные</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.priority === 'low' || t.status === 'done')
                  .slice(0, 6)
                  .map((task) => (
                    <MatrixTaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTaskStatus(task.id)}
                      onOpenEmail={onOpenLinkedEmail}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Matrix Task Row
const MatrixTaskRow: React.FC<{
  task: Task;
  onToggle: () => void;
  onOpenEmail: (id: string) => void;
}> = ({ task, onToggle, onOpenEmail }) => {
  const isDone = task.status === 'done';
  return (
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 truncate">
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-indigo-600 shrink-0 cursor-pointer"
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <span
          className={`truncate ${
            isDone ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'
          }`}
        >
          {task.title}
        </span>
      </div>
      {task.emailId && (
        <button
          onClick={() => onOpenEmail(task.emailId!)}
          title="Открыть письмо"
          className="p-1 text-slate-400 hover:text-indigo-600 shrink-0"
        >
          <Mail className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// Full interactive Task Card
interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onToggleChecklist: (checklistId: string) => void;
  onDelete: () => void;
  onOpenEmail: (emailId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onUpdateStatus,
  onToggleChecklist,
  onDelete,
  onOpenEmail,
}) => {
  const isDone = task.status === 'done';
  const priorityInfo = getPriorityDetails(task.priority);
  const statusInfo = getStatusDetails(task.status);
  const dueInfo = formatDueDateDisplay(task.dueDate);

  const completedSubtasks = task.checklist.filter((c) => c.completed).length;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl transition-all ${
        isDone
          ? 'border-slate-200 dark:border-slate-800 opacity-75'
          : dueInfo.isOverdue
          ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="p-3 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => {
            onToggleStatus();
            if (!isDone) playChime('complete');
          }}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                onClick={onToggleExpand}
                className={`text-xs font-semibold cursor-pointer ${
                  isDone
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {task.title}
              </span>

              {/* Priority Indicator */}
              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${priorityInfo.badgeBg}`}>
                {priorityInfo.label}
              </span>
            </div>

            {/* Due date tag */}
            {task.dueDate && (
              <span
                className={`text-[11px] font-mono whitespace-nowrap tabular-nums shrink-0 ${
                  dueInfo.isOverdue
                    ? 'text-rose-600 font-bold'
                    : dueInfo.isToday
                    ? 'text-amber-600 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {dueInfo.label}
                {task.dueTime && ` · ${task.dueTime}`}
              </span>
            )}
          </div>

          {/* Description preview */}
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Meta bar: Linked email, Subtask count, Time estimate */}
          <div className="mt-2 flex items-center flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Linked Email Chip */}
            {task.emailId && (
              <button
                onClick={() => onOpenEmail(task.emailId!)}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-[10px] bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded cursor-pointer"
              >
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[180px]">
                  {task.emailSender ? `${task.emailSender}: ` : ''}
                  {task.emailSubject || 'Письмо'}
                </span>
              </button>
            )}

            {/* Checklist trigger */}
            {task.checklist.length > 0 && (
              <button
                onClick={onToggleExpand}
                className="inline-flex items-center gap-1 text-[11px] hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <CheckSquare className="w-3 h-3 text-slate-400" />
                <span className="font-mono tabular-nums">
                  {completedSubtasks}/{task.checklist.length}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Time estimate */}
            {task.estimateMinutes && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums">
                <Clock className="w-3 h-3" />
                {task.estimateMinutes} мин
              </span>
            )}

            {/* Status switcher dropdown */}
            <select
              value={task.status}
              onChange={(e) => onUpdateStatus(e.target.value as TaskStatus)}
              className="text-[10px] bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 cursor-pointer ml-auto"
            >
              <option value="todo">К выполнению</option>
              <option value="in_progress">В процессе</option>
              <option value="waiting">Ожидает ответа</option>
              <option value="done">Завершено</option>
            </select>

            {/* Delete button */}
            <button
              onClick={onDelete}
              title="Удалить задачу"
              className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expanded Subtasks / Checklist Items */}
          {isExpanded && task.checklist.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 pl-2">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Подзадачи:
              </div>
              {task.checklist.map((chk) => (
                <div
                  key={chk.id}
                  onClick={() => onToggleChecklist(chk.id)}
                  className="flex items-center gap-2 text-xs cursor-pointer group"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                      chk.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                    }`}
                  >
                    {chk.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-[11px] ${
                      chk.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {chk.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
