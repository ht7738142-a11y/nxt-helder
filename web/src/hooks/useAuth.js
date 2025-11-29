import { useEffect, useState } from 'react'
import { getToken, setAuthToken, api } from '../api'

export function useAuth(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const t = getToken()
    if (t) setAuthToken(t)
    setLoading(false)
  }, [])

  async function login(email, password){
    const { data } = await api.post('/auth/login', { email, password })
    setAuthToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout(){ setAuthToken(null); setUser(null) }

  return { user, setUser, loading, login, logout }
}
