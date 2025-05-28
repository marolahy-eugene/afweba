import React, { useState } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';
import ExamWizard from '@/components/wizard/ExamWizard';
import FormPermissionControl from '@/components/auth/FormPermissionControl';

/**
 * Composant pour le formulaire d'interprétation d'un examen EEG
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.examen - Les données de l'examen à interpréter
 * @param {Object} props.medecin - Les données du médecin connecté
 * @param {Function} props.onSuccess - Fonction appelée après l'enregistrement réussi
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation
 */
export default function InterpretationForm({ examen, medecin, onSuccess, onCancel }) {
  // États du formulaire
  const [form, setForm] = useState({
    medecinNom: medecin?.displayName || '',
    dateInterpretation: new Date().toISOString().split('T')[0],
    diagnosticPrincipal: '',
    diagnosticsSecondaires: '',
    anomaliesEEG: '',
    correlationsCliniques: '',
    recommandations: '',
    traitementsSuggeres: '',
    examensComplementaires: '',
    suiviRecommande: '',
    commentairesAdditionnels: '',
    fichierRapport: null
  });
  
  // États pour gérer le chargement et les messages
  // État de loading supprimé pour améliorer la fluidité
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Gère le téléversement de fichier
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        fichierRapport: file
      }));
      setFileName(file.name);
      setFileUploaded(true);
    }
  };

  /**
   * Valide le formulaire avant la soumission
   */
  const validateForm = () => {
    const requiredFields = [
      'medecinNom',
      'dateInterpretation',
      'diagnosticPrincipal',
      'anomaliesEEG',
      'recommandations'
    ];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs obligatoires marqués d'un astérisque.`);
      return false;
    }
    
    return true;
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setError(null);
    setMessage(null);
    
    // Valider le formulaire
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simuler l'upload du fichier si présent
      let fileUrl = null;
      if (form.fichierRapport) {
        fileUrl = 'url_du_fichier_rapport'; // Ceci serait normalement l'URL retournée par le service de stockage
      }
      
      // Créer l'objet d'interprétation
      const interpretationData = {
        ...form,
        fichierRapport: fileUrl,
        patientId: examen.patientId,
        admissionId: examen.id,
        idExamen: examen.id,
        medecinId: medecin?.uid || 'unknown',
        dateCreation: new Date(),
        etat: 'Terminé',
        status: 'Terminé', // Ajout du champ status pour compatibilité
        // Convertir les dates en chaînes de caractères pour éviter les erreurs d'affichage
        dateInterpretation: form.dateInterpretation ? form.dateInterpretation.toString() : new Date().toISOString().split('T')[0]
      };
      
      // Enregistrer l'interprétation
      await firebaseService.addInterpretation(interpretationData);
      
      // Mettre à jour l'état de l'admission
      await firebaseService.updateAdmissionStatus(examen.id, 'Terminé');
      
      // Afficher un message de succès
      setMessage(`Interprétation sauvegardée avec succès ! L'examen est maintenant terminé.`);
      
      // Appeler onSuccess après un délai
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'interprétation:", err);
      setError(`Une erreur est survenue : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Wizard pour afficher les étapes */}
      <ExamWizard currentStep="Interpretation" />
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Formulaire d'Interprétation EEG</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <FormPermissionControl requiredPermission="interpreter" formType="interpretation" examen={examen}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Première colonne */}
            <div className="space-y-4">
              <div>
                <label htmlFor="medecinNom" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Médecin interprétant *
                </label>
                <input
                  type="text"
                  id="medecinNom"
                  name="medecinNom"
                  value={form.medecinNom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dateInterpretation" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'interprétation *
                </label>
                <input
                  type="date"
                  id="dateInterpretation"
                  name="dateInterpretation"
                  value={form.dateInterpretation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="diagnosticPrincipal" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnostic principal *
                </label>
                <textarea
                  id="diagnosticPrincipal"
                  name="diagnosticPrincipal"
                  value={form.diagnosticPrincipal}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="diagnosticsSecondaires" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnostics secondaires
                </label>
                <textarea
                  id="diagnosticsSecondaires"
                  name="diagnosticsSecondaires"
                  value={form.diagnosticsSecondaires}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="anomaliesEEG" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anomalies EEG identifiées *
                </label>
                <textarea
                  id="anomaliesEEG"
                  name="anomaliesEEG"
                  value={form.anomaliesEEG}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>
            
            {/* Deuxième colonne */}
            <div className="space-y-4">
              <div>
                <label htmlFor="correlationsCliniques" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Corrélations cliniques
                </label>
                <textarea
                  id="correlationsCliniques"
                  name="correlationsCliniques"
                  value={form.correlationsCliniques}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="recommandations" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recommandations *
                </label>
                <textarea
                  id="recommandations"
                  name="recommandations"
                  value={form.recommandations}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="traitementsSuggeres" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Traitements suggérés
                </label>
                <textarea
                  id="traitementsSuggeres"
                  name="traitementsSuggeres"
                  value={form.traitementsSuggeres}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Suivi et examens complémentaires</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="examensComplementaires" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Examens complémentaires recommandés
                </label>
                <textarea
                  id="examensComplementaires"
                  name="examensComplementaires"
                  value={form.examensComplementaires}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="suiviRecommande" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suivi recommandé
                </label>
                <textarea
                  id="suiviRecommande"
                  name="suiviRecommande"
                  value={form.suiviRecommande}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Commentaires et rapport</h3>
            
            <div>
              <label htmlFor="commentairesAdditionnels" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commentaires additionnels
              </label>
              <textarea
                id="commentairesAdditionnels"
                name="commentairesAdditionnels"
                value={form.commentairesAdditionnels}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div className="mt-4">
              <label htmlFor="fichierRapport" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rapport d'interprétation (PDF)
              </label>
              <div className="flex items-center mt-1">
                <label className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-300 rounded-lg shadow-sm border border-blue-300 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer">
                  <FiUpload className="mr-2" />
                  {fileUploaded ? 'Changer le fichier' : 'Téléverser un rapport'}
                  <input
                    type="file"
                    id="fichierRapport"
                    name="fichierRapport"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                </label>
                {fileUploaded && (
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {fileName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}

              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"

              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <FiSave className="mr-2" />
              Enregistrer
            </button>
          </div>
      </form>
    </FormPermissionControl>
    </div>
  );
}