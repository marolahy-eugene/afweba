import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiImage, FiEdit, FiXCircle } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import firebaseService from '@/services/firebaseService';
import ExamensEnAttente from '@/components/dashboard/ExamensEnAttente';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, ROLES } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    fonction: '',
    specialite: '',
    profileImageUrl: '',
    photoURL: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [examens, setExamens] = useState([]);
  const [loadingExamens, setLoadingExamens] = useState(true);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Charger les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const userData = await firebaseService.getUserById(user.id);
          setFormData({
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            email: userData.email || '',
            telephone: userData.telephone || '',
            adresse: userData.adresse || '',
            fonction: userData.fonction || '',
            specialite: userData.specialite || '',
            profileImageUrl: userData.profileImageUrl || userData.photoURL || '',
            photoURL: userData.photoURL || userData.profileImageUrl || ''
          });
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
          setMessage({ text: 'Erreur lors du chargement du profil.', type: 'error' });
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Charger les examens en attente
  useEffect(() => {
    const fetchExamens = async () => {
      if (user?.id) {
        try {
          setLoadingExamens(true);
          // Récupérer les examens en fonction du rôle de l'utilisateur
          const examensData = await firebaseService.getAllExamens();
          setExamens(examensData);
        } catch (error) {
          console.error('Erreur lors du chargement des examens:', error);
        } finally {
          setLoadingExamens(false);
        }
      }
    };

    fetchExamens();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImageFile: file }));
    }
  };

  const validateForm = () => {
    // Réinitialiser les messages
    setMessage({ text: '', type: '' });

    // Vérifier les champs obligatoires
    const requiredFields = ['nom', 'prenom', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setMessage({ text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
      return false;
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: 'Veuillez entrer une adresse email valide.', type: 'error' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Gérer l'upload de l'image de profil si présente
      let imageUrl = formData.profileImageUrl;
      if (formData.profileImageFile) {
        imageUrl = await firebaseService.uploadProfileImage(user.id, formData.profileImageFile);
      }

      // Préparer les données à mettre à jour
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone || '',
        adresse: formData.adresse || '',
        fonction: formData.fonction || user.fonction, // Conserver la fonction actuelle
        specialite: formData.specialite || '',
        photoURL: imageUrl || '', // Utiliser photoURL au lieu de profileImageUrl pour la cohérence
        profileImageUrl: imageUrl || '' // Garder profileImageUrl pour la compatibilité avec le code existant
      };
      
      // Mettre à jour les informations utilisateur
      await firebaseService.updateUser(user.id, userData);
      
      setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setMessage({ text: `Une erreur est survenue: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Recharger les données utilisateur pour annuler les modifications
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        fonction: user.fonction || '',
        specialite: user.specialite || '',
        profileImageUrl: user.profileImageUrl || user.photoURL || '',
        photoURL: user.photoURL || user.profileImageUrl || ''
      });
    }
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profil">
      <div className="container mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Section photo de profil */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {(formData.photoURL || formData.profileImageUrl) ? (
                    <img
                      src={formData.photoURL || formData.profileImageUrl}
                      alt="Photo de profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser className="h-full w-full text-gray-300" />
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4">
                  </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Photo de profil */}
            <div className="md:w-1/4 mb-6 md:mb-0 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                {(formData.photoURL || formData.profileImageUrl) ? (
                  <img src={formData.photoURL || formData.profileImageUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-20 h-20 text-gray-400" />
                )}
              </div>
              
              {isEditing && (
                <div className="mt-2 text-center">
                  <label htmlFor="profileImage" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <FiImage className="mr-2" /> Changer la photo
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {/* Formulaire */}
            <div className="md:w-3/4 md:pl-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Informations personnelles
                  </h2>
                  
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiEdit className="mr-2" /> Modifier
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <FiXCircle className="mr-2" /> Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <FiSave className="mr-2" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="prenom" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nom" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="telephone" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="adresse" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresse
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="adresse"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <FiLock className="mr-2" /> Informations d'accès
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fonction
                      </label>
                      <input
                        type="text"
                        value={formData.fonction}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Seul un administrateur peut modifier votre fonction.
                      </p>
                    </div>
                    
                    {formData.specialite && (
                      <div>
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Spécialité
                        </label>
                        <input
                          type="text"
                          value={formData.specialite}
                          disabled={true}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Tableau des examens à traiter */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Examens à traiter</h2>
          <ExamensEnAttente examens={examens} loading={loadingExamens} />
        </div>
      </div>
    </Layout>
  );
}