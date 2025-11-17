import { users, dealers, employees, auditLogs, nextIds } from './mockData';
import { 
    Dealer, 
    Employee, 
    Customer, 
    AuditLog, 
    GlobalSearchResult, 
    // UserRole (unused)
    AuditActionType,
    UUID, 
    User
} from '../types';

// --- HELPERS ---
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

let currentUser: User | null = null;

const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp' | 'who_user_id' | 'who_user_name'>) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
        id: nextIds.audit++,
        timestamp: new Date().toISOString(),
        who_user_id: currentUser.id,
        who_user_name: currentUser.name,
        ...entry,
    };
    auditLogs.unshift(newLog);
};

const generateTempPassword = () => Math.random().toString(36).slice(-8);


export const api = {
  // === AUTH ===
  adminLogin: async (password: string): Promise<{ token: string; user: User }> => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Invalid admin credentials');
    }
    const data = await res.json();
    // Store token for future requests
    localStorage.setItem('token', data.token);
    return data;
  },

  dealerLogin: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await fetch('/api/auth/dealer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Invalid dealer credentials');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },
  
  logout: async (): Promise<void> => {
      await simulateDelay(100);
      currentUser = null;
  },

  changePassword: async(userId: UUID, newPass: string): Promise<User> => {
    await simulateDelay(500);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.password = newPass;
    user.tempPass = false;
    
    // re-authenticate to get a fresh user object without password
    currentUser = { ...user };
    delete (currentUser as any).password;

    addAuditLog({ action_type: AuditActionType.CHANGE_PASSWORD, details: 'User changed their password.' });
    return currentUser as User;
  },
  
  updateUserProfile: async (userId: UUID, data: { name: string; username: string }): Promise<User> => {
    await simulateDelay(300);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.name = data.name;
    user.username = data.username;
    if (currentUser?.id === userId) {
        currentUser.name = data.name;
        currentUser.username = data.username;
    }
    addAuditLog({ action_type: AuditActionType.UPDATE_PROFILE, details: 'User updated their profile.' });
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    return userWithoutPassword;
  },

  // === ADMIN ===
  getDealers: async (): Promise<Dealer[]> => {
      await simulateDelay(500);
      return [...dealers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    await simulateDelay(300);
    return auditLogs;
  },
  
  createDealer: async (formData: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }): Promise<{dealer: Dealer, tempPass: string}> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/dealers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Dealer creation failed');
    }
    return await res.json();
  },
  
  updateDealer: async (dealerId: UUID, data: Partial<Omit<Dealer, 'id' | 'user_id'>>): Promise<Dealer> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Dealer update failed');
    }
    return await res.json();
  },

  deleteDealer: async(dealerId: UUID): Promise<void> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Dealer deletion failed');
    }
  },

  resetDealerPassword: async (userId: UUID): Promise<string> => {
    await simulateDelay(500);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    const tempPass = generateTempPassword();
    user.password = tempPass;
    user.tempPass = true;

    addAuditLog({ action_type: AuditActionType.RESET_PASSWORD, details: `Reset password for user: ${user.name}`});
    return tempPass;
  },

  resetDealerPasswordByEmail: async(email: string): Promise<void> => {
     await simulateDelay(500);
     const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
     if (user) {
        // We don't actually send an email, but we log it.
        addAuditLog({ action_type: AuditActionType.RESET_PASSWORD, details: `Password reset requested for user: ${user.name}` });
     }
     // Don't throw an error for privacy reasons.
  },
  
  // === DEALER ===
  getEmployees: async(): Promise<Employee[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/dealer/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch employees');
    }
    return await res.json();
  },
  
  createEmployee: async(employeeData: Omit<Employee, 'id' | 'dealer_id' | 'status'>): Promise<Employee> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/dealer/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(employeeData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Employee creation failed');
    }
    return await res.json();
  },

  updateEmployee: async(employeeId: UUID, data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/dealer/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Employee update failed');
    }
    return await res.json();
  },
  
  terminateEmployee: async (employeeId: UUID, reason: string, date: string): Promise<Employee> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/dealer/employees/${employeeId}/terminate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason, date })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Employee termination failed');
    }
    return await res.json();
  },

  getCustomers: async(): Promise<Customer[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/dealer/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch customers');
    }
    return await res.json();
  },
  
  createCustomer: async(customerData: Omit<Customer, 'id' | 'dealer_id' | 'status'>): Promise<Customer> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/dealer/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(customerData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Customer creation failed');
    }
    return await res.json();
  },
  
  updateCustomer: async(customerId: UUID, data: Partial<Customer>): Promise<Customer> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/dealer/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Customer update failed');
    }
    return await res.json();
  },
  
  getDealerAuditLogs: async(): Promise<AuditLog[]> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/dealer/audit-logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch dealer audit logs');
    }
    return await res.json();
  },

  // === UNIVERSAL ===
  universalSearch: async (searchQuery: string): Promise<GlobalSearchResult[]> => {
    await simulateDelay(700);
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const employeeResults: GlobalSearchResult[] = employees
      .filter(e => 
        e.first_name.toLowerCase().includes(query) ||
        e.last_name.toLowerCase().includes(query) ||
        e.phone.includes(query) ||
        e.aadhar.includes(query)
      )
      .map(e => {
        const dealer = dealers.find(d => d.id === e.dealer_id);
        return {
          entityType: 'employee',
          entityRefId: e.id,
          canonicalName: `${e.first_name} ${e.last_name}`,
          phoneNorm: e.phone,
          identityNorm: e.aadhar,
          ownerDealerId: e.dealer_id,
          ownerDealerName: dealer?.company_name || 'Unknown',
          statusSummary: e.status,
          hireDate: e.hire_date,
          terminationDate: e.termination_date,
          terminationReason: e.termination_reason,
        };
      });
      
    addAuditLog({ action_type: AuditActionType.SEARCH, details: `Searched for: "${searchQuery}"` });
    return employeeResults;
  },

  checkEmployeeByAadhar: async (aadhar: string): Promise<GlobalSearchResult | null> => {
    await simulateDelay(300);
    if (aadhar.length < 12) return null;

    const employee = employees.find(e => e.aadhar === aadhar && e.status === 'active');
    if (!employee) return null;

    const dealer = dealers.find(d => d.id === employee.dealer_id);
    return {
        entityType: 'employee',
        entityRefId: employee.id,
        canonicalName: `${employee.first_name} ${employee.last_name}`,
        phoneNorm: employee.phone,
        identityNorm: employee.aadhar,
        ownerDealerId: employee.dealer_id,
        ownerDealerName: dealer?.company_name || 'Unknown',
        statusSummary: employee.status,
        hireDate: employee.hire_date
    };
  },
};