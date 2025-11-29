import { useMemo } from 'react'
import { api, setAuthToken, getToken } from '../api'

export function useApi(){
  // Ensure auth header is present if token exists
  useMemo(()=>{ const t = getToken(); if (t) setAuthToken(t) }, [])
  return api
}
