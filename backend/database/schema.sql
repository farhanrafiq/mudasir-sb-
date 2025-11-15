-- Union Registry Database Schema
-- Run this script to create the complete database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'dealer')),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    temp_pass BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dealers table
CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) UNIQUE NOT NULL,
    primary_contact_name VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(20) NOT NULL,
    primary_contact_email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL,
    aadhar VARCHAR(12) UNIQUE NOT NULL,
    position VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'terminated')),
    termination_date DATE,
    termination_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT termination_date_check CHECK (
        (status = 'terminated' AND termination_date IS NOT NULL) OR
        (status = 'active' AND termination_date IS NULL)
    )
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'government')),
    name_or_entity VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL,
    official_id VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    who_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    who_user_name VARCHAR(255) NOT NULL,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_dealers_user_id ON dealers(user_id);
CREATE INDEX idx_dealers_company_name ON dealers(company_name);
CREATE INDEX idx_dealers_status ON dealers(status);

CREATE INDEX idx_employees_dealer_id ON employees(dealer_id);
CREATE INDEX idx_employees_aadhar ON employees(aadhar);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_first_name ON employees(first_name);
CREATE INDEX idx_employees_last_name ON employees(last_name);
CREATE INDEX idx_employees_phone ON employees(phone);

CREATE INDEX idx_customers_dealer_id ON customers(dealer_id);
CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_audit_logs_who_user_id ON audit_logs(who_user_id);
CREATE INDEX idx_audit_logs_dealer_id ON audit_logs(dealer_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Union@2025)
-- Note: The password hash is for 'Union@2025' with bcrypt rounds=10
-- You should run the backend to create the admin user properly
INSERT INTO users (role, name, username, email, password_hash, temp_pass) 
VALUES (
    'admin', 
    'System Administrator', 
    'admin', 
    'admin@unionregistry.com', 
    '$2b$10$placeholder', -- This will be replaced when you first run the backend
    false
) ON CONFLICT (email) DO NOTHING;
