import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiUpload, FiLock } from 'react-icons/fi';

// Fonction pour compresser l'image
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Créer un canvas pour la compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Définir les dimensions maximales
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        // Calculer les nouvelles dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        // Redimensionner l'image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en Blob avec une qualité réduite
        canvas.toBlob((blob) => {
          if (blob) {
            // Créer un nouveau fichier à partir du blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Échec de la compression de l\'image'));
          }
        }, 'image/jpeg', 0.7); // Qualité 70%
      };
      img.onerror = (error) => {
        reject(error);
      };
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Composant de formulaire modal pour ajouter ou modifier un utilisateur
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.currentUser - Utilisateur à modifier (null pour un nouvel utilisateur)
 * @param {Function} props.onSave - Fonction appelée lors de la sauvegarde
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation
 * @param {boolean} props.fromProfile - Indique si le modal est appelé depuis la page de profil
 */
const UserFormModal = ({ currentUser, onSave, onCancel, fromProfile = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.photoURL || null);
  const [passwordError, setPasswordError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Réinitialiser le statut de soumission après quelques secondes
  useEffect(() => {
    if (submissionStatus) {
      const timer = setTimeout(() => {
        setSubmissionStatus(null);
        setSubmissionMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus]);

  // Gérer le changement de l'image de profil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setPasswordError('L\'image est trop volumineuse. Veuillez choisir une image de moins de 2MB.');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        setPasswordError('Veuillez sélectionner une image valide (JPG, PNG, GIF).');
        return;
      }

      setProfileImage(file);
      
      // Créer une URL pour prévisualiser l'image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Éviter les soumissions multiples
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Traitement en cours...';
    }
    
    setPasswordError('');
    
    // Récupérer directement les valeurs des champs avec valeurs par défaut
    const nom = e.target.nom?.value || '';
    const prenom = e.target.prenom?.value || '';
    const email = e.target.email?.value || '';
    const fonction = e.target.fonction?.value || '';
    const genre = e.target.genre?.value || '';
    const dateDeNaissance = e.target.dateDeNaissance?.value || '';
    const telephone = e.target.telephone?.value || '';
    const adresse = e.target.adresse?.value || '';
    const lieuTravail = e.target.lieuTravail?.value || '';


    // Vérifier uniquement la correspondance des mots de passe pour un nouvel utilisateur
    if (!currentUser) {
      const password = e.target.password?.value || '';
      const confirmPassword = e.target.confirmPassword?.value || '';
      
      if (password !== confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas.');
        return;
      }
    }
    
    // Vérifier la mise à jour du mot de passe pour un utilisateur existant
    let updatePassword = false;
    if (currentUser && e.target.newPassword) {
      const newPassword = e.target.newPassword.value;
      
      if (newPassword) {
        const currentPassword = e.target.currentPassword?.value || '';
        const confirmNewPassword = e.target.confirmNewPassword?.value || '';
        
        if (!currentPassword) {
          setPasswordError('Veuillez saisir votre mot de passe actuel.');
          return;
        }
        
        if (newPassword !== confirmNewPassword) {
          setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
          return;
        }
        
        updatePassword = true;
      }
    }
    
    // Créer un objet avec les données de l'utilisateur
    let userData = {};
    
    // Fonction de nettoyage sécurisée
    const safeClean = (value) => (value || '').trim();
    
    if (currentUser) {
      userData = {
        ...currentUser,
        // Garder les données existantes
        nom: safeClean(nom),
        prenom: safeClean(prenom),
        genre: safeClean(genre),
        dateDeNaissance: safeClean(dateDeNaissance),
        email: safeClean(email),
        fonction: safeClean(fonction),
        telephone: safeClean(telephone),
        adresse: safeClean(adresse),
        lieuTravail: safeClean(lieuTravail),
        dateModification: new Date().toISOString()
      };
    } else {
      userData = {
        nom: safeClean(nom),
        prenom: safeClean(prenom),
        genre: safeClean(genre),
        dateDeNaissance: safeClean(dateDeNaissance),
        email: safeClean(email),
        fonction: safeClean(fonction),
        telephone: safeClean(telephone),
        adresse: safeClean(adresse),
        lieuTravail: safeClean(lieuTravail),
        dateModification: new Date().toISOString()
      };
    }
    
    // Ajouter le mot de passe seulement pour les nouveaux utilisateurs
    if (!currentUser) {
      userData.password = e.target.password?.value || '';
      userData.dateCreation = new Date().toISOString();
    }
    
    // Ajouter les informations de mise à jour du mot de passe si nécessaire
    if (updatePassword) {
      userData.currentPassword = e.target.currentPassword?.value || '';
      userData.newPassword = e.target.newPassword?.value || '';
      userData.updatePassword = true;
    }
    
    // Ajouter l'image de profil si elle a été modifiée
    // Nous ne l'incluons pas directement dans userData pour éviter les problèmes de Firebase
    let compressedImage = null;
    if (profileImage) {
      try {
        // Compression de l'image avant envoi pour éviter les problèmes de timeout
        compressedImage = await compressImage(profileImage);
        // Ne pas utiliser hasProfileImage comme booléen, l'URL sera stockée dans photoURL
        // par la fonction handleSaveUser dans administrateur.js
      } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
        setSubmissionStatus('error');
        setSubmissionMessage('Erreur lors du traitement de l\'image. Veuillez réessayer avec une autre image.');
        
        // Réactiver le bouton de soumission
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = currentUser ? 'Mettre à jour' : 'Enregistrer';
        }
        
        return;
      }
    }
    
    // Ajouter les rôles à l'objet userData
    if (!fromProfile) {
      userData.roles = {
        enregistrer: e.target.roles_enregistrer?.checked || false,
        observer: e.target.roles_observer?.checked || false,
        analyser: e.target.roles_analyser?.checked || false,
        interpreter: e.target.roles_interpreter?.checked || false,
        creationExamen: e.target.roles_creationExamen?.checked || false,
        creationPatient: e.target.roles_creationPatient?.checked || false,
      };
    }
    
    // Ajouter le statut si disponible
    userData.statut = e.target.statut?.value || 'Actif';
    
    console.log('Données utilisateur à envoyer:', userData);
    
    // Appeler la fonction onSave avec les données utilisateur
    try {
      // Vérifier que onSave est bien une fonction
      if (typeof onSave !== 'function') {
        throw new Error('La fonction de sauvegarde n\'est pas disponible');
      }
      
      // Passer l'image compressée séparément pour éviter les problèmes de sérialisation
      await onSave(userData, compressedImage);
      setSubmissionStatus('success');
      setSubmissionMessage(currentUser ? 'Utilisateur mis à jour avec succès' : 'Nouvel utilisateur créé avec succès');
      
      // Fermer la modal après un court délai en cas de succès
      setTimeout(() => {
        onCancel(); // Fermer la modal
      }, 1500); // Attendre 1.5 secondes pour que l'utilisateur voie la notification de succès
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données:', error);
      setSubmissionStatus('error');
      setSubmissionMessage(`Erreur lors de l'enregistrement: ${error.message || 'Veuillez vérifier les données saisies'}`);
      
      // Réactiver le bouton de soumission
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = currentUser ? 'Mettre à jour' : 'Enregistrer';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Notification au-dessus de la modal */}
        {submissionStatus && (
          <div
               style={{opacity: submissionStatus ? 1 : 0}}
               className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 p-4 rounded shadow-lg transition-all duration-300 ${submissionStatus === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            <div className="flex items-center">
              {submissionStatus === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {submissionMessage}
            </div>
          </div>
        )}
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-auto sm:max-w-7xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              {currentUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h3>
            <form onSubmit={handleSubmit}>
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {passwordError}
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2 flex flex-col md:flex-row gap-6">
                  {/* Section informations personnelles */}
                  <div className="flex-1">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Informations personnelles</h4>
                    
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="prenom" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="prenom"
                          name="prenom"
                          required
                          defaultValue={currentUser?.prenom || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="nom" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          required
                          defaultValue={currentUser?.nom || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="genre" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Genre *
                        </label>
                        <select
                          id="genre"
                          name="genre"
                          required
                          defaultValue={currentUser?.genre || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner un genre</option>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="dateDeNaissance" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Date de naissance *
                        </label>
                        <input
                          type="date"
                          id="dateDeNaissance"
                          name="dateDeNaissance"
                          required
                          defaultValue={currentUser?.dateDeNaissance || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="telephone" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          id="telephone"
                          name="telephone"
                          required
                          defaultValue={currentUser?.telephone || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="adresse" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          id="adresse"
                          name="adresse"
                          required
                          defaultValue={currentUser?.adresse || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Section mot de passe pour nouvel utilisateur */}
                      {!currentUser && (
                        <div className="sm:col-span-2 mx-0 my-4 bg-claire-2 rounded rounded-md w-auto bg-opacity-30 items-center">
                          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex w-full bg-claire-2 px-5 py-4">
                            <FiLock className="mr-2" /> Définir le mot de passe
                          </label>
                          <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {passwordError && (
                              <div className="sm:col-span-2 text-red-500 text-sm mb-2">
                                {passwordError}
                              </div>
                            )}
                            <div>
                              <label htmlFor="password" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe *
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  id="password"
                                  name="password"
                                  required
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Confirmer le mot de passe *
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  required
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section mot de passe pour modification d'utilisateur existant */}
                      {currentUser && (
                        <div className="sm:col-span-2 mx-0 my-4 bg-claire-2 rounded rounded-md w-auto bg-opacity-30 items-center">
                          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex w-full bg-claire-2 px-5 py-4">
                            <FiLock className="mr-2" /> Modifier le mot de passe
                          </label>
                          <div className="p-5 grid grid-cols-1 gap-4">
                            {passwordError && (
                              <div className="sm:col-span-2 text-red-500 text-sm mb-2">
                                {passwordError}
                              </div>
                            )}
                            <div>
                              <label htmlFor="currentPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe actuel
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  id="currentPassword"
                                  name="currentPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="newPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Nouveau mot de passe
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  id="newPassword"
                                  name="newPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="confirmNewPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Confirmer le nouveau mot de passe
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmNewPassword"
                                  name="confirmNewPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentUser && (
                        <div className="sm:col-span-2 mx-0 my-4 bg-claire-2 rounded rounded-md w-auto bg-opacity-30 items-center">
                          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex w-full bg-claire-2 px-5 py-4">
                            <FiLock className="mr-2" /> Modifier le mot de passe
                          </label>
                          <div className="p-5 grid grid-cols-1 gap-4">
                            {passwordError && (
                              <div className="sm:col-span-2 text-red-500 text-sm mb-2">
                                {passwordError}
                              </div>
                            )}
                            <div>
                              <label htmlFor="currentPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe actuel
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  id="currentPassword"
                                  name="currentPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="newPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Nouveau mot de passe
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  id="newPassword"
                                  name="newPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="confirmNewPassword" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                                Confirmer le nouveau mot de passe
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmNewPassword"
                                  name="confirmNewPassword"
                                  className="block w-full pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="fonction" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Fonction *
                        </label>
                        <select
                          id="fonction"
                          name="fonction"
                          required
                          defaultValue={currentUser?.fonction || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner une fonction</option>
                          <option value="Administrateur">Administrateur</option>
                          <option value="Medecin">Médecin</option>
                          <option value="Infirmier">Infirmier</option>
                          <option value="Technicien">Technicien</option>
                          <option value="Accueil">Accueil</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="lieuTravail" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Lieu de travail *
                        </label>
                        <input
                          type="text"
                          id="lieuTravail"
                          name="lieuTravail"
                          required
                          defaultValue={currentUser?.lieuTravail || ''}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Photo de profil */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 dark:text-gray-300">
                          Photo de profil
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {previewUrl ? (
                              <img 
                                src={previewUrl} 
                                alt="Aperçu" 
                                className="h-20 w-20 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">Photo</span>
                              </div>
                            )}
                          </div>
                          <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="flex items-center">
                              <FiUpload className="mr-2" />
                              Téléverser
                            </span>
                            <input 
                              type="file" 
                              name="profileImage" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Section des rôles - masquée si appelée depuis la page de profil */}

                    {!fromProfile && (
                        <div className='sm:col-span-2 mx-0 my-4 bg-claire-2 rounded rounded-md w-auto bg-opacity-30 items-center'>
                          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex w-full bg-claire-2 px-5 py-4">Rôles *</label>
                          <div className="p-5 grid grid-cols-2 gap-2">
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_enregistrer" defaultChecked={currentUser?.roles?.enregistrer} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Enregistrer</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_observer" defaultChecked={currentUser?.roles?.observer} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Observer</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_analyser" defaultChecked={currentUser?.roles?.analyser} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Analyser</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_interpreter" defaultChecked={currentUser?.roles?.interpreter} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Interpréter</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_creationExamen" defaultChecked={currentUser?.roles?.creationExamen} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Création Examen</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" name="roles_creationPatient" defaultChecked={currentUser?.roles?.creationPatient} className="form-checkbox text-blue-600" />
                            <span className="ml-2">Création Patient</span>
                          </label>
                        </div>
                        </div>
                        )}
                  </div>
                </div>
                
                {/* Section des rôles */}
                
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 mb-0 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-md"
                >
                  {currentUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-md"
                  onClick={onCancel}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
