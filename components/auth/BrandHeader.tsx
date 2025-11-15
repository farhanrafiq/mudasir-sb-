import React from 'react';

const BrandHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
          Union Registry
        </span>
      </h1>
      <p className="text-gray-500">Kashmir Petroleum Dealers Association</p>
    </div>
  );
};

export default BrandHeader;
