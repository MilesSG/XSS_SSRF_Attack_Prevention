export type AttackType = 'XSS' | 'SSRF' | 'COMBINED';
export type AttackStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AttackResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface Attack {
  _id: string;
  type: AttackType;
  payload: string;
  targetUrl: string;
  status: AttackStatus;
  result: AttackResult;
  timestamp: string;
  userId: string;
}

export interface XSSAttackPayload {
  payload: string;
  targetUrl: string;
  userId: string;
}

export interface SSRFAttackPayload {
  payload: string;
  targetUrl: string;
  userId: string;
}

export interface CombinedAttackPayload {
  xssPayload: string;
  ssrfPayload: string;
  targetUrl: string;
  userId: string;
}

export interface AttackStatistics {
  totalAttacks: number;
  attacksByType: {
    xss: AttackTypeStats;
    ssrf: AttackTypeStats;
    combined: AttackTypeStats;
  };
  recentAttacks: RecentAttack[];
}

export interface AttackTypeStats {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface RecentAttack {
  id: string;
  type: AttackType;
  timestamp: string;
  status: AttackStatus;
  success: boolean;
} 