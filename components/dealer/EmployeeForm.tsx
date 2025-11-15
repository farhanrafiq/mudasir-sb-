import React, { useState, useEffect, useRef } from 'react';
import { Employee, GlobalSearchResult } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../common/Alert';
import { formatDate } from '../../utils/helpers';
import Badge from '../common/Badge';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        aadhar: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingEmployeeInfo, setExistingEmployeeInfo] = useState<GlobalSearchResult | null>(null);
    const [isCheckingAadhar, setIsCheckingAadhar] = useState(false);
    const debounceTimeout = useRef<number | null>(null);
    const isTerminated = employee?.status === 'terminated';

    useEffect(() => {
        if (employee) {
            setFormData({
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                phone: employee.phone,
                position: employee.position,
                hire_date: employee.hire_date,
                aadhar: employee.aadhar,
            });
        } else {
             setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: '',
                hire_date: new Date().toISOString().split('T')[0],
                aadhar: '',
            });
        }
        setError('');
        setExistingEmployeeInfo(null);
    }, [employee]);

    useEffect(() => {
        if (employee) return; // Don't check when editing an employee

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        const aadhar = formData.aadhar.trim();
        if (aadhar.length < 12) {
            setExistingEmployeeInfo(null);
            return;
        }

        setIsCheckingAadhar(true);
        debounceTimeout.current = window.setTimeout(async () => {
            try {
                const result = await api.checkEmployeeByAadhar(aadhar);
                setExistingEmployeeInfo(result);
            } catch (err) {
                console.error("Aadhar check failed:", err);
            } finally {
                setIsCheckingAadhar(false);
            }
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [formData.aadhar, employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else if (name === 'aadhar') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 12);
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSubmitting(true);
        setError('');
        
        const submissionData = { ...formData };

        try {
            if (employee) {
                await api.updateEmployee(employee.id, submissionData);
            } else {
                await api.createEmployee(submissionData);
            }
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isReadOnly = !!existingEmployeeInfo;
    const isDisabled = isReadOnly || isTerminated || isSubmitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required disabled={isDisabled} />
                <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required disabled={isDisabled} />
            </div>
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isDisabled} />
            <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} disabled={isDisabled} />
            <Input label="Position" name="position" value={formData.position} onChange={handleChange} required disabled={isDisabled} />
            <Input label="Hire Date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} required disabled={isDisabled} />
            <Input label="Aadhar Number" name="aadhar" value={formData.aadhar} onChange={handleChange} required disabled={!!employee || isSubmitting} maxLength={12} />
            
            {isTerminated && employee && (
                <div className="mt-4 p-4 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                    <h4 className="text-md font-semibold text-red-800">Termination Details</h4>
                    <div className="mt-2 space-y-2 text-sm text-red-700">
                        <p><strong>Status:</strong> <Badge color="red">Terminated</Badge></p>
                        <p><strong>Termination Date:</strong> {employee.termination_date ? formatDate(employee.termination_date) : 'N/A'}</p>
                        <p><strong>Reason:</strong> {employee.termination_reason || 'No reason provided.'}</p>
                    </div>
                </div>
            )}

            {isCheckingAadhar && <p className="text-xs text-gray-500 mt-1">Checking Aadhar number...</p>}
            
            {existingEmployeeInfo && (
                <div className="mt-2">
                    <Alert variant="warning">
                        <div className="text-yellow-800">
                            <p className="font-bold">This Aadhar number is already registered to an active employee.</p>
                            <ul className="list-disc list-inside mt-2 text-sm">
                                <li><strong>Name:</strong> {existingEmployeeInfo.canonicalName}</li>
                                <li><strong>Employer:</strong> {existingEmployeeInfo.ownerDealerName}</li>
                                {existingEmployeeInfo.hireDate && <li><strong>Hire Date:</strong> {formatDate(existingEmployeeInfo.hireDate)}</li>}
                            </ul>
                            <p className="mt-2 text-xs">You cannot add this employee. Please contact the union administrator if you believe this is an error.</p>
                        </div>
                    </Alert>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isDisabled}>
                {isSubmitting ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
                </Button>
            </div>
        </form>
    );
};

export default EmployeeForm;