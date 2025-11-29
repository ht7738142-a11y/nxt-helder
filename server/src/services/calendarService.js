import Tache from '../models/Tache.js';
import Chantier from '../models/Chantier.js';
import Conge from '../models/Conge.js';

export async function getEvents(start, end, userId) {
  const filter = {};
  if (start || end) {
    filter.$or = [
      { start: { $gte: new Date(start), $lte: new Date(end) } },
      { startDate: { $gte: new Date(start), $lte: new Date(end) } }
    ];
  }
  
  const [taches, chantiers, conges] = await Promise.all([
    Tache.find(userId ? { assignedTo: userId, ...filter } : filter).populate('assignedTo', 'name').populate('chantier', 'title'),
    Chantier.find(filter),
    Conge.find(userId ? { user: userId, ...filter } : filter).populate('user', 'name')
  ]);

  const events = [
    ...taches.map(t => ({
      id: t._id,
      title: t.title,
      start: t.start,
      end: t.end,
      type: 'tache',
      status: t.status,
      assignedTo: t.assignedTo?.name,
      chantier: t.chantier?.title
    })),
    ...chantiers.map(ch => ({
      id: ch._id,
      title: ch.title,
      start: ch.startDate,
      end: ch.endDate,
      type: 'chantier',
      status: ch.status,
      progress: ch.progress
    })),
    ...conges.map(c => ({
      id: c._id,
      title: `Congé ${c.user?.name}`,
      start: c.startDate,
      end: c.endDate,
      type: 'conge',
      status: c.status,
      congeType: c.type
    }))
  ];

  return events;
}
