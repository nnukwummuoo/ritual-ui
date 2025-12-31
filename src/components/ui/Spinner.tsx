import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex flex-col items-center mt-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2" />
    <p className="text-center text-slate-400 text-xs">Loading...</p>
  </div>
);

export default Spinner;