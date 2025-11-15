import { query } from '../database';
import { Dealer } from '../types';

export class DealerModel {
  static async findAll(): Promise<Dealer[]> {
    const result = await query(
      'SELECT * FROM dealers ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Dealer | null> {
    const result = await query(
      'SELECT * FROM dealers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Dealer | null> {
    const result = await query(
      'SELECT * FROM dealers WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findByCompanyName(companyName: string): Promise<Dealer | null> {
    const result = await query(
      'SELECT * FROM dealers WHERE company_name = $1',
      [companyName]
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    user_id: string;
    company_name: string;
    primary_contact_name: string;
    primary_contact_phone: string;
    primary_contact_email: string;
    address: string;
    status?: 'active' | 'suspended';
  }): Promise<Dealer> {
    const result = await query(
      `INSERT INTO dealers (user_id, company_name, primary_contact_name, 
                           primary_contact_phone, primary_contact_email, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.company_name,
        data.primary_contact_name,
        data.primary_contact_phone,
        data.primary_contact_email,
        data.address,
        data.status || 'active'
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Dealer>): Promise<Dealer> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'company_name',
      'primary_contact_name',
      'primary_contact_phone',
      'primary_contact_email',
      'address',
      'status'
    ];

    for (const field of allowedFields) {
      if (data[field as keyof Dealer] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(data[field as keyof Dealer]);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE dealers 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM dealers WHERE id = $1', [id]);
  }
}
