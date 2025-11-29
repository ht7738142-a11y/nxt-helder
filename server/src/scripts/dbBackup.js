import 'dotenv/config'
import { spawn } from 'child_process'
import { env } from '../config/env.js'

// Simple wrapper around mongodump. Requires mongodump to be installed in PATH.
// Usage: node src/scripts/dbBackup.js ./backup-dir
const outDir = process.argv[2] || `./backups/backup-${Date.now()}`

console.log(`[db:backup] Dumping ${env.MONGO_URI} -> ${outDir}`)

const args = [
  `--uri=${env.MONGO_URI}`,
  `--out=${outDir}`,
]

const proc = spawn('mongodump', args, { stdio: 'inherit', shell: true })
proc.on('exit', (code)=>{
  if (code === 0) {
    console.log(`[db:backup] Done -> ${outDir}`)
    process.exit(0)
  } else {
    console.error(`[db:backup] Failed with code ${code}`)
    process.exit(code || 1)
  }
})
