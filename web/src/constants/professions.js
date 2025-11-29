// Liste complète des professions du bâtiment avec icônes
export const PROFESSIONS = [
  { value: "architecte", label: "Architecte", icon: "🏛️", color: "#3B82F6" },
  { value: "ingenieur", label: "Ingénieur", icon: "⚙️", color: "#8B5CF6" },
  { value: "macon", label: "Maçon", icon: "🔨", color: "#EF4444" },
  { value: "charpentier", label: "Charpentier", icon: "🪚", color: "#92400E" },
  { value: "couvreur", label: "Couvreur", icon: "🏠", color: "#DC2626" },
  { value: "electricien", label: "Électricien", icon: "⚡", color: "#F59E0B" },
  { value: "plombier", label: "Plombier", icon: "🔧", color: "#3B82F6" },
  { value: "peintre", label: "Peintre", icon: "🎨", color: "#EC4899" },
  { value: "menuisier", label: "Menuisier", icon: "📐", color: "#78350F" },
  { value: "carreleur", label: "Carreleur", icon: "⬜", color: "#6B7280" },
  { value: "platrier", label: "Plâtrier", icon: "🧱", color: "#9CA3AF" },
  { value: "chauffagiste", label: "Chauffagiste", icon: "🔥", color: "#EA580C" },
  { value: "chef_chantier", label: "Chef de chantier", icon: "👷", color: "#059669" },
  { value: "conducteur_travaux", label: "Conducteur de travaux", icon: "📋", color: "#0891B2" },
  { value: "bureau_etude", label: "Bureau d'étude", icon: "📊", color: "#7C3AED" },
  { value: "geometre", label: "Géomètre", icon: "🗺️", color: "#0D9488" },
  { value: "jardinier", label: "Jardinier", icon: "🌱", color: "#16A34A" },
  { value: "fournisseur", label: "Fournisseur", icon: "📦", color: "#2563EB" },
  { value: "sous_traitant", label: "Sous-traitant", icon: "🤝", color: "#7C2D12" },
  { value: "client", label: "Client", icon: "👤", color: "#6366F1" },
  { value: "prospect", label: "Prospect", icon: "🎯", color: "#10B981" },
  { value: "autre", label: "Autre", icon: "•", color: "#64748B" }
]

// Fonction pour obtenir une profession par sa valeur
export function getProfession(value) {
  return PROFESSIONS.find(p => p.value === value) || PROFESSIONS[PROFESSIONS.length - 1]
}

// Fonction pour obtenir les initiales d'un nom
export function getInitials(firstName, lastName) {
  const first = (firstName || '').trim()[0] || ''
  const last = (lastName || '').trim()[0] || ''
  return (first + last).toUpperCase() || '?'
}

// Fonction pour générer une couleur unique basée sur le nom
export function getColorFromName(name) {
  if (!name) return '#64748B'
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#A855F7'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

// Fonction pour formater un nom complet
export function getFullName(firstName, lastName) {
  const first = (firstName || '').trim()
  const last = (lastName || '').trim()
  return [first, last].filter(Boolean).join(' ') || 'Sans nom'
}
