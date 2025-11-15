import { query } from '../database';
import { Customer } from '../types';

export class CustomerModel {
  static async findByDealerId(dealerId: string): Promise<Customer[]> {
    const result = await query(
      'SELECT * FROM customers WHERE dealer_id = $1 ORDER BY created_at DESC',
      [dealerId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Customer | null> {
    const result = await query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    dealer_id: string;
    type: 'private' | 'government';
    name_or_entity: string;
    contact_person?: string;
    phone: string;
    email: string;
    official_id: string;
    address: string;
  }): Promise<Customer> {
    const result = await query(
      `INSERT INTO customers (dealer_id, type, name_or_entity, contact_person,
                             phone, email, official_id, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.dealer_id,
        data.type,
        data.name_or_entity,
        data.contact_person || null,
        data.phone,
        data.email,
        data.official_id,
        data.address
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'type',
      'name_or_entity',
      'contact_person',
      'phone',
      'email',
      'official_id',
      'address',
      'status'
    ];

    for (const field of allowedFields) {
      if (data[field as keyof Customer] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(data[field as keyof Customer]);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE customers 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM customers WHERE id = $1', [id]);
  }
}
