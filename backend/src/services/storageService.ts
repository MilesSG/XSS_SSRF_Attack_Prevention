import { IAttack } from '../models/Attack';

class StorageService {
  private attacks: IAttack[] = [];
  private nextId = 1;

  async createAttack(attack: Partial<IAttack>): Promise<IAttack> {
    const newAttack = {
      ...attack,
      _id: String(this.nextId++),
      timestamp: new Date(),
    } as IAttack;
    
    this.attacks.push(newAttack);
    return newAttack;
  }

  async updateAttack(id: string, update: Partial<IAttack>): Promise<IAttack | null> {
    const index = this.attacks.findIndex(a => a._id === id);
    if (index === -1) return null;

    this.attacks[index] = { ...this.attacks[index], ...update };
    return this.attacks[index];
  }

  async findAttacks(query: { type?: string } = {}): Promise<IAttack[]> {
    return this.attacks
      .filter(attack => !query.type || attack.type === query.type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export default new StorageService(); 