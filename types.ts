
export enum Category {
  CHAT = 'CHAT',
  MILITARY = 'MILITARY',
  GOVERNMENT = 'GOVERNMENT',
  ROLEPLAY = 'ROLEPLAY',
  SUGGESTIONS = 'SUGGESTIONS'
}

export interface Rule {
  id: string;
  text: string;
  punishment?: string;
  note?: string;
  category?: Category;
}

export interface RuleSection {
  title: string;
  rules: Rule[];
}

export interface RulesData {
  [Category.CHAT]: RuleSection[];
  [Category.MILITARY]: RuleSection[];
  [Category.GOVERNMENT]: RuleSection[];
  [Category.ROLEPLAY]: RuleSection[];
  [Category.SUGGESTIONS]: RuleSection[];
}

export interface User {
  id: number;
  nickname: string;
  email: string;
  role: 'User' | 'SysAdmin';
  position: string;
  createdAt: string;
  isOnline?: boolean;
}

export interface ActivityLog {
  id: number;
  userId: number;
  nickname: string;
  action: string;
  timestamp: string;
}

export interface ChangelogEntry {
  id: number;
  date: string;
  text: string;
}
