import React, { useRef } from 'react'

export default function VoiceInput({ onText, lang='fr-FR', className='' }){
  const recRef = useRef(null)
  function start(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Web Speech API non supportée')
    const rec = new SR()
    rec.lang = lang
    rec.interimResults = false
    rec.onresult = (e)=>{
      const text = Array.from(e.results).map(r=>r[0].transcript).join(' ')
      onText?.(text)
    }
    rec.onend = ()=>{ recRef.current = null }
    recRef.current = rec
    rec.start()
  }
  return <button type="button" onClick={start} className={className || 'px-2 rounded bg-gray-100 border'}>🎤</button>
}
