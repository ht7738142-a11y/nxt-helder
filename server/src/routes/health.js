import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

router.get('/live', (_req, res) => {
  res.json({ live: true, ts: Date.now() })
})

router.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1
  const state = ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown'
  const status = ready ? 200 : 503
  res.status(status).json({ ready, state, ts: Date.now() })
})

export default router
