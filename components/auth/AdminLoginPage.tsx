import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import BrandHeader from './BrandHeader';

interface AdminLoginPageProps {
    onBack: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBack }) => {
  const { adminLogin } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <BrandHeader />
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-500">Enter the administrator password.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              disabled={loading}
              autoFocus
            />

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Button>
            
            <Button variant="secondary" type="button" onClick={onBack} className="w-full" disabled={loading}>
              Back
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;