import User from '../models/User.js';

export async function listUsers() {
  return User.find().select('-password');
}

export async function getUserById(id) {
  return User.findById(id).select('-password');
}

export async function createUser(data) {
  const user = await User.create(data);
  return User.findById(user._id).select('-password');
}

export async function updateUser(id, data) {
  // if password present, model pre-save will hash only on save(); findByIdAndUpdate bypasses hooks
  // So we load and set to trigger hashing
  const doc = await User.findById(id);
  if (!doc) return null;
  Object.assign(doc, data);
  await doc.save();
  const { password, ...rest } = doc.toObject();
  return rest;
}

export async function deleteUser(id) {
  const doc = await User.findByIdAndDelete(id);
  if (!doc) return null;
  const { password, ...rest } = doc.toObject();
  return rest;
}
