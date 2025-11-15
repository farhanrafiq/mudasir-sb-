import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 text-xs text-gray-500 bg-background flex-shrink-0 border-t border-gray-200">
      &copy; {new Date().getFullYear()} Kashmir Petroleum Dealers Association. All rights reserved.
    </footer>
  );
};

export default Footer;
