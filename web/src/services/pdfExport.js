export async function downloadDevisPdf(id, baseUrl = 'http://localhost:5000'){
  const url = `${baseUrl}/api/devis/${id}/pdf`
  const a = document.createElement('a')
  a.href = url
  a.download = `devis-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function downloadFacturePdf(id, baseUrl = 'http://localhost:5000'){
  const url = `${baseUrl}/api/factures/${id}/pdf`
  const a = document.createElement('a')
  a.href = url
  a.download = `facture-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
