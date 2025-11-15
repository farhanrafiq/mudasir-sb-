import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface CustomerFormProps {
  customer: Customer | null;
  onSave: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        type: 'private' as 'private' | 'government',
        name_or_entity: '',
        contact_person: '',
        phone: '',
        email: '',
        official_id: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                type: customer.type,
                name_or_entity: customer.name_or_entity,
                contact_person: customer.contact_person || '',
                phone: customer.phone,
                email: customer.email,
                official_id: customer.official_id,
                address: customer.address,
            });
        }
        setError('');
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone' && 'maxLength' in e.target) {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
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

        const submissionData = {
            ...formData,
            contact_person: formData.type === 'government' ? formData.contact_person : undefined,
        };

        try {
            if (customer) {
                await api.updateCustomer(customer.id, submissionData);
            } else {
                await api.createCustomer(submissionData);
            }
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-black focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isSubmitting}>
                    <option value="private">Private</option>
                    <option value="government">Government</option>
                </select>
            </div>
            <Input label={formData.type === 'private' ? 'Full Name' : 'Entity Name'} name="name_or_entity" value={formData.name_or_entity} onChange={handleChange} required disabled={isSubmitting} />
            {formData.type === 'government' && (
                <Input label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} disabled={isSubmitting} />
            )}
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} />
            <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} disabled={isSubmitting} />
            <Input label={formData.type === 'private' ? 'Official ID (e.g., Driver License)' : 'Official ID (e.g., Tax ID)'} name="official_id" value={formData.official_id} onChange={handleChange} required disabled={isSubmitting} />
            <Input label="Address" name="address" value={formData.address} onChange={handleChange} required disabled={isSubmitting} />
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (customer ? 'Save Changes' : 'Create Customer')}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;