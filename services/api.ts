import { 
    Dealer, 
    Employee, 
    Customer, 
    AuditLog, 
    GlobalSearchResult, 
    UUID, 
    User,
    UserRole,
    AuditActionType
} from '../types';
import { db, auth } from '../firebase';
import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    deleteDoc, 
    query, 
    where, 
    setDoc,
    getDoc
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { users as mockUsers, dealers as mockDealers, employees as mockEmployees, customers as mockCustomers, auditLogs as mockAuditLogs } from './mockData';

// Feature flag: Set VITE_USE_FIREBASE='true' in .env to switch to Google Cloud
// Safely access env to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};
const USE_FIREBASE = env.VITE_USE_FIREBASE === 'true' && !!db && !!auth;

// Export status for UI components
export const isCloudMode = USE_FIREBASE;

console.log(`[App] Running in ${USE_FIREBASE ? 'FIREBASE (Google Cloud)' : 'MOCK (Local Storage)'} mode.`);

// --- LocalStorage Helpers (Mock Mode) ---
const STORAGE_KEYS = {
    USERS: 'union_users',
    DEALERS: 'union_dealers',
    EMPLOYEES: 'union_employees',
    CUSTOMERS: 'union_customers',
    LOGS: 'union_logs'
};

const initStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    if (!localStorage.getItem(STORAGE_KEYS.DEALERS)) localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(mockDealers));
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(mockEmployees));
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(mockCustomers));
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(mockAuditLogs));
};

// Initialize mock data immediately if not using Firebase
if (!USE_FIREBASE) {
    initStorage();
}

const getLocal = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Implementation ---

