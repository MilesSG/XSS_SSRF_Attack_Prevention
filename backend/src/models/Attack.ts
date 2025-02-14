export type AttackType = 'XSS' | 'SSRF' | 'COMBINED';
export type AttackStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AttackResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface IAttack {
  _id: string;
  type: AttackType;
  payload: string;
  targetUrl: string;
  status: AttackStatus;
  result: AttackResult;
  timestamp: Date;
  userId: string;
}

// 创建一个工厂函数来替代Mongoose模型
export const createAttack = (data: Partial<IAttack>): Partial<IAttack> => {
  return {
    status: 'PENDING',
    timestamp: new Date(),
    ...data
  };
}; 