import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function DevisPDF() {
  const { id } = useParams()
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!id) return
    setUrl(`http://localhost:5000/api/devis/${id}/pdf`)
  }, [id])

  if (!id) return <div className="p-4">ID manquant</div>

  return (
    <div className="h-[75vh] bg-white border rounded">
      <iframe title="Devis PDF" src={url} className="w-full h-full" />
    </div>
  )
}
