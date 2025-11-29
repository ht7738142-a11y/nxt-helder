import 'dotenv/config'
import readline from 'readline'
import { connectDB } from '../lib/db.js'
import User from '../models/User.js'

async function prompt(q){
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise(res=> rl.question(q, (a)=>res(a)))
  rl.close();
  return answer
}

async function run(){
  await connectDB()
  const name = (await prompt('Admin name: ')).trim() || 'Administrator'
  const email = (await prompt('Admin email: ')).trim().toLowerCase()
  const pass = (await prompt('Admin password: ')).trim()
  if (!email || !pass) throw new Error('email and password required')
  const exists = await User.findOne({ email })
  if (exists) { console.log('User already exists:', email); process.exit(0) }
  const u = await User.create({ name, email, password: pass, role: 'admin' })
  console.log('Admin created:', { id: u._id.toString(), email: u.email })
  process.exit(0)
}

run().catch(e=>{ console.error(e); process.exit(1) })
