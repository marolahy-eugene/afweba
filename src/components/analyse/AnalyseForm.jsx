import React, { useState, useEffect } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';
import ExamWizard from '@/components/wizard/ExamWizard';
import FormPermissionControl from '@/components/auth/FormPermissionControl';

/**
 * Composant pour le formulaire d'analyse d'un examen EEG
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.examen - Les données de l'examen à analyser
 * @param {Object} props.user - Les données de l'user connecté
 * @param {Function} props.onSuccess - Fonction appelée après l'enregistrement réussi
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation
 */
export default function AnalyseForm({ examen, user, onSuccess, onCancel }) {
  // États du formulaire
  const [form, setForm] = useState({
    analysteNom: '',
    dateAnalyse: new Date().toISOString().split('T')[0],
    rythmeBase: '',
    activiteAnormale: '',
    ondesAnormales: '',
    asymetries: '',
    reactivite: '',
    etatVigilance: '',
    activationHyperventilation: '',
    activationSLI: '',
    autresActivations: '',
    artefacts: '',
    conclusionAnalyse: '',
    fichierAnalyse: null
  });
  
  // Mettre à jour les données de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        analysteNom: user.name || user.displayName || '',
        // Ajoutez ici d'autres champs à pré-remplir avec les données de l'utilisateur
        // Par exemple: qualification, spécialité, etc.
      }));
      
      // Récupérer des informations supplémentaires sur l'utilisateur si nécessaire
      const fetchUserDetails = async () => {
        try {
          if (user.id || user.uid) {
            const userId = user.id || user.uid;
            const userDatas = await firebaseService.getUserById(userId);
            if (userDatas) {
              setForm(prev => ({
                ...prev,
                // Mettre à jour avec des données supplémentaires de l'utilisateur
                analysteQualification: userDatas.qualification || '',
                analysteSpecialite: userDatas.specialite || ''
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
        fichierAnalyse: file
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
      'analysteNom',
      'dateAnalyse',
      'rythmeBase',
      'conclusionAnalyse'
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
    
    try {
      // Simuler l'upload du fichier si présent
      let fileUrl = null;
      if (form.fichierAnalyse) {
        fileUrl = 'url_du_fichier_analyse'; // Ceci serait normalement l'URL retournée par le service de stockage
      }
      
      // Créer l'objet d'analyse avec toutes les données de l'utilisateur connecté
      const analyseData = {
        ...form,
        fichierAnalyse: fileUrl,
        patientId: examen.patientId,
        admissionId: examen.id,
        idExamen: examen.id,
        utilisateurId: user?.id || user?.uid || 'unknown',
        utilisateurNom: user?.name || user?.displayName || 'Utilisateur',
        utilisateurEmail: user?.email || '',
        utilisateurRole: user?.role || user?.fonction || '',
        dateCreation: new Date(),
        etat: 'Interpretation',
        status: 'Interpretation' // Ajout du champ status pour compatibilité
      };
      
      // Enregistrer l'analyse
      await firebaseService.addAnalyse(analyseData);
      
      // Mettre à jour l'état de l'admission
      await firebaseService.updateAdmissionStatus(examen.id, 'Interpretation');
      
      // Afficher un message de succès
      setMessage(`Analyse sauvegardée avec succès ! L'examen passe en état 'Interpretation'.`);
      
      // Appeler onSuccess immédiatement
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'analyse:", err);
      setError(`Une erreur est survenue : ${err.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Wizard pour afficher les étapes */}
      <ExamWizard currentStep="Analyse" />
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Formulaire d'Analyse EEG</h2>
      
      <FormPermissionControl requiredPermission="analyser" formType="analyse" examen={examen}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="analysteNom" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de l'analyste *
              </label>
              <input
                type="text"
                id="analysteNom"
                name="analysteNom"
                value={form.analysteNom}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-75"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dateAnalyse" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'analyse *
              </label>
              <input
                type="date"
                id="dateAnalyse"
                name="dateAnalyse"
                value={form.dateAnalyse}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rythmeBase" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rythme de base *
              </label>
              <textarea
                id="rythmeBase"
                name="rythmeBase"
                value={form.rythmeBase}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Description du rythme de base"
                required
              />
            </div>
            
            <div>
              <label htmlFor="activiteAnormale" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Activité anormale
              </label>
              <textarea
                id="activiteAnormale"
                name="activiteAnormale"
                value={form.activiteAnormale}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="ondesAnormales" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ondes anormales
              </label>
              <textarea
                id="ondesAnormales"
                name="ondesAnormales"
                value={form.ondesAnormales}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          
          {/* Deuxième colonne */}
          <div className="space-y-4">
            <div>
              <label htmlFor="asymetries" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asymétries
              </label>
              <textarea
                id="asymetries"
                name="asymetries"
                value={form.asymetries}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="reactivite" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Réactivité
              </label>
              <textarea
                id="reactivite"
                name="reactivite"
                value={form.reactivite}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="etatVigilance" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                État de vigilance
              </label>
              <select
                id="etatVigilance"
                name="etatVigilance"
                value={form.etatVigilance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Éveil">Éveil</option>
                <option value="Somnolence">Somnolence</option>
                <option value="Sommeil léger">Sommeil léger</option>
                <option value="Sommeil profond">Sommeil profond</option>
                <option value="Sommeil paradoxal">Sommeil paradoxal</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="artefacts" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Artefacts
              </label>
              <textarea
                id="artefacts"
                name="artefacts"
                value={form.artefacts}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Réponses aux activations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="activationHyperventilation" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Réponse à l'hyperventilation
              </label>
              <textarea
                id="activationHyperventilation"
                name="activationHyperventilation"
                value={form.activationHyperventilation}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="activationSLI" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Réponse à la stimulation lumineuse intermittente
              </label>
              <textarea
                id="activationSLI"
                name="activationSLI"
                value={form.activationSLI}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="autresActivations" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Autres activations
              </label>
              <textarea
                id="autresActivations"
                name="autresActivations"
                value={form.autresActivations}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Conclusion</h3>
          
          <div>
            <label htmlFor="conclusionAnalyse" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conclusion de l'analyse *
            </label>
            <textarea
              id="conclusionAnalyse"
              name="conclusionAnalyse"
              value={form.conclusionAnalyse}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="fichierAnalyse" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fichier d'analyse (optionnel)
            </label>
            <div className="flex items-center mt-1">
              <label className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-300 rounded-lg shadow-sm border border-blue-300 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer">
                <FiUpload className="mr-2" />
                {fileUploaded ? 'Changer le fichier' : 'Téléverser un fichier'}
                <input
                  type="file"
                  id="fichierAnalyse"
                  name="fichierAnalyse"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.png"
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