export enum TaskType {
  Stakeholder = 'Stakeholder Mgt',
  Requirements = 'Requirements',
  MeetingNote = 'Meeting Note',
  FeatureRequest = 'Feature Request',
  BugReport = 'Bug Report',
  Roadmap = 'Roadmapping',
}

export enum TaskStatus {
  Triage = 'Triage',
  Today = 'Today / This week',
  Next = 'Next / Later',
  Backlog = 'Backlog',
  Done = 'Done',
}

export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent',
}

export interface UserStory {
    id: string;
    title: string;
    story: string;
    acceptanceCriteria: string;
}

export interface BugReportEntry {
    id: string;
    title: string;
    currentBehavior: string;
    expectedBehavior: string;
}

export interface FeatureRequestEntry {
    id: string;
    requestorName: string;
    requestorRole?: string;
    rawRequest: string;
    // AI generated fields
    painPoint?: string;
    businessContext?: string;
    value?: string;
}

export interface Stakeholder {
    id:string;
    name: string;
    role?: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: string; // Mime type
    data: string; // base64 data URL
}

export interface Comment {
    id: string;
    author: { name: string; avatarUrl: string };
    content: string;
    createdAt: string; // ISO string
}

export interface Task {
  id:string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO string
  dueDate?: string; // ISO string for date
  assignee?: { name: string; avatarUrl: string };
  product?: string;
  userStories?: UserStory[];
  bugReports?: BugReportEntry[];
  featureRequests?: FeatureRequestEntry[];
  stakeholders?: Stakeholder[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export enum ViewType {
    Kanban = 'Kanban',
    List = 'List'
}

export type Theme = 'light' | 'dark' | 'system';