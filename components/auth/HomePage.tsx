import React from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import BrandHeader from './BrandHeader';

interface HomePageProps {
    onAdminLogin: () => void;
    onDealerLogin: () => void;
}

const DealerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onAdminLogin, onDealerLogin }) => {
  return (
    <div className="flex flex-grow items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <BrandHeader />
        <Card>
            <div className="flex flex-col gap-4">
                <Button onClick={onDealerLogin} className="w-full py-3 text-base">
                    <DealerIcon />
                    <span className="ml-2">Dealer Login</span>
                </Button>
                <Button onClick={onAdminLogin} variant="secondary" className="w-full py-3 text-base">
                    <AdminIcon />
                    <span className="ml-2">Admin Login</span>
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;