import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

interface TerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: () => void;
}

const TerminationModal: React.FC<TerminationModalProps> = ({ isOpen, onClose, employee, onSave }) => {
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setError('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError('');
        if (!employee || !reason.trim() || !date) {
            setError('Termination date and reason are required.');
            return;
        }
        if (new Date(date) < new Date(employee.hire_date)) {
            setError('Termination date cannot be earlier than the hire date.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.terminateEmployee(employee.id, reason, date);
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Terminate ${employee.first_name} ${employee.last_name}`}>
            <div className="space-y-4">
                <p>Please provide the termination date and reason. This information will be visible in universal search results across the network.</p>
                <Input
                    label="Termination Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <div>
                    <label htmlFor="termination_reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Termination Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="termination_reason"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-black focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="A reason is required and will be logged permanently."
                        disabled={isSubmitting}
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Terminating...' : 'Confirm Termination'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TerminationModal;