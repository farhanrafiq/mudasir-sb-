import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmployeeModel } from '../models/Employee';
import { CustomerModel } from '../models/Customer';
import { DealerModel } from '../models/Dealer';
import { UserModel } from '../models/User';
import { AuditLogModel } from '../models/AuditLog';

// Employee Controllers
export const getDealerEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const employees = await EmployeeModel.findByDealerId(dealerId);
    res.json(employees);
  } catch (error) {
    console.error('Get dealer employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const employeeData = (req as any).body;

    // Check if employee with this Aadhar already exists
    const existingEmployee = await EmployeeModel.findByAadhar(employeeData.aadhar);
    
    if (existingEmployee) {
      const dealer = await DealerModel.findById(existingEmployee.dealer_id);
      res.status(409).json({
        message: `An employee with this Aadhar number already exists. Current Employer: ${dealer?.company_name} (Status: ${existingEmployee.status}).`
      });
      return;
    }

    // Create employee
    const employee = await EmployeeModel.create({
      ...employeeData,
      dealer_id: dealerId,
    });

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    const dealer = await DealerModel.findById(dealerId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: dealerId,
      action_type: 'create_employee',
      details: `Created employee: ${employee.first_name} ${employee.last_name} at ${dealer!.company_name}`,
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const { employeeId } = (req as any).params;
    const updates = (req as any).body;

    // Check if employee exists and belongs to dealer
    const employee = await EmployeeModel.findById(employeeId);
    
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    if (employee.dealer_id !== dealerId) {
      res.status(403).json({ message: 'Forbidden.' });
      return;
    }

    // Ensure aadhar cannot be changed
    delete updates.aadhar;

    // Update employee
    const updatedEmployee = await EmployeeModel.update(employeeId, updates);

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: dealerId,
      action_type: 'update_employee',
      details: `Updated employee: ${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const terminateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const { employeeId } = (req as any).params;
    const { reason, date } = (req as any).body;

    // Check if employee exists and belongs to dealer
    const employee = await EmployeeModel.findById(employeeId);
    
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    if (employee.dealer_id !== dealerId) {
      res.status(403).json({ message: 'Forbidden.' });
      return;
    }

    // Validate termination date
    const terminationDate = new Date(date);
    const hireDate = new Date(employee.hire_date);

    if (terminationDate < hireDate) {
      res.status(400).json({ message: 'Termination date cannot be earlier than the hire date.' });
      return;
    }

    // Terminate employee
    const updatedEmployee = await EmployeeModel.terminate(employeeId, terminationDate, reason);

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: dealerId,
      action_type: 'terminate_employee',
      details: `Terminated employee: ${updatedEmployee.first_name} ${updatedEmployee.last_name}. Reason: ${reason}`,
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Terminate employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Customer Controllers
export const getDealerCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const customers = await CustomerModel.findByDealerId(dealerId);
    res.json(customers);
  } catch (error) {
    console.error('Get dealer customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const customerData = (req as any).body;

    // Create customer
    const customer = await CustomerModel.create({
      ...customerData,
      dealer_id: dealerId,
    });

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    const dealer = await DealerModel.findById(dealerId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: dealerId,
      action_type: 'create_customer',
      details: `Created customer: ${customer.name_or_entity} at ${dealer!.company_name}`,
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const { customerId } = (req as any).params;
    const updates = (req as any).body;

    // Check if customer exists and belongs to dealer
    const customer = await CustomerModel.findById(customerId);
    
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    if (customer.dealer_id !== dealerId) {
      res.status(403).json({ message: 'Forbidden.' });
      return;
    }

    // Update customer
    const updatedCustomer = await CustomerModel.update(customerId, updates);

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: dealerId,
      action_type: 'update_customer',
      details: `Updated customer: ${updatedCustomer.name_or_entity}`,
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Dealer Audit Logs
export const getDealerAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealerId = req.user!.dealerId!;
    const logs = await AuditLogModel.findByDealerId(dealerId);
    res.json(logs);
  } catch (error) {
    console.error('Get dealer audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
