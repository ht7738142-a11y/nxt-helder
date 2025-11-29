import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(url = 'http://localhost:5000'){
  const ref = useRef(null)
  useEffect(()=>{
    const s = io(url, { transports:['websocket'], autoConnect:true })
    ref.current = s
    return ()=>{ try { s.disconnect() } catch(_){} }
  }, [url])
  return ref
}
