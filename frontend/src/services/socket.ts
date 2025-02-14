import { io, Socket } from 'socket.io-client';
import { Attack, AttackStatistics } from '../types/attack';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private statsCallback: ((stats: AttackStatistics) => void) | null = null;
  private attackUpdateCallback: ((attack: Attack) => void) | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('stats:update', (stats: AttackStatistics) => {
        if (this.statsCallback) {
          this.statsCallback(stats);
        }
      });

      this.socket.on('attack:update', (attack: Attack) => {
        if (this.attackUpdateCallback) {
          this.attackUpdateCallback(attack);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  startMonitoring() {
    if (this.socket) {
      this.socket.emit('monitor:start');
    }
  }

  stopMonitoring() {
    if (this.socket) {
      this.socket.emit('monitor:stop');
    }
  }

  onStatsUpdate(callback: (stats: AttackStatistics) => void) {
    this.statsCallback = callback;
  }

  onAttackUpdate(callback: (attack: Attack) => void) {
    this.attackUpdateCallback = callback;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService(); 