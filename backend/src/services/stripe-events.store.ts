import type { ResultSetHeader } from 'mysql2/promise';
import { getDbPool } from './db';
import { isDuplicateKey } from '../utils/db-errors';

class StripeEventsStore {
  private readonly pool = getDbPool();

  async recordEvent(eventId: string, eventType: string): Promise<boolean> {
    try {
      await this.pool.execute<ResultSetHeader>(
        'INSERT INTO stripe_events (id, type, created_at) VALUES (?, ?, NOW())',
        [eventId, eventType],
      );
      return true;
    } catch (error) {
      if (isDuplicateKey(error)) {
        return false;
      }
      throw error;
    }
  }
}

export const stripeEventsStore = new StripeEventsStore();