export const api = {
  // === AUTH ===
  adminLogin: async (password: string): Promise<User> => {
    if (USE_FIREBASE && auth && db) {
        // For demo purposes in Firebase mode, we'd need a real email/pass login.
        // Assuming admin email is admin@union.org for this example.
        const userCredential = await signInWithEmailAndPassword(auth, 'admin@union.org', password);
        // Fetch user role from Firestore 'users' collection
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.role === UserRole.ADMIN) return { ...userData, id: userCredential.user.uid };
        }
        throw new Error('Unauthorized access or user profile missing.');
    } else {
        await delay();
        const users = getLocal<User & { password: string }>(STORAGE_KEYS.USERS);
        const admin = users.find(u => u.role === UserRole.ADMIN && u.password === password); 
        if (!admin) throw new Error('Invalid password');
        
        // Log action
        const newLog: AuditLog = {
            id: Date.now(),
            who_user_id: admin.id,
            who_user_name: admin.name,
            action_type: AuditActionType.LOGIN,
            details: 'Admin logged in',
            timestamp: new Date().toISOString()
        };
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        setLocal(STORAGE_KEYS.LOGS, [newLog, ...logs]);
        
        return admin;
    }
  },

  dealerLogin: async (email: string, password: string): Promise<User> => {
    if (USE_FIREBASE && auth && db) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
             const userData = userDoc.data() as User;
             return { ...userData, id: userCredential.user.uid };
        }
        throw new Error('User profile not found in database');
    } else {
        await delay();
        const users = getLocal<User & { password: string }>(STORAGE_KEYS.USERS);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) throw new Error('Invalid email or password');
        
        const newLog: AuditLog = {
            id: Date.now(),
            who_user_id: user.id,
            who_user_name: user.name,
            dealer_id: user.dealerId,
            action_type: AuditActionType.LOGIN,
            details: 'Dealer logged in',
            timestamp: new Date().toISOString()
        };
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        setLocal(STORAGE_KEYS.LOGS, [newLog, ...logs]);

        return user;
    }
  },
  
  logout: async (): Promise<void> => {
      if (USE_FIREBASE && auth) {
          await signOut(auth);
      } else {
          await delay(200);
      }
  },

  changePassword: async(userId: UUID, newPass: string): Promise<User> => {
    if (USE_FIREBASE && db) {
        // In a real app, you'd call updatePassword(auth.currentUser, newPass);
        await updateDoc(doc(db, 'users', userId), { tempPass: false });
        const updated = await getDoc(doc(db, 'users', userId));
        return { ...updated.data(), id: userId } as User;
    } else {
        await delay();
        const users = getLocal<User & { password: string }>(STORAGE_KEYS.USERS);
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) throw new Error('User not found');
        
        users[idx].password = newPass;
        users[idx].tempPass = false;
        setLocal(STORAGE_KEYS.USERS, users);
        
        // Audit
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        logs.unshift({
            id: Date.now(),
            who_user_id: userId,
            who_user_name: users[idx].name,
            action_type: AuditActionType.CHANGE_PASSWORD,
            details: 'User changed password',
            timestamp: new Date().toISOString()
        });
        setLocal(STORAGE_KEYS.LOGS, logs);

        return users[idx];
    }
  },
  
  updateUserProfile: async (userId: UUID, data: { name: string; username: string }): Promise<User> => {
      if (USE_FIREBASE && db) {
        await updateDoc(doc(db, 'users', userId), data);
        const u = await getDoc(doc(db, 'users', userId));
        return { ...u.data(), id: userId } as User;
      } else {
        await delay();
        const users = getLocal<User>(STORAGE_KEYS.USERS);
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) throw new Error('User not found');
        
        users[idx] = { ...users[idx], ...data };
        setLocal(STORAGE_KEYS.USERS, users);
        return users[idx];
      }
  },

  // === ADMIN ===
  getDealers: async (): Promise<Dealer[]> => {
      if (USE_FIREBASE && db) {
          const snapshot = await getDocs(collection(db, 'dealers'));
          return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Dealer));
      } else {
          await delay();
          return getLocal<Dealer>(STORAGE_KEYS.DEALERS);
      }
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (USE_FIREBASE && db) {
        const q = query(collection(db, 'audit_logs')); 
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data() as AuditLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
        await delay();
        return getLocal<AuditLog>(STORAGE_KEYS.LOGS);
    }
  },
  
  createDealer: async (formData: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }): Promise<{dealer: Dealer, tempPass: string}> => {
      const tempPass = Math.random().toString(36).slice(-8);
      const newId = crypto.randomUUID();
      const userId = crypto.randomUUID();

      const newDealer: Dealer = {
          id: newId,
          user_id: userId,
          company_name: formData.company_name,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_email: formData.primary_contact_email,
          primary_contact_phone: formData.primary_contact_phone,
          address: formData.address,
          status: 'active',
          created_at: new Date().toISOString()
      };

      const newUser: User & { password: string } = {
          id: userId,
          role: UserRole.DEALER,
          name: formData.company_name,
          username: formData.username,
          email: formData.primary_contact_email,
          dealerId: newId,
          tempPass: true,
          password: tempPass 
      };

      if (USE_FIREBASE && db) {
          // Write to Firestore. 
          // Note: In a real app, User creation in Auth should happen via a Firebase Cloud Function or Admin SDK.
          // Here we simulate by writing to DB only.
          await setDoc(doc(db, 'dealers', newId), newDealer);
          await setDoc(doc(db, 'users', userId), { ...newUser, password: 'HIDDEN' }); 
          return { dealer: newDealer, tempPass: 'ForRealAuthUseConsole' };
      } else {
          await delay();
          const dealers = getLocal<Dealer>(STORAGE_KEYS.DEALERS);
          const users = getLocal<User>(STORAGE_KEYS.USERS);
          
          setLocal(STORAGE_KEYS.DEALERS, [newDealer, ...dealers]);
          setLocal(STORAGE_KEYS.USERS, [...users, newUser]);
          
          return { dealer: newDealer, tempPass };
      }
  },
  
  updateDealer: async (dealerId: UUID, data: Partial<Omit<Dealer, 'id' | 'user_id'>>): Promise<Dealer> => {
    if (USE_FIREBASE && db) {
        await updateDoc(doc(db, 'dealers', dealerId), data);
        const snap = await getDoc(doc(db, 'dealers', dealerId));
        return { ...snap.data(), id: dealerId } as Dealer;
    } else {
        await delay();
        const dealers = getLocal<Dealer>(STORAGE_KEYS.DEALERS);
        const idx = dealers.findIndex(d => d.id === dealerId);
        if (idx === -1) throw new Error('Dealer not found');
        dealers[idx] = { ...dealers[idx], ...data };
        setLocal(STORAGE_KEYS.DEALERS, dealers);
        return dealers[idx];
    }
  },

  deleteDealer: async (dealerId: UUID): Promise<void> => {
      if (USE_FIREBASE && db) {
          await deleteDoc(doc(db, 'dealers', dealerId));
      } else {
          await delay();
          const dealers = getLocal<Dealer>(STORAGE_KEYS.DEALERS).filter(d => d.id !== dealerId);
          setLocal(STORAGE_KEYS.DEALERS, dealers);
          
          const employees = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES).filter(e => e.dealer_id !== dealerId);
          setLocal(STORAGE_KEYS.EMPLOYEES, employees);
      }
  },

  resetDealerPassword: async (userId: UUID): Promise<string> => {
    const newPass = Math.random().toString(36).slice(-8);
    if (USE_FIREBASE) {
        return "ResetViaConsole";
    } else {
        await delay();
        const users = getLocal<User & { password: string }>(STORAGE_KEYS.USERS);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx].password = newPass;
            users[idx].tempPass = true;
            setLocal(STORAGE_KEYS.USERS, users);
        }
        return newPass;
    }
  },

  resetDealerPasswordByEmail: async (email: string): Promise<void> => {
     await delay();
     // Logic to send email would go here
  },
  
  // === DEALER ===
  getEmployees: async (): Promise<Employee[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];

    if (USE_FIREBASE && db) {
        const q = query(collection(db, 'employees'), where('dealer_id', '==', currentUser.dealerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({...d.data(), id: d.id} as Employee));
    } else {
        await delay();
        return getLocal<Employee>(STORAGE_KEYS.EMPLOYEES).filter(e => e.dealer_id === currentUser.dealerId);
    }
  },
  
  createEmployee: async (employeeData: Omit<Employee, 'id' | 'dealer_id' | 'status'>): Promise<Employee> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) throw new Error("No dealer session");

    const newEmployee: Employee = {
        id: crypto.randomUUID(),
        dealer_id: currentUser.dealerId,
        status: 'active',
        ...employeeData
    };

    if (USE_FIREBASE && db) {
        await setDoc(doc(db, 'employees', newEmployee.id), newEmployee);
        return newEmployee;
    } else {
        await delay();
        const list = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES);
        setLocal(STORAGE_KEYS.EMPLOYEES, [newEmployee, ...list]);
        
        // Audit Log
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        logs.unshift({
            id: Date.now(),
            who_user_id: currentUser.id,
            who_user_name: currentUser.name,
            dealer_id: currentUser.dealerId,
            action_type: AuditActionType.CREATE_EMPLOYEE,
            details: `Created employee: ${newEmployee.first_name} ${newEmployee.last_name}`,
            timestamp: new Date().toISOString()
        });
        setLocal(STORAGE_KEYS.LOGS, logs);

        return newEmployee;
    }
  },

  updateEmployee: async (employeeId: UUID, data: Partial<Employee>): Promise<Employee> => {
    if (USE_FIREBASE && db) {
        await updateDoc(doc(db, 'employees', employeeId), data);
        const snap = await getDoc(doc(db, 'employees', employeeId));
        return { ...snap.data(), id: employeeId } as Employee;
    } else {
        await delay();
        const list = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES);
        const idx = list.findIndex(e => e.id === employeeId);
        if (idx === -1) throw new Error("Employee not found");
        list[idx] = { ...list[idx], ...data };
        setLocal(STORAGE_KEYS.EMPLOYEES, list);
        return list[idx];
    }
  },
  
  terminateEmployee: async (employeeId: UUID, reason: string, date: string): Promise<Employee> => {
    if (USE_FIREBASE && db) {
        const updateData = {
            status: 'terminated',
            termination_reason: reason,
            termination_date: date
        };
        await updateDoc(doc(db, 'employees', employeeId), updateData);
        const snap = await getDoc(doc(db, 'employees', employeeId));
        return { ...snap.data(), id: employeeId } as Employee;
    } else {
        await delay();
        const list = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES);
        const idx = list.findIndex(e => e.id === employeeId);
        if (idx === -1) throw new Error("Employee not found");
        
        list[idx].status = 'terminated';
        list[idx].termination_reason = reason;
        list[idx].termination_date = date;
        setLocal(STORAGE_KEYS.EMPLOYEES, list);
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        logs.unshift({
            id: Date.now(),
            who_user_id: currentUser.id,
            who_user_name: currentUser.name,
            dealer_id: currentUser.dealerId,
            action_type: AuditActionType.TERMINATE_EMPLOYEE,
            details: `Terminated employee: ${list[idx].first_name} ${list[idx].last_name}`,
            timestamp: new Date().toISOString()
        });
        setLocal(STORAGE_KEYS.LOGS, logs);
        
        return list[idx];
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];

    if (USE_FIREBASE && db) {
        const q = query(collection(db, 'customers'), where('dealer_id', '==', currentUser.dealerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({...d.data(), id: d.id} as Customer));
    } else {
        await delay();
        return getLocal<Customer>(STORAGE_KEYS.CUSTOMERS).filter(c => c.dealer_id === currentUser.dealerId);
    }
  },
  
  createCustomer: async (customerData: Omit<Customer, 'id' | 'dealer_id' | 'status'>): Promise<Customer> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) throw new Error("No dealer session");

    const newCustomer: Customer = {
        id: crypto.randomUUID(),
        dealer_id: currentUser.dealerId,
        status: 'active',
        ...customerData
    };

    if (USE_FIREBASE && db) {
        await setDoc(doc(db, 'customers', newCustomer.id), newCustomer);
        return newCustomer;
    } else {
        await delay();
        const list = getLocal<Customer>(STORAGE_KEYS.CUSTOMERS);
        setLocal(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...list]);
        return newCustomer;
    }
  },
  
  updateCustomer: async (customerId: UUID, data: Partial<Customer>): Promise<Customer> => {
    if (USE_FIREBASE && db) {
        await updateDoc(doc(db, 'customers', customerId), data);
        const snap = await getDoc(doc(db, 'customers', customerId));
        return { ...snap.data(), id: customerId } as Customer;
    } else {
        await delay();
        const list = getLocal<Customer>(STORAGE_KEYS.CUSTOMERS);
        const idx = list.findIndex(c => c.id === customerId);
        if (idx === -1) throw new Error("Customer not found");
        list[idx] = { ...list[idx], ...data };
        setLocal(STORAGE_KEYS.CUSTOMERS, list);
        return list[idx];
    }
  },
  
  getDealerAuditLogs: async (): Promise<AuditLog[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];

    if (USE_FIREBASE && db) {
        const q = query(collection(db, 'audit_logs'), where('dealer_id', '==', currentUser.dealerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as AuditLog);
    } else {
        await delay();
        return getLocal<AuditLog>(STORAGE_KEYS.LOGS).filter(l => l.dealer_id === currentUser.dealerId);
    }
  },

  // === UNIVERSAL ===
  universalSearch: async (searchQuery: string): Promise<GlobalSearchResult[]> => {
    const qStr = searchQuery.trim().toLowerCase();
    if (!qStr) return [];

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    let allEmployees: Employee[] = [];
    let allDealers: Dealer[] = [];

    if (USE_FIREBASE && db) {
        // Basic implementation. For scalability, use Algolia or ElasticSearch.
        const eSnap = await getDocs(collection(db, 'employees'));
        allEmployees = eSnap.docs.map(d => ({...d.data(), id: d.id} as Employee));
        const dSnap = await getDocs(collection(db, 'dealers'));
        allDealers = dSnap.docs.map(d => ({...d.data(), id: d.id} as Dealer));
    } else {
        await delay();
        allEmployees = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES);
        allDealers = getLocal<Dealer>(STORAGE_KEYS.DEALERS);
    }

    const results: GlobalSearchResult[] = [];

    allEmployees.forEach(emp => {
        if (
            emp.first_name.toLowerCase().includes(qStr) || 
            emp.last_name.toLowerCase().includes(qStr) ||
            emp.phone.includes(qStr) ||
            emp.aadhar.includes(qStr)
        ) {
            const dealer = allDealers.find(d => d.id === emp.dealer_id);
            results.push({
                entityType: 'employee',
                entityRefId: emp.id,
                canonicalName: `${emp.first_name} ${emp.last_name}`,
                phoneNorm: emp.phone,
                identityNorm: emp.aadhar,
                ownerDealerId: emp.dealer_id,
                ownerDealerName: dealer ? dealer.company_name : 'Unknown Dealer',
                statusSummary: emp.status === 'terminated' ? 'terminated' : 'active',
                hireDate: emp.hire_date,
                terminationDate: emp.termination_date,
                terminationReason: emp.termination_reason
            });
        }
    });

    if (!USE_FIREBASE && currentUser.id) { 
        const logs = getLocal<AuditLog>(STORAGE_KEYS.LOGS);
        logs.unshift({
            id: Date.now(),
            who_user_id: currentUser.id,
            who_user_name: currentUser.name,
            dealer_id: currentUser.dealerId,
            action_type: AuditActionType.SEARCH,
            details: `Searched for: ${qStr}`,
            timestamp: new Date().toISOString()
        });
        setLocal(STORAGE_KEYS.LOGS, logs);
    }

    return results;
  },

  checkEmployeeByAadhar: async (aadhar: string): Promise<GlobalSearchResult | null> => {
    if (aadhar.length < 12) return null;

    let allEmployees: Employee[] = [];
    let allDealers: Dealer[] = [];

    if (USE_FIREBASE && db) {
        const q = query(collection(db, 'employees'), where('aadhar', '==', aadhar));
        const snap = await getDocs(q);
        allEmployees = snap.docs.map(d => ({...d.data(), id: d.id} as Employee));
        
        if (allEmployees.length > 0) {
            const dSnap = await getDocs(collection(db, 'dealers'));
            allDealers = dSnap.docs.map(d => ({...d.data(), id: d.id} as Dealer));
        }
    } else {
        await delay();
        allEmployees = getLocal<Employee>(STORAGE_KEYS.EMPLOYEES);
        allDealers = getLocal<Dealer>(STORAGE_KEYS.DEALERS);
    }

    const match = allEmployees.find(e => e.status === 'active' && e.aadhar === aadhar);
    if (!match) return null;

    const dealer = allDealers.find(d => d.id === match.dealer_id);
    
    return {
        entityType: 'employee',
        entityRefId: match.id,
        canonicalName: `${match.first_name} ${match.last_name}`,
        phoneNorm: match.phone,
        identityNorm: match.aadhar,
        ownerDealerId: match.dealer_id,
        ownerDealerName: dealer ? dealer.company_name : 'Unknown Dealer',
        statusSummary: 'active',
        hireDate: match.hire_date
    };
  },
};