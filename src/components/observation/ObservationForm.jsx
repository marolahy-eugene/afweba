import React, { useState, useEffect } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';
import ExamWizard from '@/components/wizard/ExamWizard';
import FormPermissionControl from '@/components/auth/FormPermissionControl';

/**
 * Composant pour le formulaire d'observation d'un examen
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.examen - Les données de l'examen à observer
 * @param {Object} props.user - Les données de l'user connecté
 * @param {Function} props.onSuccess - Fonction appelée après l'enregistrement réussi de l'observation
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation
 */
export default function ObservationForm({ examen, user, onSuccess, onCancel }) {
  // États du formulaire
  const [form, setForm] = useState({
    motif: '',
    histoireRecente: '',
    symptomesActuels: '',
    dernierEvenement: '',
    traitementsRecus: '',
    traitementsEnCours: '',
    dernierePriseMedicaments: '',
    examenActuel: '',
    antecedentsMedicaux: '',
    investigationsAnterieures: '',
    hospitalisationAnterieure: '',
    technicienExaminateur: '',
    adresseLaboratoire: '',
    numeroInscriptionOrdre: '',
    conditionsEnregistrement: '',
    artefacts: '',
    fichierEEG: null
  });

  // États pour gérer le chargement
  const [loading, setLoading] = useState(false);

  // Mettre à jour les données de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        technicienExaminateur: user.name || user.displayName || '',
        numeroInscriptionOrdre: user.numeroOrdre || ''
      }));
      
      // Récupérer des informations supplémentaires sur l'utilisateur si nécessaire
      const fetchUserDetails = async () => {
        try {
          if (user.id || user.uid) {
            const userId = user.id || user.uid;
            const userData = await firebaseService.getUserById(userId);
            if (userData) {
              setForm(prev => ({
                ...prev,
                // Mettre à jour avec des données supplémentaires de l'utilisateur
                adresseLaboratoire: userData.adresseLaboratoire || '',
                qualification: userData.qualification || ''
              }));
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des détails utilisateur:', error);
        }
      };
      
      fetchUserDetails();
    }
  }, [user]);
  
  // États pour gérer les messages
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
        fichierEEG: file
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
      'motif',
      'technicienExaminateur', 
      'adresseLaboratoire', 
      'numeroInscriptionOrdre', 
      'conditionsEnregistrement', 
      'artefacts'
    ];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs obligatoires marqués d'un astérisque.`);
      return false;
    }
    
    if (!fileUploaded) {
      setError('Veuillez téléverser un fichier EEG.');
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

    // Suppression de l'état de loading pour améliorer la fluidité
    setLoading(true);

    try {
      // Simuler l'upload du fichier (à remplacer par une véritable logique d'upload)
      const fileUrl = 'url_du_fichier'; // Ceci serait normalement l'URL retournée par le service de stockage
      
      // Créer l'objet d'observation avec toutes les données de l'utilisateur connecté
      const observationData = {
        ...form,
        fichierEEG: fileUrl,
        patientId: examen.patientId,
        admissionId: examen.id,
        idExamen: examen.id,
        utilisateurId: user?.id || user?.uid || 'unknown',
        utilisateurNom: user?.name || user?.displayName || 'Utilisateur',
        utilisateurEmail: user?.email || '',
        utilisateurRole: user?.role || user?.fonction || '',
        dateObservation: new Date(),
        etat: 'Observation'
      };
      
      // Enregistrer l'observation
      await firebaseService.addObservation(observationData);
      
      // Mettre à jour l'état de l'admission
      await firebaseService.updateAdmissionStatus(examen.id, 'Enregistrement');
      
      // Afficher un message de succès
      setMessage(`Observation enregistrée avec succès ! L'examen passe en état 'Enregistrement'.`);
      
      // Appeler onSuccess immédiatement
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'observation:", err);
      setError(`Une erreur est survenue : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-custom-4 bg-opacity-40 text-gray-200 dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Wizard pour afficher les étapes */}
      <ExamWizard currentStep="Observation" />
      
      {/* <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Formulaire d'Observation</h2> */}
      

      
      <FormPermissionControl requiredPermission="observer" formType="observation" examen={examen}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="motif" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Motif (Question posée par le médecin traitant) *
              </label>
              <textarea
                id="motif"
                name="motif"
                value={form.motif}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="histoireRecente" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Histoire récente et contexte clinique
              </label>
              <textarea
                id="histoireRecente"
                name="histoireRecente"
                value={form.histoireRecente}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="symptomesActuels" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Symptômes actuels
              </label>
              <textarea
                id="symptomesActuels"
                name="symptomesActuels"
                value={form.symptomesActuels}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="dernierEvenement" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Dernier événement
              </label>
              <input
                type="text"
                id="dernierEvenement"
                name="dernierEvenement"
                value={form.dernierEvenement}
                onChange={handleChange}
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="traitementsRecus" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Traitements reçus
              </label>
              <textarea
                id="traitementsRecus"
                name="traitementsRecus"
                value={form.traitementsRecus}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="traitementsEnCours" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Traitements en cours
              </label>
              <textarea
                id="traitementsEnCours"
                name="traitementsEnCours"
                value={form.traitementsEnCours}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
          </div>
          
          {/* Deuxième colonne */}
          <div className="space-y-4">
            <div>
              <label htmlFor="dernierePriseMedicaments" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Dernière prise de médicaments
              </label>
              <input
                type="text"
                id="dernierePriseMedicaments"
                name="dernierePriseMedicaments"
                value={form.dernierePriseMedicaments}
                onChange={handleChange}
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="examenActuel" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Examen actuel
              </label>
              <textarea
                id="examenActuel"
                name="examenActuel"
                value={form.examenActuel}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="antecedentsMedicaux" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Antécédents médicaux pertinents
              </label>
              <textarea
                id="antecedentsMedicaux"
                name="antecedentsMedicaux"
                value={form.antecedentsMedicaux}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="investigationsAnterieures" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Investigations antérieures
              </label>
              <textarea
                id="investigationsAnterieures"
                name="investigationsAnterieures"
                value={form.investigationsAnterieures}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="hospitalisationAnterieure" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Hospitalisation antérieure
              </label>
              <textarea
                id="hospitalisationAnterieure"
                name="hospitalisationAnterieure"
                value={form.hospitalisationAnterieure}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
              />
            </div>
          </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200 dark:text-white">Informations techniques</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="technicienExaminateur" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Technicien examinateur *
              </label>
              <input
                type="text"
                id="technicienExaminateur"
                name="technicienExaminateur"
                value={form.technicienExaminateur}
                readOnly
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white cursor-not-allowed opacity-75"
                required
              />
            </div>
            
            <div>
              <label htmlFor="adresseLaboratoire" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Adresse du laboratoire *
              </label>
              <input
                type="text"
                id="adresseLaboratoire"
                name="adresseLaboratoire"
                value={form.adresseLaboratoire}
                onChange={handleChange}
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="numeroInscriptionOrdre" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Numéro d'inscription à l'Ordre des users *
              </label>
              <input
                type="text"
                id="numeroInscriptionOrdre"
                name="numeroInscriptionOrdre"
                value={form.numeroInscriptionOrdre}
                readOnly
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white cursor-not-allowed opacity-75"
                required
              />
            </div>
            
            <div>
              <label htmlFor="conditionsEnregistrement" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Conditions d'enregistrement *
              </label>
              <textarea
                id="conditionsEnregistrement"
                name="conditionsEnregistrement"
                value={form.conditionsEnregistrement}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="artefacts" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Artefacts *
              </label>
              <textarea
                id="artefacts"
                name="artefacts"
                value={form.artefacts}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border bg-gray-300 bg-opacity-50 text-gray-300 border-gray-400 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 dark:bg-transparent dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="fichierEEG" className="block font-medium text-gray-200 dark:text-gray-300 mb-1">
                Fichier EEG *
              </label>
              <div className="flex items-center mt-1">
                <label className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-20 hover:bg-opacity-30 text-gray-300 dark:bg-gray-700 dark:text-blue-300 rounded-lg shadow-md border border-gray-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer">
                  <FiUpload className="mr-2" />
                  {fileUploaded ? 'Changer le fichier' : 'Téléverser un fichier'}
                  <input
                    type="file"
                    id="fichierEEG"
                    name="fichierEEG"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".eeg,.edf,.bdf,.gdf,.set,.cnt,.vhdr,.vmrk,.dat,.fif,.mat,.nwb,.jpeg,.jpg,.png"
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
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FiSave className="mr-2" />
            {loading ? "Chargement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </FormPermissionControl>
    </div>
  );
}