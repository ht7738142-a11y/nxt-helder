import FeatureFlag from '../models/FeatureFlag.js';

export function requireFlag(key) {
  return async (req, res, next) => {
    try {
      const flag = await FeatureFlag.findOne({ key });
      if (flag && flag.enabled) return next();
      return res.status(403).json({ error: 'Feature disabled', feature: key });
    } catch (e) {
      return res.status(500).json({ error: 'Feature flag error' });
    }
  };
}
