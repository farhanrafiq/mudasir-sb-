import React from 'react';
import { isCloudMode } from '../../services/api';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center py-4 text-xs text-gray-500 bg-background flex-shrink-0 border-t border-gray-200">
      <p>&copy; {new Date().getFullYear()} Kashmir Petroleum Dealers Association. All rights reserved.</p>
      <div className="mt-2 flex items-center gap-2" title={isCloudMode ? 'Connected to Google Cloud' : 'Running in Local Demo Mode'}>
          <span className={`inline-block w-2 h-2 rounded-full ${isCloudMode ? 'bg-green-500' : 'bg-orange-500'}`}></span>
          <span className="font-medium">{isCloudMode ? 'Cloud Database Connected' : 'Local Demo Mode (Browser Storage)'}</span>
      </div>
    </footer>
  );
};

export default Footer;