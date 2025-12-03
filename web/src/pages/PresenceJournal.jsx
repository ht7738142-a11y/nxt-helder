import { useState, useEffect } from 'react';
import { Upload, Plus, Calendar, Building2, FileText, Download, Trash2, Edit2, Users, X } from 'lucide-react';
import { api } from '../api';

export default function PresenceJournal() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chantiers, setChantiers] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState('');
  const [mainCompanies, setMainCompanies] = useState([]);
  const [mainCompanyName, setMainCompanyName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [parsedCompanies, setParsedCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const [existingJournals, setExistingJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('init'); // init, csv-uploaded, journals-created
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [manualForm, setManualForm] = useState({
    subcontractorName: '',
    subcontractorNumber: '',
    workers: [{ niss: '', firstName: '', lastName: '', present: true }]
  });

  useEffect(() => {
    loadChantiers();
    loadMainCompanies();
  }, []);

  useEffect(() => {
    if (selectedChantier && date) {
      loadExistingJournals();
    }
  }, [selectedChantier, date]);

  const loadChantiers = async () => {
    try {
      const { data } = await api.get('/chantiers');
      setChantiers(data || []);
    } catch (error) {
      console.error('Erreur chargement chantiers:', error);
    }
  };

  const loadMainCompanies = async () => {
    try {
      const { data } = await api.get('/presences/main-companies');
      setMainCompanies(data || []);
      if (data.length > 0) {
        setMainCompanyName(data[0].name); // Dernière utilisée par défaut
      }
    } catch (error) {
      console.error('Erreur chargement entreprises principales:', error);
    }
  };

  const loadExistingJournals = async () => {
    try {
      const { data } = await api.get('/presences', {
        params: {
          chantierId: selectedChantier,
          date
        }
      });
      setExistingJournals(data || []);
    } catch (error) {
      console.error('Erreur chargement journaux:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert('Veuillez sélectionner un fichier CSV');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const { data } = await api.post('/presences/import-checkin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setParsedCompanies(data.companies || []);
      setStep('csv-uploaded');
    } catch (error) {
      console.error('Erreur import CSV:', error);
      alert('Erreur lors de l\'import du CSV');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanySelection = (companyNumber) => {
    const newSet = new Set(selectedCompanies);
    if (newSet.has(companyNumber)) {
      newSet.delete(companyNumber);
    } else {
      newSet.add(companyNumber);
    }
    setSelectedCompanies(newSet);
  };

  const handleCreateJournals = async () => {
    if (!selectedChantier) {
      alert('Veuillez sélectionner un chantier');
      return;
    }

    if (!mainCompanyName) {
      alert('Veuillez saisir l\'entreprise ST principale');
      return;
    }

    if (selectedCompanies.size === 0) {
      alert('Veuillez sélectionner au moins une société');
      return;
    }

    setLoading(true);
    try {
      const journals = [];
      parsedCompanies.forEach(company => {
        if (selectedCompanies.has(company.companyNumber)) {
          journals.push({
            subcontractorName: company.companyName,
            subcontractorNumber: company.companyNumber,
            workers: company.workers.map(w => ({
              niss: w.niss,
              firstName: w.firstName,
              lastName: w.lastName,
              morningPresent: true,
              afternoonPresent: true,
              remarks: ''
            }))
          });
        }
      });

      await api.post('/presences', {
        chantierId: selectedChantier,
        date,
        mainCompanyName,
        journals
      });

      alert(`${journals.length} journal(ux) créé(s) avec succès`);
      setStep('journals-created');
      loadExistingJournals();
      setParsedCompanies([]);
      setSelectedCompanies(new Set());
      setCsvFile(null);
    } catch (error) {
      console.error('Erreur création journaux:', error);
      alert('Erreur lors de la création des journaux');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJournal = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce journal ?')) {
      return;
    }

    try {
      await api.delete(`/presences/${id}`);
      loadExistingJournals();
    } catch (error) {
      console.error('Erreur suppression journal:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDownloadPDF = async (journalId) => {
    try {
      const response = await api.get(`/presences/${journalId}/pdf`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `journal-presence-${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleEditJournal = (journal) => {
    // Trier les ouvriers : présents en premier, absents en bas
    const sortedWorkers = [...journal.workers].sort((a, b) => {
      const aPresent = a.present !== false;
      const bPresent = b.present !== false;
      if (aPresent && !bPresent) return -1;
      if (!aPresent && bPresent) return 1;
      return 0;
    });
    
    setEditingJournal(journal);
    setManualForm({
      subcontractorName: journal.subcontractorName,
      subcontractorNumber: journal.subcontractorNumber || '',
      workers: sortedWorkers.map(w => ({
        niss: w.niss || '',
        firstName: w.firstName || '',
        lastName: w.lastName || '',
        present: w.present !== false,
        remarks: w.remarks || ''
      }))
    });
    setShowManualForm(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await api.put(`/presences/${editingJournal._id}`, {
        subcontractorName: manualForm.subcontractorName,
        subcontractorNumber: manualForm.subcontractorNumber,
        workers: manualForm.workers
      });
      alert('Journal modifié avec succès');
      setShowManualForm(false);
      setEditingJournal(null);
      setManualForm({
        subcontractorName: '',
        subcontractorNumber: '',
        workers: [{ niss: '', firstName: '', lastName: '', present: true }]
      });
      loadExistingJournals();
    } catch (error) {
      console.error('Erreur modification journal:', error);
      alert('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('init');
    setParsedCompanies([]);
    setSelectedCompanies(new Set());
    setCsvFile(null);
  };

  const handleCreateManualJournal = async () => {
    if (!selectedChantier) {
      alert('Veuillez sélectionner un chantier');
      return;
    }

    if (!mainCompanyName) {
      alert('Veuillez saisir l\'entreprise ST principale');
      return;
    }

    if (!manualForm.subcontractorName.trim()) {
      alert('Veuillez saisir le nom du sous-traitant');
      return;
    }

    const validWorkers = manualForm.workers.filter(w => w.firstName.trim() || w.lastName.trim());
    if (validWorkers.length === 0) {
      alert('Veuillez ajouter au moins un ouvrier');
      return;
    }

    setLoading(true);
    try {
      const journalData = {
        subcontractorName: manualForm.subcontractorName.trim(),
        subcontractorNumber: manualForm.subcontractorNumber.trim(),
        workers: manualForm.workers.map(w => ({
          niss: w.niss.trim(),
          firstName: w.firstName.trim(),
          lastName: w.lastName.trim(),
          present: w.present !== false,
          remarks: w.remarks || ''
        }))
      };

      await api.post('/presences', {
        chantierId: selectedChantier,
        date,
        mainCompanyName,
        journals: [journalData]
      });

      alert('Journal créé avec succès');
      setShowManualForm(false);
      setManualForm({
        subcontractorName: '',
        subcontractorNumber: '',
        workers: [{ niss: '', firstName: '', lastName: '', present: true, remarks: '' }]
      });
      loadExistingJournals();
    } catch (error) {
      console.error('Erreur création journal manuel:', error);
      alert('Erreur lors de la création du journal');
    } finally {
      setLoading(false);
    }
  };

  const addWorker = () => {
    setManualForm({
      ...manualForm,
      workers: [...manualForm.workers, { niss: '', firstName: '', lastName: '', present: true, remarks: '' }]
    });
  };

  const removeWorker = (index) => {
    const newWorkers = manualForm.workers.filter((_, i) => i !== index);
    setManualForm({ ...manualForm, workers: newWorkers });
  };

  const updateWorker = (index, field, value) => {
    const newWorkers = [...manualForm.workers];
    newWorkers[index][field] = value;
    setManualForm({ ...manualForm, workers: newWorkers });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Journal de Présences
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chantier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chantier
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedChantier}
                onChange={(e) => setSelectedChantier(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un chantier</option>
                {chantiers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pas de chantier ? <a href="/chantiers" className="text-blue-600 hover:underline">Créez-en un ici</a>
            </p>
          </div>

          {/* Entreprise ST Principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise ST Principale
            </label>
            <input
              type="text"
              value={mainCompanyName}
              onChange={(e) => setMainCompanyName(e.target.value)}
              list="main-companies"
              placeholder="Ex: BEMAT, GMOURY..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="main-companies">
              {mainCompanies.map((mc, idx) => (
                <option key={idx} value={mc.name} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Import CSV Section */}
      {step === 'init' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Créer un journal de présence
          </h2>
          
          <div className="space-y-4">
            {/* Option 1: Import CSV */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Option 1: Importer depuis Checkinatwork
              </h3>
              
              <div className="flex items-center gap-4 mb-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {csvFile ? csvFile.name : 'Choisir un fichier CSV...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleImportCSV}
                  disabled={!csvFile || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Import...' : 'Importer'}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Exportez la liste des présences depuis Checkinatwork et importez-la ici.
              </p>
            </div>

            {/* Option 2: Manuel */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Option 2: Saisir manuellement
              </h3>
              
              <p className="text-sm text-gray-500 mb-3">
                Ajoutez manuellement les ouvriers présents sur le chantier.
              </p>

              <button
                onClick={() => setShowManualForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Saisir manuellement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sélection des sociétés */}
      {step === 'csv-uploaded' && parsedCompanies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sélectionner les sociétés présentes
            </h2>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Recommencer
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {parsedCompanies.map(company => (
              <label
                key={company.companyNumber}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCompanies.has(company.companyNumber)}
                  onChange={() => toggleCompanySelection(company.companyNumber)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{company.companyName}</div>
                  <div className="text-sm text-gray-500">
                    N° {company.companyNumber} • {company.workers.length} ouvrier(s)
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleCreateJournals}
            disabled={selectedCompanies.size === 0 || loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Création...' : `Créer ${selectedCompanies.size} journal(ux)`}
          </button>
        </div>
      )}

      {/* Journaux existants */}
      {existingJournals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Journaux pour le {new Date(date).toLocaleDateString('fr-FR')}
            </h2>
            {step !== 'init' && (
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Importer un nouveau CSV
              </button>
            )}
          </div>

          <div className="space-y-3">
            {existingJournals.map(journal => (
              <div
                key={journal._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{journal.subcontractorName}</div>
                  <div className="text-sm text-gray-500">
                    {journal.workers.length} ouvrier(s) • {journal.mainCompanyName}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditJournal(journal)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir/Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteJournal(journal._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(journal._id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    title="Télécharger PDF"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de saisie manuelle */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingJournal ? 'Modifier le journal de présence' : 'Saisie manuelle - Journal de présence'}
              </h2>
              <button
                onClick={() => {
                  setShowManualForm(false);
                  setEditingJournal(null);
                  setManualForm({
                    subcontractorName: '',
                    subcontractorNumber: '',
                    workers: [{ niss: '', firstName: '', lastName: '', present: true }]
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Sous-traitant */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-traitant *
                  </label>
                  <input
                    type="text"
                    value={manualForm.subcontractorName}
                    onChange={(e) => setManualForm({ ...manualForm, subcontractorName: e.target.value })}
                    placeholder="Ex: DELTA PLAC SRL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° entreprise
                  </label>
                  <input
                    type="text"
                    value={manualForm.subcontractorNumber}
                    onChange={(e) => setManualForm({ ...manualForm, subcontractorNumber: e.target.value })}
                    placeholder="Ex: 823108346"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Ouvriers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Ouvriers présents
                  </label>
                  <button
                    onClick={addWorker}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {manualForm.workers.map((worker, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={worker.lastName}
                            onChange={(e) => updateWorker(index, 'lastName', e.target.value)}
                            placeholder="Nom"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={worker.firstName}
                            onChange={(e) => updateWorker(index, 'firstName', e.target.value)}
                            placeholder="Prénom"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={worker.niss}
                            onChange={(e) => updateWorker(index, 'niss', e.target.value)}
                            placeholder="NISS"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={worker.present !== false}
                              onChange={(e) => updateWorker(index, 'present', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Présent</span>
                          </label>
                          <input
                            type="text"
                            value={worker.remarks || ''}
                            onChange={(e) => updateWorker(index, 'remarks', e.target.value)}
                            placeholder="Remarques"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {manualForm.workers.length > 1 && (
                        <button
                          onClick={() => removeWorker(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowManualForm(false);
                  setEditingJournal(null);
                  setManualForm({
                    subcontractorName: '',
                    subcontractorNumber: '',
                    workers: [{ niss: '', firstName: '', lastName: '', present: true }]
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={editingJournal ? handleSaveEdit : handleCreateManualJournal}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? (editingJournal ? 'Enregistrement...' : 'Création...') : (editingJournal ? 'Enregistrer' : 'Créer le journal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
