import React from 'react';

export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea rows={rows} className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
  );
}
