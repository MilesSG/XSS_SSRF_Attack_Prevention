import { URL } from 'url';

export class SecurityUtils {
  // XSS防护相关工具方法
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateXSSPayload(payload: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /onerror=/gi,
      /onload=/gi,
      /onclick=/gi
    ];

    return !dangerousPatterns.some(pattern => pattern.test(payload));
  }

  // SSRF防护相关工具方法
  static async validateUrl(url: string): Promise<boolean> {
    try {
      const parsedUrl = new URL(url);
      return this.isAllowedHost(parsedUrl.hostname);
    } catch {
      return false;
    }
  }

  static isAllowedHost(hostname: string): boolean {
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'example.com',
      'api.example.com'
    ];

    const blockedHosts = [
      '169.254.',
      '127.',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '192.168.'
    ];

    // 检查是否是允许的主机
    if (allowedHosts.includes(hostname)) {
      return true;
    }

    // 检查是否是被阻止的IP范围
    if (blockedHosts.some(prefix => hostname.startsWith(prefix))) {
      return false;
    }

    return true;
  }

  // 通用安全检查
  static validatePayload(payload: any): boolean {
    // 检查payload大小
    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 1024 * 1024) { // 1MB限制
      return false;
    }

    // 检查嵌套深度
    if (this.getObjectDepth(payload) > 10) {
      return false;
    }

    return true;
  }

  private static getObjectDepth(obj: any, depth: number = 0): number {
    if (depth > 10) return depth; // 防止无限递归
    if (typeof obj !== 'object' || obj === null) return depth;

    return Math.max(
      ...Object.values(obj).map(value => this.getObjectDepth(value, depth + 1))
    );
  }

  // 防御性编程工具
  static safeJsonParse(str: string): any {
    try {
      const parsed = JSON.parse(str);
      if (this.validatePayload(parsed)) {
        return parsed;
      }
    } catch {
      // 解析失败时返回null
    }
    return null;
  }

  // 日志记录和审计
  static logSecurityEvent(eventType: string, details: any): void {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      details,
    };

    // 这里可以添加将日志写入文件或发送到日志服务器的逻辑
    console.log('Security Event:', event);
  }
} 