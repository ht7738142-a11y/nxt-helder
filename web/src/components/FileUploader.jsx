import React, { useRef, useState } from 'react'

export default function FileUploader({ onFiles, multiple = true }){
  const inputRef = useRef(null)
  const [hover, setHover] = useState(false)

  function onDrop(e){
    e.preventDefault(); setHover(false)
    const files = Array.from(e.dataTransfer.files||[])
    onFiles?.(files)
  }
  function onPick(e){
    const files = Array.from(e.target.files||[])
    onFiles?.(files)
  }

  return (
    <div
      className={`border-2 border-dashed rounded p-6 text-center ${hover?'border-teal-600 bg-teal-50':'border-gray-300'}`}
      onDragOver={(e)=>{e.preventDefault(); setHover(true)}}
      onDragLeave={()=>setHover(false)}
      onDrop={onDrop}
    >
      <div className="mb-2">Glissez-déposez des fichiers ici</div>
      <button type="button" className="px-3 py-1 rounded border" onClick={()=>inputRef.current?.click()}>Parcourir…</button>
      <input ref={inputRef} type="file" className="hidden" multiple={multiple} onChange={onPick} />
    </div>
  )
}
