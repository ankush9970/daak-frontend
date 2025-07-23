import React from 'react';

export default function Toast({ message, type = 'success' }) {
  const color = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-4 right-4 ${color} text-white px-4 py-2 rounded shadow`}>
      {message}
    </div>
  );
}
