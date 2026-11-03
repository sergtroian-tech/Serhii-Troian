export type EmailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash';

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface EmailSender {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Email {
  id: string;
  sender: EmailSender;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body: string;
  date: string;
  time: string;
  timestamp: number;
  folder: EmailFolder;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  attachments?: EmailAttachment[];
  taskId?: string; // ID of the linked task if created from this email
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  estimateMinutes?: number;
  emailId?: string; // Reference to original email
  emailSubject?: string;
  emailSender?: string;
  tags: string[];
  checklist: ChecklistItem[];
  createdAt: number;
  completedAt?: number;
}

export type ViewMode = 'split' | 'mail' | 'planner';
export type PlannerSubView = 'agenda' | 'kanban' | 'matrix';
