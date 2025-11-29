import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import NotificationsBell from './NotificationsBell'

export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-semibold text-teal-700">NXT Hélder</Link>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {/* Liens de navigation retirés sur demande */}
          <ThemeToggle />
          <LangToggle />
          <NotificationsBell />
          {user ? (
            <button onClick={onLogout} className="px-3 py-1 rounded bg-teal-600 text-white">Déconnexion</button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
