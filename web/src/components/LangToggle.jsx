import React from 'react'
import { useI18n } from '../i18n'

export default function LangToggle(){
  const { lang, setLang } = useI18n()
  return (
    <select value={lang} onChange={(e)=>setLang(e.target.value)} className="px-2 py-1 border rounded text-sm">
      <option value="fr">FR</option>
      <option value="en">EN</option>
    </select>
  )
}
