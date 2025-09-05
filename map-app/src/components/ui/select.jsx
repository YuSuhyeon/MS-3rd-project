import React from 'react';

export function Select({ value, onValueChange, children }) {
  return <div data-select-value={value} data-select onChange={onValueChange}>{children}</div>;
}
export function SelectTrigger({ className = '', children, ...props }) {
  return <button className={`w-full h-10 px-3 text-left border border-gray-300 rounded-md bg-white ${className}`} {...props}>{children}</button>;
}
export function SelectValue() { return <span />; }
export function SelectContent({ children }) { return <div className="mt-2 border rounded-md bg-white shadow">{children}</div>; }
export function SelectItem({ value, className = '', children, ...props }) {
  return <div data-value={value} className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${className}`} {...props}>{children}</div>;
}
