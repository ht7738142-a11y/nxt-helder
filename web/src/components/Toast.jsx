import React, { useEffect } from 'react'

export default function Toast({ open, type='info', message, onClose, timeout=3000 }){
  useEffect(() => {
    if (!open) return
    const id = setTimeout(()=>onClose?.(), timeout)
    return ()=>clearTimeout(id)
  }, [open, timeout, onClose])
  if (!open) return null
  const color = type==='error' ? 'bg-red-600' : type==='success' ? 'bg-green-600' : 'bg-teal-600'
  return (
    <div className={`fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow ${color}`}>{message}</div>
  )
}
