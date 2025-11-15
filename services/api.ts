import { users, dealers, employees, customers, auditLogs, nextIds } from './mockData';
import { 
    Dealer, 
    Employee, 
    Customer, 
    AuditLog, 
    GlobalSearchResult, 
    UserRole, 
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
  adminLogin: async (password: string): Promise<User> => {
    await simulateDelay(500);
    const user = users.find(u => u.role === UserRole.ADMIN);
    if (user && user.password === password) {
      currentUser = { ...user };
      delete (currentUser as any).password;
      addAuditLog({ action_type: AuditActionType.LOGIN, details: 'Admin logged in.' });
      return currentUser;
    }
    throw new Error("Invalid admin credentials.");
  },

  dealerLogin: async (email: string, password: string): Promise<User> => {
    await simulateDelay(500);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === UserRole.DEALER);
     if (user && user.password === password) {
      currentUser = { ...user };
      delete (currentUser as any).password;
      addAuditLog({ action_type: AuditActionType.LOGIN, details: `Dealer logged in: ${user.name}` });
      return currentUser;
    }
    throw new Error("Invalid dealer credentials.");
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
    return currentUser;
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
    await simulateDelay(800);
    if (dealers.some(d => d.company_name.trim().toLowerCase() === formData.company_name.trim().toLowerCase())) {
        throw new Error("A dealer with this company name already exists.");
    }
    if (users.some(u => u.email.toLowerCase() === formData.primary_contact_email.toLowerCase())) {
        throw new Error("A user with this email already exists.");
    }
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
        throw new Error("A user with this username already exists.");
    }

    const tempPass = generateTempPassword();
    const newUserId = `user-${nextIds.user++}`;

    const newDealerUser: any = {
        id: newUserId,
        role: UserRole.DEALER,
        name: formData.primary_contact_name,
        username: formData.username,
        email: formData.primary_contact_email,
        password: tempPass,
        tempPass: true,
    };
    users.push(newDealerUser);

    const newDealer: Dealer = {
        id: `dealer-${nextIds.dealer++}`,
        user_id: newUserId,
        company_name: formData.company_name,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_phone: formData.primary_contact_phone,
        primary_contact_email: formData.primary_contact_email,
        address: formData.address,
        status: 'active',
        created_at: new Date().toISOString(),
    };
    dealers.push(newDealer);
    newDealerUser.dealerId = newDealer.id;

    addAuditLog({ action_type: AuditActionType.CREATE_DEALER, details: `Created dealer: ${newDealer.company_name}`});
    return { dealer: newDealer, tempPass };
  },
  
  updateDealer: async (dealerId: UUID, data: Partial<Omit<Dealer, 'id' | 'user_id'>>): Promise<Dealer> => {
    await simulateDelay(500);
    const dealer = dealers.find(d => d.id === dealerId);
    if (!dealer) throw new Error("Dealer not found");

    if (data.company_name && data.company_name.trim().toLowerCase() !== dealer.company_name.trim().toLowerCase()) {
      if (dealers.some(d => d.id !== dealerId && d.company_name.trim().toLowerCase() === data.company_name.trim().toLowerCase())) {
        throw new Error("A dealer with this company name already exists.");
      }
    }

    Object.assign(dealer, data);
    addAuditLog({ action_type: AuditActionType.UPDATE_DEALER, details: `Updated dealer: ${dealer.company_name}`});
    return { ...dealer };
  },

  deleteDealer: async(dealerId: UUID): Promise<void> => {
    await simulateDelay(1000);
    const dealerIndex = dealers.findIndex(d => d.id === dealerId);
    if (dealerIndex === -1) throw new Error("Dealer not found");
    
    const deletedDealer = dealers[dealerIndex];
    const userId = deletedDealer.user_id;

    // In a real DB this would be a transaction. Here we do it manually.
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
    }
    dealers.splice(dealerIndex, 1);
    
    addAuditLog({ action_type: AuditActionType.DELETE_DEALER, details: `Deleted dealer: ${deletedDealer.company_name}`});
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
    await simulateDelay(400);
    if (!currentUser || !currentUser.dealerId) throw new Error("Not authorized");
    return employees.filter(e => e.dealer_id === currentUser!.dealerId);
  },
  
  createEmployee: async(employeeData: Omit<Employee, 'id' | 'dealer_id' | 'status'>): Promise<Employee> => {
    await simulateDelay(600);
    if (!currentUser || !currentUser.dealerId) throw new Error("Not authorized");
    
    const existingEmployee = employees.find(e => e.aadhar === employeeData.aadhar);
    if (existingEmployee) {
        const dealer = dealers.find(d => d.id === existingEmployee.dealer_id);
        let message = `An employee with this Aadhar number already exists.`;
        if (dealer) {
            message += ` Current Employer: ${dealer.company_name} (Status: ${existingEmployee.status}).`;
        }
        throw new Error(message);
    }

    const newEmployee: Employee = {
        id: `emp-${nextIds.employee++}`,
        dealer_id: currentUser.dealerId,
        status: 'active',
        ...employeeData
    };
    employees.push(newEmployee);
    addAuditLog({ dealer_id: currentUser.dealerId, action_type: AuditActionType.CREATE_EMPLOYEE, details: `Created employee: ${newEmployee.first_name} ${newEmployee.last_name}` });
    return newEmployee;
  },

  updateEmployee: async(employeeId: UUID, data: Partial<Employee>): Promise<Employee> => {
    await simulateDelay(400);
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    Object.assign(employee, data);
    addAuditLog({ dealer_id: employee.dealer_id, action_type: AuditActionType.UPDATE_EMPLOYEE, details: `Updated employee: ${employee.first_name} ${employee.last_name}` });
    return { ...employee };
  },
  
  terminateEmployee: async (employeeId: UUID, reason: string, date: string): Promise<Employee> => {
    await simulateDelay(700);
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    if (new Date(date) < new Date(employee.hire_date)) {
        throw new Error('Termination date cannot be earlier than the hire date.');
    }

    employee.status = 'terminated';
    employee.termination_date = date;
    employee.termination_reason = reason;

    addAuditLog({ dealer_id: employee.dealer_id, action_type: AuditActionType.TERMINATE_EMPLOYEE, details: `Terminated employee: ${employee.first_name} ${employee.last_name}` });
    return { ...employee };
  },

  getCustomers: async(): Promise<Customer[]> => {
    await simulateDelay(400);
    if (!currentUser || !currentUser.dealerId) throw new Error("Not authorized");
    return customers.filter(c => c.dealer_id === currentUser!.dealerId);
  },
  
  createCustomer: async(customerData: Omit<Customer, 'id' | 'dealer_id' | 'status'>): Promise<Customer> => {
    await simulateDelay(600);
    if (!currentUser || !currentUser.dealerId) throw new Error("Not authorized");

    const newCustomer: Customer = {
        id: `cust-${nextIds.customer++}`,
        dealer_id: currentUser.dealerId,
        status: 'active',
        ...customerData
    };
    customers.push(newCustomer);
    addAuditLog({ dealer_id: currentUser.dealerId, action_type: AuditActionType.CREATE_CUSTOMER, details: `Created customer: ${newCustomer.name_or_entity}` });
    return newCustomer;
  },
  
  updateCustomer: async(customerId: UUID, data: Partial<Customer>): Promise<Customer> => {
    await simulateDelay(400);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error("Customer not found");

    Object.assign(customer, data);
    addAuditLog({ dealer_id: customer.dealer_id, action_type: AuditActionType.UPDATE_CUSTOMER, details: `Updated customer: ${customer.name_or_entity}` });
    return { ...customer };
  },
  
  getDealerAuditLogs: async(): Promise<AuditLog[]> => {
    await simulateDelay(300);
    if (!currentUser || !currentUser.dealerId) return [];
    return auditLogs.filter(log => log.dealer_id === currentUser!.dealerId);
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