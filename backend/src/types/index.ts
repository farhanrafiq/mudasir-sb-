export interface User {
  id: string;
  role: 'admin' | 'dealer';
  name: string;
  username: string;
  email: string;
  password_hash: string;
  temp_pass: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Dealer {
  id: string;
  user_id: string;
  company_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  address: string;
  status: 'active' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: string;
  dealer_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  aadhar: string;
  position: string;
  hire_date: Date;
  status: 'active' | 'terminated';
  termination_date: Date | null;
  termination_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  dealer_id: string;
  type: 'private' | 'government';
  name_or_entity: string;
  contact_person: string | null;
  phone: string;
  email: string;
  official_id: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  who_user_id: string;
  who_user_name: string;
  dealer_id: string | null;
  action_type: string;
  details: string;
  timestamp: Date;
}

export interface JWTPayload {
  userId: string;
  role: 'admin' | 'dealer';
  dealerId?: string;
}

export interface GlobalSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  aadhar: string;
  position: string;
  status: 'active' | 'terminated';
  hire_date: Date;
  termination_date: Date | null;
  employer_name: string;
  dealer_id: string;
}
