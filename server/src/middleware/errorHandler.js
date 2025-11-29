import logger from '../lib/logger.js'

export function errorHandler(err, req, res, _next){
  logger.error({ msg: err.message, stack: err.stack, path: req.path })
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Server error' })
}
