import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import ForgotPasswordModal from './ForgotPasswordModal';
import BrandHeader from './BrandHeader';

interface DealerLoginPageProps {
    onBack: () => void;
}

const DealerLoginPage: React.FC<DealerLoginPageProps> = ({ onBack }) => {
  const { dealerLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dealerLogin(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <div className="flex flex-grow items-center justify-center bg-background">
        <div className="w-full max-w-md px-4">
            <BrandHeader />
            <Card>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dealer Login</h2>
              <p className="text-gray-500">Use your provided credentials.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={loading}
                autoFocus
                />
                <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                disabled={loading}
                />
                
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordOpen(true); }} className="font-medium text-primary hover:text-blue-700">
                            Forgot password?
                        </a>
                    </div>
                </div>
                
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                
                <div className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button variant="secondary" type="button" onClick={onBack} className="w-full" disabled={loading}>
                        Back
                    </Button>
                </div>
            </form>
            </Card>
        </div>
        </div>
        <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />
    </>
  );
};

export default DealerLoginPage;