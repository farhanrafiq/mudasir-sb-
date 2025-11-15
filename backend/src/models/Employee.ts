import { query } from '../database';
import { Employee, GlobalSearchResult } from '../types';

export class EmployeeModel {
  static async findByDealerId(dealerId: string): Promise<Employee[]> {
    const result = await query(
      'SELECT * FROM employees WHERE dealer_id = $1 ORDER BY created_at DESC',
      [dealerId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Employee | null> {
    const result = await query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByAadhar(aadhar: string): Promise<Employee | null> {
    const result = await query(
      'SELECT * FROM employees WHERE aadhar = $1',
      [aadhar]
    );
    return result.rows[0] || null;
  }

  static async findActiveByAadhar(aadhar: string): Promise<GlobalSearchResult | null> {
    const result = await query(
      `SELECT e.*, d.company_name as employer_name
       FROM employees e
       JOIN dealers d ON e.dealer_id = d.id
       WHERE e.aadhar = $1 AND e.status = 'active'`,
      [aadhar]
    );
    return result.rows[0] || null;
  }

  static async search(searchQuery: string): Promise<GlobalSearchResult[]> {
    const result = await query(
      `SELECT e.id, e.first_name, e.last_name, e.phone, e.aadhar, e.position,
              e.status, e.hire_date, e.termination_date, e.dealer_id,
              d.company_name as employer_name
       FROM employees e
       JOIN dealers d ON e.dealer_id = d.id
       WHERE e.first_name ILIKE $1 
          OR e.last_name ILIKE $1 
          OR e.phone ILIKE $1 
          OR e.aadhar ILIKE $1
       ORDER BY e.created_at DESC
       LIMIT 50`,
      [`%${searchQuery}%`]
    );
    return result.rows;
  }

  static async create(data: {
    dealer_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    aadhar: string;
    position: string;
    hire_date: Date;
  }): Promise<Employee> {
    const result = await query(
      `INSERT INTO employees (dealer_id, first_name, last_name, phone, email, 
                             aadhar, position, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.dealer_id,
        data.first_name,
        data.last_name,
        data.phone,
        data.email,
        data.aadhar,
        data.position,
        data.hire_date
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'first_name',
      'last_name',
      'phone',
      'email',
      'position',
      'hire_date',
      'status'
    ];

    for (const field of allowedFields) {
      if (data[field as keyof Employee] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(data[field as keyof Employee]);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE employees 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async terminate(id: string, terminationDate: Date, reason: string): Promise<Employee> {
    const result = await query(
      `UPDATE employees 
       SET status = 'terminated', 
           termination_date = $1, 
           termination_reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [terminationDate, reason, id]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM employees WHERE id = $1', [id]);
  }
}
