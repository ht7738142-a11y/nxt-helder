import React from 'react'

export default function Modal({ open, title, children, onClose }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow-lg w-full max-w-lg p-4">
        <div className="flex items-center mb-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button className="ml-auto px-2 py-1" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
