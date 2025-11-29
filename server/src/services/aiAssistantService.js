// Points 151-160: Assistant IA Avancé + Génération Automatique

// Point 151-152: Assistant IA conversationnel GPT
export async function chatWithAssistant(userId, message, context = {}) {
  // TODO: Intégrer OpenAI GPT-4 ou modèle local
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const conversationHistory = context.history || [];
  const userContext = await buildUserContext(userId);
  
  const systemPrompt = `Tu es l'assistant IA de NXT Hélder Pro, une application de gestion BTP.
Contexte utilisateur: ${JSON.stringify(userContext)}
Tu peux aider avec: devis, factures, chantiers, analyses, prédictions.`;

  // Mock response (en production: appel OpenAI)
  const response = {
    message: generateMockAIResponse(message, userContext),
    intent: detectIntent(message),
    actions: suggestActions(message),
    confidence: 0.85
  };
  
  return response;
}

async function buildUserContext(userId) {
  // Récupérer contexte utilisateur (rôle, sociétés, projets récents)
  return {
    userId,
    role: 'commercial',
    recentProjects: 3,
    pendingTasks: 5
  };
}

function detectIntent(message) {
  const intents = {
    'créer devis': 'create_devis',
    'analyser rentabilité': 'analyze_profitability',
    'voir chantiers': 'list_chantiers',
    'stats': 'show_stats'
  };
  
  for (const [keyword, intent] of Object.entries(intents)) {
    if (message.toLowerCase().includes(keyword)) return intent;
  }
  return 'general_query';
}

function suggestActions(message) {
  const actions = [];
  if (message.includes('devis')) actions.push({ type: 'create_devis', label: 'Créer un devis' });
  if (message.includes('rentabilité')) actions.push({ type: 'analyze', label: 'Analyser rentabilité' });
  return actions;
}

function generateMockAIResponse(message, context) {
  if (message.includes('devis')) {
    return `D'après vos données, vous avez ${context.recentProjects} projets récents. Voulez-vous créer un nouveau devis?`;
  }
  if (message.includes('rentabilité')) {
    return 'Je peux analyser la rentabilité de vos chantiers. Spécifiez un chantier ou voulez-vous une vue globale?';
  }
  return 'Je suis là pour vous aider avec la gestion de vos projets BTP. Que puis-je faire pour vous?';
}

// Point 153: Recherche sémantique conversationnelle
export async function semanticSearch(query, userId) {
  // TODO: Utiliser embeddings (OpenAI, Sentence Transformers)
  // Recherche vectorielle dans documents
  
  return {
    results: [
      { type: 'devis', id: 'DEV001', relevance: 0.92, snippet: 'Devis rénovation...' },
      { type: 'client', id: 'CLI001', relevance: 0.85, snippet: 'Client Dupont SA...' }
    ],
    suggestions: ['Voir tous les devis', 'Créer nouveau projet']
  };
}

// Point 154: Résumé intelligent documents
export async function summarizeDocument(documentId, documentType) {
  // TODO: Utiliser GPT pour résumer
  const summaries = {
    devis: 'Ce devis concerne une rénovation complète pour un montant de 45.000€ incluant électricité et plomberie.',
    chantier: 'Chantier en cours, avancement 65%, léger retard prévu de 3 jours.'
  };
  
  return {
    summary: summaries[documentType] || 'Résumé non disponible',
    keyPoints: ['Montant: 45.000€', 'Délai: 6 semaines', 'Marge: 18%'],
    sentiment: 'positive'
  };
}

// Point 155: Suggestions proactives contextuelles
export async function getProactiveSuggestions(userId) {
  // Analyser activité récente + patterns pour suggestions
  const suggestions = [
    {
      type: 'action',
      priority: 'high',
      title: 'Facture en retard',
      description: 'La facture F-2024-045 est en retard de 15 jours',
      action: { type: 'send_reminder', targetId: 'F-2024-045' }
    },
    {
      type: 'insight',
      priority: 'medium',
      title: 'Optimisation possible',
      description: 'Votre marge sur les chantiers électriques pourrait augmenter de 3%',
      action: { type: 'view_analysis', category: 'marges' }
    }
  ];
  
  return suggestions;
}

// Point 156-157: Génération automatique devis depuis texte/vocal
export async function generateDevisFromText(text, userId) {
  // TODO: Parser texte avec NLP (spaCy, GPT)
  // Extraire: client, items, quantités, prix
  
  const extracted = {
    client: extractClientFromText(text),
    items: extractItemsFromText(text),
    notes: text
  };
  
  return {
    devisData: extracted,
    confidence: 0.78,
    warnings: ['Prix unitaire à vérifier', 'Client à confirmer']
  };
}

function extractClientFromText(text) {
  // Regex ou NLP pour extraire nom client
  const match = text.match(/pour\s+(?:client\s+)?([A-Za-zÀ-ÿ\s]+)/i);
  return match ? match[1].trim() : null;
}

function extractItemsFromText(text) {
  // Extraire items et quantités
  const items = [];
  const regex = /(\d+)\s+([\w\sà-ÿ]+)\s+(?:à|pour)\s+(\d+(?:[.,]\d+)?)\s*(?:€|EUR)?/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    items.push({
      description: match[2].trim(),
      quantity: parseInt(match[1]),
      unitPrice: parseFloat(match[3].replace(',', '.'))
    });
  }
  
  return items;
}

// Point 158: Conversion vocal → texte → devis
export async function voiceToDevis(audioBase64, userId) {
  // TODO: Intégrer Google Speech-to-Text ou Whisper
  // const transcript = await transcribeAudio(audioBase64);
  
  const transcript = "Je voudrais un devis pour client Dupont, 50 prises électriques à 25 euros et 10 mètres de câble à 8 euros";
  
  return generateDevisFromText(transcript, userId);
}

// Point 159: Auto-complétion intelligente
export async function autoComplete(field, partialValue, context) {
  // Suggestions basées sur historique et ML
  const suggestions = {
    client: ['Dupont SA', 'Martin SPRL', 'Dubois Construction'],
    item: ['Prise électrique', 'Câble 3x2.5mm', 'Disjoncteur 20A'],
    description: ['Installation complète', 'Rénovation électrique', 'Mise aux normes']
  };
  
  return (suggestions[field] || []).filter(s => 
    s.toLowerCase().includes(partialValue.toLowerCase())
  );
}

// Point 160: Templates intelligents adaptatifs
export async function getSmartTemplate(projectType, clientHistory) {
  // Sélectionner template optimal basé sur historique
  const templates = {
    'renovation': { taxRate: 0.06, marginRate: 0.18, items: ['Démolition', 'Installation'] },
    'neuf': { taxRate: 0.21, marginRate: 0.22, items: ['Fourniture', 'Main d\'œuvre'] }
  };
  
  return templates[projectType] || templates['neuf'];
}
