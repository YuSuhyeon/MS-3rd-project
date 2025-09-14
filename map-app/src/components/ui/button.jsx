import React from 'react';

export function Button({ className = '', variant = 'default', size = 'md', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  };
  const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-6 text-lg', icon: 'h-10 w-10' };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}
