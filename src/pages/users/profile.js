import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import firebaseService from '@/services/firebaseService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiImage, FiEdit, FiSave, FiXCircle, FiArrowLeft, FiLock } from 'react-icons/fi';
import UserFormModal from '@/components/users/UserFormModal';

const UserProfile = () => {
  const router = useRouter();
  const { user, ROLES, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          console.log('Récupération des données utilisateur avec ID:', user.id);
          const data = await firebaseService.getUserById(user.id);
          console.log('Données utilisateur récupérées:', data);
          setUserData(data);
          setFormData(data);
          setLoading(false);
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
          setMessage({ text: 'Erreur lors du chargement du profil.', type: 'error' });
          setLoading(false);
        }
      } else {
        console.log('Aucun ID utilisateur disponible:', user);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      router.replace('/login');
      return;
    }

    if (userData) {
      const allowedRoles = [ROLES.ADMINISTRATEUR, ROLES.MEDECIN, ROLES.INFIRMIER, ROLES.RECEPTIONNISTE];
      const authorized = allowedRoles.includes(user.role);
      setIsAuthorized(authorized);
      setIsCheckingAuth(false);

      if (!authorized) {
        router.replace('/dashboard');
      }
    }
  }, [user, userData, authLoading, router, ROLES]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImageFile: file }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      let imageUrl = formData.profileImageUrl;
      if (formData.profileImageFile) {
        imageUrl = await firebaseService.uploadProfileImage(user.id, formData.profileImageFile);
      }
  
      const dataToUpdate = {
        ...formData,
        profileImageUrl: imageUrl,
        profileImageFile: firebaseService.deleteField(),
        role: userData.role // Assurez-vous que le rôle reste inchangé
      };
  
      await firebaseService.updateUser(user.id, dataToUpdate);
      
      // Recharger les données utilisateur après la mise à jour
      const updatedUser = await firebaseService.getUserById(user.id);
      setUserData(updatedUser);
      setFormData(updatedUser);
      
      setIsEditing(false);
      setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setMessage({ text: `Erreur lors de la mise à jour du profil: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sauvegarde depuis le modal
  const handleModalSave = async (userData) => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      // Si une mise à jour de mot de passe est demandée
      if (userData.updatePassword) {
        // Ici, vous devriez implémenter la logique pour vérifier l'ancien mot de passe
        // et mettre à jour avec le nouveau mot de passe
        // Cette logique dépendra de votre système d'authentification
        console.log('Mise à jour du mot de passe demandée');
        // Exemple: await authService.updatePassword(userData.currentPassword, userData.newPassword);
      }
      
      // Préparer les données à mettre à jour (sans les champs de mot de passe)
      const { currentPassword, newPassword, updatePassword, ...dataToUpdate } = userData;
      
      // Télécharger l'image de profil si elle a été modifiée
      if (userData.profileImage) {
        dataToUpdate.profileImageUrl = await firebaseService.uploadProfileImage(user.id, userData.profileImage);
      }
      
      // Mettre à jour les données utilisateur
      await firebaseService.updateUser(user.id, dataToUpdate);
      
      // Recharger les données utilisateur après la mise à jour
      const updatedUser = await firebaseService.getUserById(user.id);
      setUserData(updatedUser);
      setFormData(updatedUser);
      
      setShowModal(false);
      setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setMessage({ text: `Erreur lors de la mise à jour du profil: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  // Fermer le modal
  const handleModalCancel = () => {
    setShowModal(false);
    setMessage({ text: '', type: '' });
  };

  const handleBack = () => {
    router.back();
  };

  if (!userData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return null; // Or a message/redirecting indicator
  }

  if (authLoading || isCheckingAuth || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Mon Profil</h1>
            <p className="mt-1 text-sm text-secondary">
              Consultez et modifiez vos informations personnelles.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FiArrowLeft className="mr-2" />
              Retour
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FiEdit className="mr-2" />
              Mettre à jour
            </button>
          </div>
        </div>
        
        {message.text && (
          <div className={`mb-6 p-3 ${message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'} rounded`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
            <div className="bg-primary/10 p-2 rounded-md">
              <FiUser className="h-6 w-6 text-primary" />
            </div>
            <h2 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Informations personnelles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                {formData.profileImageUrl ? (
                  <img 
                    src={formData.profileImageUrl} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600"
                  >
                    <FiUser className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{userData.nom} {userData.prenom}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userData.fonction}</p>
                {userData.role && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                    {userData.role}
                  </span>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <p className="text-gray-900 dark:text-white">{userData.nom || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <p className="text-gray-900 dark:text-white">{userData.prenom || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiMail className="inline mr-1" /> Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{userData.email || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiPhone className="inline mr-1" /> Téléphone
                  </label>
                  <p className="text-gray-900 dark:text-white">{userData.telephone || 'Non spécifié'}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiMapPin className="inline mr-1" /> Adresse
                  </label>
                  <p className="text-gray-900 dark:text-white">{userData.adresse || 'Non spécifiée'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de modification du profil */}
      {showModal && (
        <UserFormModal
          currentUser={userData}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          fromProfile={true}
        />
      )}
    </Layout>
  );
};

export default UserProfile;