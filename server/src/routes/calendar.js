import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import CalendarEvent from '../models/CalendarEvent.js';

const router = Router();
router.use(auth(true));

// GET tous les événements de l'utilisateur connecté
router.get('/events', async (req, res) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.id;
    
    const query = { user: userId };
    
    // Filtrer par période si spécifié
    if (start && end) {
      query.date = { $gte: start, $lte: end };
    }
    
    const events = await CalendarEvent.find(query).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST créer un nouvel événement
router.post('/events', async (req, res) => {
  try {
    const userId = req.user.id;
    const eventData = {
      ...req.body,
      user: userId
    };
    
    const event = await CalendarEvent.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT mettre à jour un événement
router.put('/events/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer un événement
router.delete('/events/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const event = await CalendarEvent.findOneAndDelete({ _id: id, user: userId });
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
