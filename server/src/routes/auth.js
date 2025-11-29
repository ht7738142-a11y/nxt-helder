import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).required(),
    role: Joi.string().valid('admin','commercial','ouvrier','comptable','direction').default('commercial')
  })
}

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email exists' });
    const user = await User.create({ name, email, password, role });
    res.json({ id: user._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rate limiter désactivé pour le développement
// const loginLimiter = rateLimit({ windowMs: 1*60*1000, max: 100 });
const loginSchema = { body: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required(), otp: Joi.string().length(6).optional() }) };

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.twoFactorEnabled) {
      if (!otp) return res.status(401).json({ error: 'OTP required' });
      const valid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: otp, window: 1 });
      if (!valid) return res.status(401).json({ error: 'Invalid OTP' });
    }
    const accessToken = signAccessToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken({ id: user._id });
    const payload = verifyRefreshToken(refreshToken);
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(payload.exp*1000), ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, role: user.role, email: user.email, twoFactorEnabled: user.twoFactorEnabled } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const refreshSchema = { body: Joi.object({ refreshToken: Joi.string().required() }) };
router.post('/refresh', validate(refreshSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const saved = await RefreshToken.findOne({ token: refreshToken, revokedAt: null });
    if (!saved) return res.status(401).json({ error: 'Invalid refresh' });
    const decoded = verifyRefreshToken(refreshToken);
    // rotate
    saved.revokedAt = new Date();
    await saved.save();
    const user = await User.findById(decoded.id);
    const accessToken = signAccessToken({ id: user._id, role: user.role, name: user.name });
    const nextRefresh = signRefreshToken({ id: user._id });
    const payload = verifyRefreshToken(nextRefresh);
    await RefreshToken.create({ user: user._id, token: nextRefresh, expiresAt: new Date(payload.exp*1000), ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ accessToken, refreshToken: nextRefresh });
  } catch (e) {
    res.status(401).json({ error: 'Refresh failed' });
  }
});

const revokeSchema = { body: Joi.object({ refreshToken: Joi.string().required() }) };
router.post('/logout', validate(revokeSchema), async (req, res) => {
  const { refreshToken } = req.body;
  await RefreshToken.findOneAndUpdate({ token: refreshToken, revokedAt: null }, { revokedAt: new Date() });
  res.json({ ok: true });
});

// 2FA: setup (generate secret + QR)
router.post('/2fa/setup', auth(true), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const secret = speakeasy.generateSecret({ length: 20, name: `NXT Helder (${user.email})`, issuer: 'NXT Helder' });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ otpauth_url: secret.otpauth_url, base32: secret.base32, qrDataUrl: qr });
  } catch (e) {
    res.status(500).json({ error: '2FA setup failed' });
  }
});

// 2FA: verify (enable)
const verify2FASchema = { body: Joi.object({ token: Joi.string().length(6).required() }) };
router.post('/2fa/verify', auth(true), validate(verify2FASchema), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.twoFactorSecret) return res.status(400).json({ error: 'No 2FA secret set' });
    const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: req.body.token, window: 1 });
    if (!ok) return res.status(400).json({ error: 'Invalid token' });
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ enabled: true });
  } catch (e) {
    res.status(500).json({ error: '2FA verify failed' });
  }
});

export default router;
