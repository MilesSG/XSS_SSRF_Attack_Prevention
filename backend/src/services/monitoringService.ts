import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import Attack, { IAttack } from '../models/Attack';

export class MonitoringService {
  private io: Server;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected to monitoring service');

      // Send initial attack statistics
      this.sendAttackStats(socket);

      // Setup real-time monitoring
      socket.on('monitor:start', () => {
        this.startMonitoring(socket);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from monitoring service');
      });
    });
  }

  private async sendAttackStats(socket: any) {
    try {
      const stats = await this.getAttackStatistics();
      socket.emit('stats:update', stats);
    } catch (error) {
      console.error('Error sending attack stats:', error);
    }
  }

  private async getAttackStatistics() {
    const [xssAttacks, ssrfAttacks, combinedAttacks] = await Promise.all([
      Attack.find({ type: 'XSS' }).sort({ timestamp: -1 }).limit(100),
      Attack.find({ type: 'SSRF' }).sort({ timestamp: -1 }).limit(100),
      Attack.find({ type: 'COMBINED' }).sort({ timestamp: -1 }).limit(100)
    ]);

    return {
      totalAttacks: xssAttacks.length + ssrfAttacks.length + combinedAttacks.length,
      attacksByType: {
        xss: this.calculateAttackStats(xssAttacks),
        ssrf: this.calculateAttackStats(ssrfAttacks),
        combined: this.calculateAttackStats(combinedAttacks)
      },
      recentAttacks: this.getMostRecentAttacks([...xssAttacks, ...ssrfAttacks, ...combinedAttacks])
    };
  }

  private calculateAttackStats(attacks: IAttack[]) {
    const total = attacks.length;
    const successful = attacks.filter(a => a.result?.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }

  private getMostRecentAttacks(attacks: IAttack[]) {
    return attacks
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
      .map(attack => ({
        id: attack._id,
        type: attack.type,
        timestamp: attack.timestamp,
        status: attack.status,
        success: attack.result?.success || false
      }));
  }

  private startMonitoring(socket: any) {
    // Set up interval to send regular updates
    const updateInterval = setInterval(async () => {
      await this.sendAttackStats(socket);
    }, 5000); // Update every 5 seconds

    socket.on('monitor:stop', () => {
      clearInterval(updateInterval);
    });

    socket.on('disconnect', () => {
      clearInterval(updateInterval);
    });
  }

  // Public method to broadcast attack updates
  public broadcastAttackUpdate(attack: IAttack) {
    this.io.emit('attack:update', {
      id: attack._id,
      type: attack.type,
      status: attack.status,
      timestamp: attack.timestamp,
      result: attack.result
    });
  }
} 