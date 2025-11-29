import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const backupDir = process.argv[2] || path.join(process.cwd(), 'backups');
const dbName = process.env.MONGO_URI?.split('/').pop() || 'nxt_helder';

try {
  if (!fs.existsSync(backupDir)) throw new Error(`Backup dir not found: ${backupDir}`);
  const latest = fs
    .readdirSync(backupDir)
    .filter((d) => d.startsWith('dump_'))
    .map((d) => ({ name: d, time: fs.statSync(path.join(backupDir, d)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time)[0];
  if (!latest) throw new Error('No backup found');
  const dumpPath = path.join(backupDir, latest.name, dbName);
  console.log(`[dbRestore] Restoring from: ${dumpPath}`);
  execSync(`mongorestore --drop --db ${dbName} "${dumpPath}"`, { stdio: 'inherit' });
  console.log('[dbRestore] Restore completed');
} catch (e) {
  console.error('[dbRestore] Failed:', e.message);
  process.exit(1);
}
