import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nxt_helder';
  mongoose.set('strictQuery', true);
  console.log('[connectDB] Using Mongo URI:', uri);
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
}
