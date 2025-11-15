import pool from '../database';
import { hashPassword } from '../utils/auth';
import { config } from '../config';

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@unionregistry.com']
    );

    if (result.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the admin password
    const passwordHash = await hashPassword(config.admin.password);

    // Create admin user
    await pool.query(
      `INSERT INTO users (role, name, username, email, password_hash, temp_pass)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['admin', 'System Administrator', 'admin', 'admin@unionregistry.com', passwordHash, false]
    );

    console.log('Admin user created successfully');
    console.log('Email: admin@unionregistry.com');
    console.log(`Password: ${config.admin.password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
