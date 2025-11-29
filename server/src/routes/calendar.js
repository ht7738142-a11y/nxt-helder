import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as service from '../services/calendarService.js';

const router = Router();
router.use(auth(true));

router.get('/events', async (req, res) => {
  const { start, end, userId } = req.query;
  const events = await service.getEvents(start, end, userId);
  res.json(events);
});

export default router;
