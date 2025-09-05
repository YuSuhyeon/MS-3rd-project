import React from 'react';

export function Badge({ className = '', children, ...props }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border border-gray-200 bg-gray-100 text-gray-700 ${className}`} {...props}>
      {children}
    </span>
  );
}
