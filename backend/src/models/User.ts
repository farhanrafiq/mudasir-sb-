import { query } from '../database';
import { User } from '../types';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    role: 'admin' | 'dealer';
    name: string;
    username: string;
    email: string;
    password_hash: string;
    temp_pass: boolean;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (role, name, username, email, password_hash, temp_pass)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.role, data.name, data.username, data.email, data.password_hash, data.temp_pass]
    );
    return result.rows[0];
  }

  static async updatePassword(id: string, password_hash: string, temp_pass: boolean = false): Promise<User> {
    const result = await query(
      `UPDATE users 
       SET password_hash = $1, temp_pass = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [password_hash, temp_pass, id]
    );
    return result.rows[0];
  }

  static async updateProfile(id: string, data: { name?: string; username?: string }): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(data.username);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }
}
