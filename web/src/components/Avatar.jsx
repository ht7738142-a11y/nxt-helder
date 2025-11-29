import React from 'react';
import { getInitials, getProfession } from '../constants/professions';

export default function Avatar({ contact, size = 'md', showIcon = false, className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };
  
  const initials = getInitials(contact?.firstName, contact?.lastName);
  const color = contact?.colorTag || '#3B82F6';
  const profession = getProfession(contact?.profile);
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shadow-md`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {showIcon && profession && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-md">
          {profession.icon}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ contacts, max = 3, size = 'md' }) {
  const visible = contacts.slice(0, max);
  const remaining = contacts.length - max;
  
  return (
    <div className="flex -space-x-2">
      {visible.map((contact, idx) => (
        <Avatar key={contact._id || idx} contact={contact} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className={`${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'} rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 ring-2 ring-white`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
