import React from 'react'
import { NavLink } from 'react-router-dom'

const linkCls = ({ isActive }) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
const sectionTitle = 'text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-4'

export default function Sidebar() {
  return (
    <aside className="hidden md:block bg-gray-900 h-screen fixed left-0 top-[56px] w-[260px] overflow-y-auto">
      <nav className="p-3 space-y-1 pb-20">
        <div className={sectionTitle}>Principal</div>
        <NavLink to="/" className={linkCls}>🏠 Accueil</NavLink>
        <NavLink to="/dashboard" className={linkCls}>📊 Tableau de bord</NavLink>

        <div className={sectionTitle}>Gestion</div>
        <NavLink to="/planning" className={linkCls}>📅 Planning</NavLink>
        <NavLink to="/contacts" className={linkCls}>👥 Contacts</NavLink>
        <NavLink to="/companies" className={linkCls}>🏢 Entreprises</NavLink>
        <NavLink to="/devis" className={linkCls}>📝 Devis</NavLink>
        <NavLink to="/factures" className={linkCls}>💶 Factures</NavLink>
        <NavLink to="/chantiers" className={linkCls}>🏗️ Chantiers</NavLink>
        {/* Liens retirés sur demande */}
        <NavLink to="/stock" className={linkCls}>📦 Stock</NavLink>
        <NavLink to="/metres" className={linkCls}>📐 Métré</NavLink>
        <NavLink to="/taches" className={linkCls}>✅ Tâches</NavLink>
        <NavLink to="/depenses" className={linkCls}>💳 Dépenses</NavLink>
        <NavLink to="/conges" className={linkCls}>🌴 Congés</NavLink>

        <div className={sectionTitle}>Intelligence</div>
        <NavLink to="/ia" className={linkCls}>🤖 IA</NavLink>
        <NavLink to="/bi" className={linkCls}>📈 BI</NavLink>
        <NavLink to="/bi-segments" className={linkCls}>🎯 Segments</NavLink>
        <NavLink to="/bi-market" className={linkCls}>📊 Marché</NavLink>
        <NavLink to="/bi-strategy" className={linkCls}>💡 Stratégie</NavLink>
        <NavLink to="/search" className={linkCls}>🔍 Recherche</NavLink>

        <div className={sectionTitle}>Administration</div>
        <NavLink to="/workflow" className={linkCls}>⚙️ Workflow</NavLink>
        <NavLink to="/users" className={linkCls}>👤 Utilisateurs</NavLink>
        <NavLink to="/audit" className={linkCls}>📋 Audit</NavLink>
        <NavLink to="/reporting" className={linkCls}>📄 Exports</NavLink>
        <NavLink to="/ocr" className={linkCls}>📸 OCR</NavLink>

        <div className={sectionTitle}>Système</div>
        <NavLink to="/mobile" className={linkCls}>📱 Mobile</NavLink>
        <NavLink to="/portal" className={linkCls}>🌐 Portail</NavLink>
        <NavLink to="/health" className={linkCls}>❤️ Santé</NavLink>
        <NavLink to="/parametres" className={linkCls}>⚙️ Paramètres</NavLink>
      </nav>
    </aside>
  )
}
