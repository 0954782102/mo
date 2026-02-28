
export interface Rule {
  id: string;
  text: string;
  punishment?: string;
  note?: string;
}

export interface RuleSection {
  title: string;
  rules: Rule[];
}

export enum Category {
  CHAT = 'CHAT',
  MILITARY = 'MILITARY',
  GOVERNMENT = 'GOVERNMENT',
  ROLEPLAY = 'ROLEPLAY'
}

export interface RulesData {
  [Category.CHAT]: RuleSection[];
  [Category.MILITARY]: RuleSection[];
  [Category.GOVERNMENT]: RuleSection[];
  [Category.ROLEPLAY]: RuleSection[];
}
