import React, { useState, useEffect } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';
import ExamWizard from '@/components/wizard/ExamWizard';
import FormPermissionControl from '@/components/auth/FormPermissionControl';

/**
 * Composant pour le formulaire d'enregistrement d'un examen EEG
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.examen - Les données de l'examen à enregistrer
 * @param {Object} props.user - Les données de l'utilisateur connecté
 * @param {Function} props.onSuccess - Fonction appelée après l'enregistrement réussi
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation
 * @param {Object} props.patient - Les données du patient associé à l'examen
 */
export default function EnregistrementForm({ examen, user, onSuccess, onCancel, patient }) {
  // États du formulaire
  const [form, setForm] = useState({
    technicienEnregistreur: '',
    dateEnregistrement: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    dureeEnregistrement: '',
    typeEnregistrement: 'Standard',
    montageUtilise: '',
    filtresAppliques: '',
    impedances: '',
    calibration: '',
    activationEffectuees: '',
    comportementPatient: '',
    observationsGenerales: '',
    fichierEEG: null
  });
  
  // Mettre à jour les données de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        technicienEnregistreur: user.name || user.displayName || ''
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
                qualification: userDatas.qualification || '',
                specialite: userDatas.specialite || ''
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
  const [images, setImages] = useState(Array(10).fill(null));

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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setForm(prev => ({
        ...prev,
        fichierEEG: files[0]
      }));
      setFileName(files[0].name);
      setFileUploaded(true);
    }
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  /**
   * Calcule la durée d'enregistrement à partir des heures de début et de fin
   */
  const calculerDuree = () => {
    if (form.heureDebut && form.heureFin) {
      try {
        const debut = new Date(`2000-01-01T${form.heureDebut}:00`);
        const fin = new Date(`2000-01-01T${form.heureFin}:00`);
        
        if (fin < debut) {
          // Si l'heure de fin est avant l'heure de début, on ajoute 24h
          fin.setDate(fin.getDate() + 1);
        }
        
        const diffMs = fin - debut;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        
        const duree = `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;
        
        setForm(prev => ({
          ...prev,
          dureeEnregistrement: duree
        }));
      } catch (err) {
        console.error('Erreur lors du calcul de la durée:', err);
      }
    }
  };

  /**
   * Effet pour calculer la durée lorsque les heures changent
   */
  useEffect(() => {
    calculerDuree();
  }, [form.heureDebut, form.heureFin]);

  /**
   * Valide le formulaire avant la soumission
   */
  const validateForm = () => {
    const requiredFields = [
      'technicienEnregistreur',
      'dateEnregistrement',
      'heureDebut',
      'heureFin',
      'dureeEnregistrement',
      'typeEnregistrement',
      'montageUtilise',
      'filtresAppliques',
      'impedances',
      'calibration'
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
    
    try {
      // Simuler l'upload du fichier (à remplacer par une véritable logique d'upload)
      const fileUrl = 'url_du_fichier'; // Ceci serait normalement l'URL retournée par le service de stockage
      
      // Créer l'objet d'enregistrement avec toutes les données de l'utilisateur connecté
      const enregistrementData = {
        ...form,
        fichierEEG: fileUrl,
        patientId: examen.patientId,
        admissionId: examen.id,
        idExamen: examen.id,
        utilisateurId: user?.id || user?.uid || 'unknown',
        utilisateurNom: user?.name || user?.displayName || 'Utilisateur',
        utilisateurEmail: user?.email || '',
        utilisateurRole: user?.role || user?.fonction || '',
        dateCreation: new Date(),
        etat: 'Analyse'
      };
      
      // Enregistrer l'enregistrement
      await firebaseService.addEnregistrement(enregistrementData);
      
      // Mettre à jour l'état de l'admission
      await firebaseService.updateAdmissionStatus(examen.id, 'Analyse');
      
      // Afficher un message de succès
      setMessage(`Enregistrement sauvegardé avec succès ! L'examen passe en état 'Analyse'.`);
      
      // Appeler onSuccess immédiatement
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'enregistrement:", err);
      setError(`Une erreur est survenue : ${err.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Wizard pour afficher les étapes */}
      <ExamWizard currentStep="Enregistrement" />
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Formulaire d'Enregistrement EEG {patient ? `- ${patient.nom} ${patient.prenom}` : `- ${examen.id}`}
      </h2>
      
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
      
      <FormPermissionControl requiredPermission="enregistrer" formType="enregistrement" examen={examen}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="technicienEnregistreur" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technicien enregistreur *
              </label>
              <input
                type="text"
                id="technicienEnregistreur"
                name="technicienEnregistreur"
                value={form.technicienEnregistreur}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-75"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dateEnregistrement" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'enregistrement *
              </label>
              <input
                type="date"
                id="dateEnregistrement"
                name="dateEnregistrement"
                value={form.dateEnregistrement}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="heureDebut" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heure de début *
                </label>
                <input
                  type="time"
                  id="heureDebut"
                  name="heureDebut"
                  value={form.heureDebut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="heureFin" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heure de fin *
                </label>
                <input
                  type="time"
                  id="heureFin"
                  name="heureFin"
                  value={form.heureFin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="dureeEnregistrement" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durée d'enregistrement *
              </label>
              <input
                type="text"
                id="dureeEnregistrement"
                name="dureeEnregistrement"
                value={form.dureeEnregistrement}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="00:00"
                readOnly
                required
              />
            </div>
            
            <div>
              <label htmlFor="typeEnregistrement" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d'enregistrement *
              </label>
              <select
                id="typeEnregistrement"
                name="typeEnregistrement"
                value={form.typeEnregistrement}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="Standard">Standard</option>
                <option value="Ambulatoire">Ambulatoire</option>
                <option value="Vidéo-EEG">Vidéo-EEG</option>
                <option value="Polysomnographie">Polysomnographie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          
          {/* Deuxième colonne */}
          <div className="space-y-4">
            <div>
              <label htmlFor="montageUtilise" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montage utilisé *
              </label>
              <input
                type="text"
                id="montageUtilise"
                name="montageUtilise"
                value={form.montageUtilise}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="filtresAppliques" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtres appliqués *
              </label>
              <input
                type="text"
                id="filtresAppliques"
                name="filtresAppliques"
                value={form.filtresAppliques}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="ex: Passe-haut 0.5Hz, Passe-bas 70Hz, Notch 50Hz"
                required
              />
            </div>
            
            <div>
              <label htmlFor="impedances" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Impédances *
              </label>
              <input
                type="text"
                id="impedances"
                name="impedances"
                value={form.impedances}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="ex: < 5 kΩ pour toutes les électrodes"
                required
              />
            </div>
            
            <div>
              <label htmlFor="calibration" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calibration *
              </label>
              <input
                type="text"
                id="calibration"
                name="calibration"
                value={form.calibration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="ex: 7 μV/mm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="activationEffectuees" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Activations effectuées
              </label>
              <textarea
                id="activationEffectuees"
                name="activationEffectuees"
                value={form.activationEffectuees}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="ex: Hyperventilation, Stimulation lumineuse intermittente"
              />
            </div>
          </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Observations complémentaires</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="comportementPatient" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comportement du patient
              </label>
              <textarea
                id="comportementPatient"
                name="comportementPatient"
                value={form.comportementPatient}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="observationsGenerales" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observations générales
              </label>
              <textarea
                id="observationsGenerales"
                name="observationsGenerales"
                value={form.observationsGenerales}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
          </div>
          <div>
            <label htmlFor="fichierEEG" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fichier EEG traité *
            </label>
            <div className="flex items-center mt-1">
              <label className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-300 rounded-lg shadow-sm border border-blue-300 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer">
                <FiUpload className="mr-2" />
                {fileUploaded ? 'Changer le fichier' : 'Téléverser un fichier'}
                <input
                  type="file"
                  id="fichierEEG"
                  name="fichierEEG"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".eeg,.edf,.bdf,.gdf,.set,.cnt,.vhdr,.vmrk,.dat,.fif,.mat,.nwb,.jpeg,.jpg,.png,.gif,.bmp,.tif,.tiff,.svg,.webp"
                />
              </label>
              {fileUploaded && (
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  {fileName}
                </span>
              )}
            </div>
            
            <div className="my-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Images EEG</h3>
              <div className="flex gap-6 items-center">
                {/* Première colonne d'images */}
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-md p-3">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 1: Rythme de base : aspect général
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded ml-5">
                      {images[0] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[0].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 0)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 2: Dérivations occipitales + YO/YF
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[1] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[1].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 1)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 3: Dérivations centrales + MO/MF
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[2] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[2].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 2)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 4: Dérivations frontales + organisation
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[3] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[3].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 3)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 5: Dérivations temporales + asymétrie
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[4] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[4].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 4)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

                {/* Deuxième colonne d'images */}
                <div className="space-y-4 w-full">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 6: Pointes et pointes lentes + nombre
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[5] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[5].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 5)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 7: Pointes et pointes lentes + cartographie
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[6] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[6].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 6)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 8: Anomalies focales + ICA
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[7] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[7].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 7)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 9: Autres anomalies + cohérence
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[8] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[8].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 8)}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 justify-between">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image 10: Activité gamma (Dérivations laplaciennes)
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-12 bg-gray-50 dark:bg-gray-700 rounded">
                      {images[9] ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{images[9].name}</span>
                      ) : (
                        <div className="flex gap-2 px-1 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Téléverser l'image</span>
                          <FiUpload className="text-gray-500 dark:text-gray-400 mb-1" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 9)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
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