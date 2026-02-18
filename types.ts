
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
  LEADERS = 'LEADERS',
  MILITARY = 'MILITARY',
  GOVERNMENT = 'GOVERNMENT',
  STATE_ORG = 'STATE_ORG'
}

export interface RulesData {
  [Category.LEADERS]: RuleSection[];
  [Category.MILITARY]: RuleSection[];
  [Category.GOVERNMENT]: RuleSection[];
  [Category.STATE_ORG]: RuleSection[];
}
