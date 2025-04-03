import React from 'react';
import { RiImage2Line } from 'react-icons/ri';

const NFTPlaceholder: React.FC = () => {
  return (
    <div className="aspect-square bg-dark-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <RiImage2Line className="w-12 h-12 text-dark-400 mx-auto mb-2" />
        <p className="text-sm text-dark-400">No Image Available</p>
      </div>
    </div>
  );
};

export default NFTPlaceholder; 