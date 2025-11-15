import { query } from '../database';
import { AuditLog } from '../types';

export class AuditLogModel {
  static async findAll(): Promise<AuditLog[]> {
    const result = await query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1000'
    );
    return result.rows;
  }

  static async findByDealerId(dealerId: string): Promise<AuditLog[]> {
    const result = await query(
      'SELECT * FROM audit_logs WHERE dealer_id = $1 ORDER BY timestamp DESC LIMIT 500',
      [dealerId]
    );
    return result.rows;
  }

  static async create(data: {
    who_user_id: string;
    who_user_name: string;
    dealer_id?: string;
    action_type: string;
    details: string;
  }): Promise<AuditLog> {
    const result = await query(
      `INSERT INTO audit_logs (who_user_id, who_user_name, dealer_id, action_type, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.who_user_id,
        data.who_user_name,
        data.dealer_id || null,
        data.action_type,
        data.details
      ]
    );
    return result.rows[0];
  }
}
