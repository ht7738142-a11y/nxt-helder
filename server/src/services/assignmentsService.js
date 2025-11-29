import Assignment from '../models/Assignment.js';
import Contact from '../models/Contact.js';

export async function listAssignments(filter = {}) {
  const query = {};
  
  // Filtre par dates
  if (filter.start || filter.end) {
    query.$or = [
      // Assignment commence dans la période
      {
        startDatetime: {
          ...(filter.start && { $gte: new Date(filter.start) }),
          ...(filter.end && { $lte: new Date(filter.end) })
        }
      },
      // Assignment se termine dans la période
      {
        endDatetime: {
          ...(filter.start && { $gte: new Date(filter.start) }),
          ...(filter.end && { $lte: new Date(filter.end) })
        }
      },
      // Assignment englobe la période
      {
        startDatetime: { $lte: new Date(filter.start) },
        endDatetime: { $gte: new Date(filter.end) }
      }
    ];
  }
  
  // Filtre par chantier
  if (filter.chantier) {
    query.chantier = filter.chantier;
  }
  
  // Filtre par contact
  if (filter.contact) {
    query.assignedContacts = filter.contact;
  }
  
  // Filtre par statut
  if (filter.status) {
    query.status = filter.status;
  }
  
  return Assignment.find(query)
    .populate('chantier')
    .populate('assignedContacts')
    .populate('createdBy', 'name email')
    .sort({ startDatetime: 1 });
}

export async function getAssignmentById(id) {
  return Assignment.findById(id)
    .populate('chantier')
    .populate('assignedContacts')
    .populate('createdBy', 'name email');
}

export async function createAssignment(data, userId) {
  // Valider les dates
  if (new Date(data.endDatetime) <= new Date(data.startDatetime)) {
    throw new Error('La date de fin doit être après la date de début');
  }
  
  // Vérifier que les contacts existent
  if (data.assignedContacts && data.assignedContacts.length > 0) {
    const contacts = await Contact.find({
      _id: { $in: data.assignedContacts }
    });
    
    if (contacts.length !== data.assignedContacts.length) {
      throw new Error('Un ou plusieurs contacts n\'existent pas');
    }
  }
  
  const assignment = await Assignment.create({
    ...data,
    createdBy: userId
  });
  
  return assignment.populate(['chantier', 'assignedContacts', 'createdBy']);
}

export async function updateAssignment(id, data) {
  // Valider les dates si modifiées
  if (data.startDatetime && data.endDatetime) {
    if (new Date(data.endDatetime) <= new Date(data.startDatetime)) {
      throw new Error('La date de fin doit être après la date de début');
    }
  }
  
  const assignment = await Assignment.findByIdAndUpdate(id, data, { new: true })
    .populate('chantier')
    .populate('assignedContacts')
    .populate('createdBy', 'name email');
  
  return assignment;
}

export async function deleteAssignment(id) {
  await Assignment.findByIdAndDelete(id);
  return { ok: true };
}

export async function addContactToAssignment(assignmentId, contactId) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error('Assignment non trouvé');
  
  if (!assignment.assignedContacts.includes(contactId)) {
    assignment.assignedContacts.push(contactId);
    await assignment.save();
  }
  
  return assignment.populate(['chantier', 'assignedContacts', 'createdBy']);
}

export async function removeContactFromAssignment(assignmentId, contactId) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error('Assignment non trouvé');
  
  assignment.assignedContacts = assignment.assignedContacts.filter(
    id => id.toString() !== contactId.toString()
  );
  await assignment.save();
  
  return assignment.populate(['chantier', 'assignedContacts', 'createdBy']);
}

export async function getContactAssignments(contactId, start, end) {
  const query = {
    assignedContacts: contactId,
    startDatetime: { $gte: new Date(start) },
    endDatetime: { $lte: new Date(end) }
  };
  
  return Assignment.find(query)
    .populate('chantier')
    .populate('assignedContacts')
    .sort({ startDatetime: 1 });
}

export async function checkConflicts(contactId, startDatetime, endDatetime, excludeAssignmentId = null) {
  const query = {
    assignedContacts: contactId,
    $or: [
      {
        startDatetime: { $lt: endDatetime },
        endDatetime: { $gt: startDatetime }
      }
    ]
  };
  
  if (excludeAssignmentId) {
    query._id = { $ne: excludeAssignmentId };
  }
  
  return Assignment.find(query).populate('chantier');
}

export async function getAssignmentStats(start, end) {
  const assignments = await Assignment.find({
    startDatetime: { $gte: new Date(start) },
    endDatetime: { $lte: new Date(end) }
  });
  
  const total = assignments.length;
  const byStatus = {};
  const byContact = {};
  
  assignments.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    a.assignedContacts.forEach(c => {
      byContact[c] = (byContact[c] || 0) + 1;
    });
  });
  
  return { total, byStatus, byContact };
}
