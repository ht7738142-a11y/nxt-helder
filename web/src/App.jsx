import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FormClient from './pages/FormClient.jsx'
import FormDevis from './pages/FormDevis.jsx'
import DevisPDF from './pages/DevisPDF.jsx'
import Contacts from './pages/ContactsNew.jsx'
import Devis from './pages/DevisComplet.jsx'
import Factures from './pages/Factures.jsx'
import Chantiers from './pages/Chantiers.jsx'
import Planning from './pages/PlanningSimple.jsx'
import Stock from './pages/Stock.jsx'
import Parametres from './pages/Parametres.jsx'
import { I18nProvider } from "./i18n.jsx";
import { setAuthToken, getToken, clearTokens } from './api.js'
import Conges from './pages/Conges.jsx'
import IA from './pages/IA.jsx'
import BI from './pages/BI.jsx'
import Workflow from './pages/Workflow.jsx'
import Users from './pages/Users.jsx'
import Audit from './pages/Audit.jsx'
import Depenses from './pages/Depenses.jsx'
import Search from './pages/Search.jsx'
import Taches from './pages/Taches.jsx'
import BISegments from './pages/BISegments.jsx'
import BIMarket from './pages/BIMarket.jsx'
import BIStrategy from './pages/BIStrategy.jsx'
import Health from './pages/Health.jsx'
import Reporting from './pages/Reporting.jsx'
import Mobile from './pages/Mobile.jsx'
import Portal from './pages/Portal.jsx'
import OCR from './pages/OCR.jsx'
import ChantiersCalendrier from './pages/ChantiersCalendrier.jsx'
import ChantierDetail from './pages/ChantierDetail.jsx'
import PlanningGantt from './pages/PlanningGantt.jsx'
import GestionChantiers from './pages/GestionChantiers.jsx'
import Metres from './pages/Metres.jsx'
import Calendar from './pages/Calendar.jsx'
import PresenceJournal from './pages/PresenceJournal.jsx'

function Protected({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Routes publiques (sans navbar/sidebar)
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(location.pathname)

  useEffect(() => {
    const token = getToken()
    if (token) setAuthToken(token)
  }, [])

  function handleLogout() {
    try { clearTokens() } catch {}
    setUser(null)
    navigate('/login')
  }

  return (
    <I18nProvider>
      {isPublicRoute ? (
        // Pages publiques (login/register) sans navbar/sidebar
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      ) : (
        // Pages protégées avec navbar et sidebar
        <div className="min-h-screen dark:bg-gray-950 dark:text-gray-100">
          <Navbar user={user} onLogout={handleLogout} />
          <Sidebar />
          <main className="md:ml-[260px] p-4 pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/contacts" element={<Protected><Contacts /></Protected>} />
              <Route path="/devis" element={<Protected><Devis /></Protected>} />
                <Route path="/factures" element={<Protected><Factures /></Protected>} />
                <Route path="/chantiers" element={<Protected><Chantiers /></Protected>} />
                <Route path="/gestion-chantiers" element={<Protected><GestionChantiers /></Protected>} />
                <Route path="/chantiers/:id" element={<Protected><ChantierDetail /></Protected>} />
                <Route path="/chantiers-calendrier" element={<Protected><ChantiersCalendrier /></Protected>} />
                <Route path="/planning" element={<Protected><Planning /></Protected>} />
                <Route path="/planning-gantt" element={<Protected><PlanningGantt /></Protected>} />
                <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
                <Route path="/stock" element={<Protected><Stock /></Protected>} />
                <Route path="/metres" element={<Protected><Metres /></Protected>} />
                <Route path="/presences" element={<Protected><PresenceJournal /></Protected>} />
                <Route path="/parametres" element={<Protected><Parametres /></Protected>} />
                <Route path="/contacts/new" element={<Protected><FormClient /></Protected>} />
                <Route path="/contacts/edit/:id" element={<Protected><FormClient /></Protected>} />
                <Route path="/devis/new" element={<Protected><FormDevis /></Protected>} />
                <Route path="/devis/:id/pdf" element={<Protected><DevisPDF /></Protected>} />
                <Route path="/conges" element={<Protected><Conges /></Protected>} />
                <Route path="/ia" element={<Protected><IA /></Protected>} />
                <Route path="/bi" element={<Protected><BI /></Protected>} />
                <Route path="/workflow" element={<Protected><Workflow /></Protected>} />
                <Route path="/users" element={<Protected><Users /></Protected>} />
                <Route path="/audit" element={<Protected><Audit /></Protected>} />
                <Route path="/depenses" element={<Protected><Depenses /></Protected>} />
                <Route path="/search" element={<Protected><Search /></Protected>} />
                <Route path="/taches" element={<Protected><Taches /></Protected>} />
                <Route path="/bi-segments" element={<Protected><BISegments /></Protected>} />
                <Route path="/bi-market" element={<Protected><BIMarket /></Protected>} />
                <Route path="/bi-strategy" element={<Protected><BIStrategy /></Protected>} />
                <Route path="/health" element={<Protected><Health /></Protected>} />
                <Route path="/reporting" element={<Protected><Reporting /></Protected>} />
                <Route path="/mobile" element={<Protected><Mobile /></Protected>} />
                <Route path="/portal" element={<Protected><Portal /></Protected>} />
                <Route path="/ocr" element={<Protected><OCR /></Protected>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
      )}
    </I18nProvider>
  )
}
