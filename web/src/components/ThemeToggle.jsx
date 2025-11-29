import React, { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(() => localStorage.getItem('nxt_theme')==='dark')
  useEffect(()=>{
    const root = document.documentElement
    if (dark) { root.classList.add('dark'); localStorage.setItem('nxt_theme','dark') }
    else { root.classList.remove('dark'); localStorage.setItem('nxt_theme','light') }
  }, [dark])
  return (
    <button onClick={()=>setDark(v=>!v)} className="px-3 py-1 rounded border text-sm">
      {dark? '🌙 Sombre' : '☀️ Clair'}
    </button>
  )
}
