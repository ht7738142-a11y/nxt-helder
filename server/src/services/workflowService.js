import WorkflowApproval from '../models/WorkflowApproval.js';

// Point 126-130: Workflow validation multiniveaux

export async function createApprovalWorkflow(entityType, entityId, amount, companyId) {
  // Déterminer les approbateurs selon les règles
  const approvers = await determineApprovers(entityType, amount, companyId);
  
  return WorkflowApproval.create({
    company: companyId,
    entityType,
    entityId,
    requiredApprovers: approvers,
    status: approvers.length === 0 ? 'approved' : 'pending'
  });
}

async function determineApprovers(entityType, amount, companyId) {
  // Point 127: Règles d'approbation selon montant
  const approvers = [];
  
  if (amount < 500) {
    return []; // Auto-approuvé
  } else if (amount < 5000) {
    approvers.push({ role: 'chefChantier', level: 1 });
  } else if (amount < 20000) {
    approvers.push({ role: 'chefChantier', level: 1 });
    approvers.push({ role: 'direction', level: 2 });
  } else {
    approvers.push({ role: 'chefChantier', level: 1 });
    approvers.push({ role: 'direction', level: 2 });
    approvers.push({ role: 'admin', level: 3 });
  }
  
  // TODO: Récupérer les users avec ces rôles pour cette company
  return approvers;
}

// Point 128: Approuver niveau
export async function approveLevel(workflowId, userId, comment) {
  const workflow = await WorkflowApproval.findById(workflowId);
  if (!workflow) return null;
  
  // Marquer le niveau actuel comme approuvé
  const currentApprover = workflow.requiredApprovers.find(
    a => a.level === workflow.currentLevel && a.status === 'pending'
  );
  
  if (currentApprover) {
    currentApprover.status = 'approved';
    currentApprover.approvedAt = new Date();
    currentApprover.comment = comment;
  }
  
  workflow.history.push({
    action: 'approved',
    user: userId,
    comment
  });
  
  // Passer au niveau suivant ou finaliser
  const nextLevel = workflow.requiredApprovers.find(
    a => a.level > workflow.currentLevel
  );
  
  if (nextLevel) {
    workflow.currentLevel = nextLevel.level;
  } else {
    workflow.status = 'approved';
  }
  
  await workflow.save();
  return workflow;
}

// Point 129: Rejeter workflow
export async function rejectWorkflow(workflowId, userId, reason) {
  const workflow = await WorkflowApproval.findById(workflowId);
  if (!workflow) return null;
  
  workflow.status = 'rejected';
  workflow.history.push({
    action: 'rejected',
    user: userId,
    comment: reason
  });
  
  await workflow.save();
  return workflow;
}

// Point 130: Notifications approbateurs
export async function notifyApprovers(workflowId) {
  const workflow = await WorkflowApproval.findById(workflowId)
    .populate('requiredApprovers.user', 'email name');
  
  const pendingApprovers = workflow.requiredApprovers.filter(
    a => a.level === workflow.currentLevel && a.status === 'pending'
  );
  
  // TODO: Envoyer emails via notificationService
  return pendingApprovers.map(a => ({
    userId: a.user._id,
    email: a.user.email,
    name: a.user.name
  }));
}
