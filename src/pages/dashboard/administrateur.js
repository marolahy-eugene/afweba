import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiUserCheck, FiLayers, FiShield, FiEye, FiEyeOff, FiUser, FiSave, FiX } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import firebaseService from '@/services/firebaseService';
import UserFormModal from '@/components/users/UserFormModal';

/**
 * Tableau de bord Administrateur avec gestion des utilisateurs
 */
const AdministrateurPanel = () => {
  const router = useRouter();
  const { ROLES, user } = useAuth();
  
  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // État pour le modal d'ajout/édition d'utilisateur
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // État pour le modal de profil utilisateur
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  
  // État pour le modal de gestion des rôles
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedRoles, setEditedRoles] = useState({});
  
  // État pour les utilisateurs
  const [users, setUsers] = useState([]);
  
  // Statistiques du système
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    rolesDistribution: {}
  });
  
  // Charger les utilisateurs depuis Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await firebaseService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    loadUsers();
  }, []);
  
  // Fonction utilitaire pour formater une date Firebase ou JavaScript
  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    // Si c'est un objet Timestamp de Firebase (avec seconds et nanoseconds)
    if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne ISO ou un timestamp
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    }
    
    // Si c'est déjà une date formatée
    return dateValue;
  };
  
  // Mise à jour des statistiques quand les utilisateurs changent
  useEffect(() => {
    const activeCount = users.filter(user => user.statut === 'Actif').length;
    const inactiveCount = users.filter(user => user.statut === 'Inactif').length;
    
    // Calculer la distribution des rôles
    const roleDistribution = users.reduce((acc, user) => {
      const role = user.fonction || 'Non défini';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    setStats({
      totalUsers: users.length,
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
      rolesDistribution: roleDistribution
    });
  }, [users]);
  
  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.nom || '').toLowerCase().includes(searchLower) ||
      (user.prenom || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.fonction || '').toLowerCase().includes(searchLower)
    );
  });
  
  // Ouvrir le modal pour ajouter un nouvel utilisateur
  const handleAddUser = () => {
    setCurrentUser(null);
    setShowModal(true);
  };
  
  // Ouvrir le modal pour éditer un utilisateur existant
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowModal(true);
  };
  
  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await firebaseService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        alert('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        alert('Une erreur est survenue lors de la suppression de l\'utilisateur.');
      }
    }
  };
  
  // Afficher le profil d'un utilisateur
  const handleShowUserProfile = (userId) => {
    const userToShow = users.find(user => user.id === userId);
    setProfileUser(userToShow);
    setShowProfileModal(true);
  };
  
  // Afficher la modal de gestion des rôles
  const handleShowRolesModal = (userId) => {
    const userToEdit = users.find(user => user.id === userId);
    setSelectedUser(userToEdit);
    setEditedRoles(userToEdit.roles || {
      creationPatient: false,
      creationExamen: false,
      observer: false,
      enregistrer: false,
      analyser: false,
      interpreter: false,
      admin: false
    });
    setShowRolesModal(true);
  };
  
  // Mettre à jour un rôle spécifique
  const handleRoleChange = (role, value) => {
    setEditedRoles(prev => ({
      ...prev,
      [role]: value
    }));
  };
  
  // Sauvegarder les rôles modifiés
  const handleSaveRoles = async () => {
    try {
      if (!selectedUser) return;
      
      await firebaseService.updateUserRoles(selectedUser.id, editedRoles);
      
      // Mettre à jour l'état local
      setUsers(users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, roles: editedRoles };
        }
        return user;
      }));
      
      // Fermer la modal
      setShowRolesModal(false);
      setSelectedUser(null);
      setEditedRoles({});
      alert('Rôles mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des rôles:', error);
      alert('Erreur lors de la mise à jour des rôles. Veuillez réessayer.');
    }
  };
  
  // Fonction pour sauvegarder ou mettre à jour un utilisateur dans Firebase
  const handleSaveUser = async (userData) => {
    try {
      console.log('Sauvegarde des données utilisateur:', userData);
      
      // Préparer les données à sauvegarder
      const dataToSave = { ...userData };
      
      // Gérer l'upload de l'image de profil si présente
      if (userData.profileImage) {
        try {
          console.log('Téléversement de l\'image de profil...');
          const photoURL = await firebaseService.uploadUserProfileImage(
            userData.profileImage, 
            currentUser?.id || `new_user_${Date.now()}`
          );
          dataToSave.photoURL = photoURL;
          console.log('Image téléversée avec succès:', photoURL);
        } catch (uploadError) {
          console.error('Erreur lors du téléversement de l\'image de profil:', uploadError);
          console.warn('Erreur lors du téléversement de l\'image de profil');
        }
        // Supprimer l'objet File du dataToSave pour éviter des problèmes avec Firestore
        delete dataToSave.profileImage;
      }
      
      // Mise à jour du mot de passe si nécessaire
      if (userData.updatePassword) {
        console.log('Mise à jour du mot de passe demandée');
        // Cette logique devrait être gérée par le service Firebase
      }
      
      if (currentUser) {
        // Éditer un utilisateur existant
        console.log(`Mise à jour de l'utilisateur avec l'ID: ${currentUser.id}`);
        const updatedUser = await firebaseService.updateUser(currentUser.id, dataToSave);
        console.log('Utilisateur mis à jour avec succès:', updatedUser);
        
        // Mettre à jour l'état local
        setUsers(users.map(user => {
          if (user.id === currentUser.id) {
            return {
              ...user,
              ...dataToSave,
              updatedAt: new Date().toISOString()
            };
          }
          return user;
        }));
      } else {
        // Ajouter un nouvel utilisateur
        console.log('Ajout d\'un nouvel utilisateur');
        const newUser = await firebaseService.addUser(dataToSave);
        console.log('Nouvel utilisateur ajouté avec succès:', newUser);
        
        // Mettre à jour l'état local
        setUsers([...users, {
          ...newUser,
          id: newUser.id,
          dateCreation: new Date().toLocaleDateString('fr-FR'),
          statut: 'Actif'
        }]);
      }
      
      // Fermer le modal après la sauvegarde réussie
      setShowModal(false);
      setCurrentUser(null);
      
      // Afficher un message de succès
      alert(currentUser ? 'Utilisateur mis à jour avec succès!' : 'Nouvel utilisateur ajouté avec succès!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      alert(`Une erreur est survenue: ${error.message}`);
    }
  };
  
  // Obtenir la couleur pour le statut
  const getStatusColor = (statut) => {
    return statut === 'Actif' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };
  
  // Obtenir la couleur pour le rôle
  const getRoleColor = (fonction) => {
    switch (fonction) {
      case 'Médecin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Infirmier':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Technicien':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Professeur':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Réceptionniste':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Administrateur':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <RoleBasedRoute roles={ROLES.ADMINISTRATEUR}>
      <Layout>
        <div className="p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-300 dark:text-white flex items-center">
              <FiShield className="mr-2 " /> 
              Administration
            </h1>
            <p className="mt-2 text-md text-gray-400 dark:text-gray-400">
              Gestion des utilisateurs et du système
            </p>
          </div>
          
          {/* Statistiques des utilisateurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-custom">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#283f62bc] dark:bg-blue-900 text-blue-500 dark:text-blue-300 mr-4">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-300 dark:text-gray-400">Total utilisateurs</p>
                  <p className="text-lg font-semibold text-cyan-500 dark:text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-custom">
              <div className="flex items-center">
                <div className="bg-[#2f485ff5] p-3 rounded-full dark:bg-green-900 text-green-500 dark:text-green-300 mr-4">
                  <FiUserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-300 dark:text-gray-400">Utilisateurs actifs</p>
                  <p className="text-lg font-semibold text-green-500 dark:text-white">{stats.activeUsers}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-custom">
              <div className="flex items-center">
                <div className="bg-[#2f485ff5] p-3 rounded-full text-[#ffa571f5] dark:bg-red-900 dark:text-red-300 mr-4">
                  <FiUserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-300 dark:text-gray-400">Utilisateurs inactifs</p>
                  <p className="text-lg font-semibold text-[#ffa571f5] dark:text-white">{stats.inactiveUsers}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-custom">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#2f485ff5] dark:bg-purple-900 text-pink-300 dark:text-purple-300 mr-4">
                  <FiLayers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-200 dark:text-gray-400">Rôles différents</p>
                  <p className="text-lg font-semibold text-purple-300 dark:text-white">{Object.keys(stats.rolesDistribution).length}</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Tableau de gestion des utilisateurs */}

          <div className="bg-custom dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-200 dark:text-white flex items-center">
                <FiUsers className="mr-2" /> Liste des utilisateurs
              </h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-90 pr-8 pl-10 py-2 border border-gray-400 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-gray-700 dark:bg-gray-500 text-gray-300 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-xl text-md font-medium text-white btn-bleu hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiUserPlus className="mr-2" /> Ajouter un utilisateur
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="text-gray-200 bg-custom-2 dark:tbl-custom">
                    <tr className="text-gray-200 font-medium text-sm">
                      <th scope="col" className="px-3 py-4 text-left  font-medium dark:text-gray-300 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th scope="col" className="px-6 py-4 text-left font-medium dark:text-gray-300 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th scope="col" className="px-3 py-4 text-left font-medium dark:text-gray-300 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-3 py-4 text-left font-medium dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-4 text-left font-medium dark:text-gray-300 uppercase tracking-wider">
                        Fonction
                      </th>                      
                      <th scope="col" className="px-3 py-4 text-right font-medium dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="light:bg-secondary  dark:bg-secondary divide-y divide-gray-600 dark:divide-gray-700">
                    
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-600 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-md text-gray-200 dark:text-gray-400">
                              {formatDate(user.dateCreation) || formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-md font-medium text-gray-200 dark:text-white">
                                {user.nom} {user.prenom}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-md text-gray-200 dark:text-white">{user.telephone}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-md text-gray-200 dark:text-white">{user.email}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-md leading-0 rounded-full ${getRoleColor(user.fonction)}`}>
                              {user.fonction}
                            </span>
                          </td>                          
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">

                              {/* Ajouter un rôle Button */}

                              <button 
                                onClick={() => handleShowUserProfile(user.id)}
                                className="inline-flex items-center p-2 m-1 border border-blue-400 rounded-md shadow-md text-md font-medium text-blue-300 hover:text-blue-200 dark:text-blue-400 dark:hover:text-blue-200 bg-blue-500 bg-opacity-20"
                                title="Voir le profil"
                              >
                                <FiEye className="mr-1" />Afficher
                              </button>
                              
                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditUser(user)}
                                className="inline-flex items-center p-2 m-1 border border-orange-400 rounded-md shadow-md text-md font-medium text-orange-400 hover:text-orange-200 dark:text-blue-400 dark:hover:text-blue-200 bg-orange-500 bg-opacity-30"
                                title="Modifier"
                              >
                                <FiEdit2 className="mr-1"/> Modifier
                              </button>                              
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="inline-flex items-center p-2 m-1 border border-red-400 rounded-md shadow-md text-md font-medium  text-red-100 hover:text-red-200 dark:text-red-400 dark:hover:text-red-200 bg-red-500 bg-opacity-80"
                                title="Supprimer"
                              >
                                <FiTrash2 className="mr-1" />Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery 
                            ? "Aucun utilisateur ne correspond à votre recherche" 
                            : "Aucun utilisateur trouvé dans le système"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
          
          {/* Distribution des rôles */}

          <div className="bg-custom dark:bg-gray-800 shadow-md rounded-lg p-6 my-4">
            <h2 className="text-lg font-medium text-gray-200 dark:text-white mb-4">
              Distribution des rôles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats.rolesDistribution).map(([role, count]) => (
                <div key={role} className={`p-4 rounded-md ${getRoleColor(role)}`}>
                  <h3 className="font-medium">{role}</h3>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm">{Math.round((count / stats.totalUsers) * 100)}% des utilisateurs</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Modal de profil utilisateur */}

        {showProfileModal && profileUser && (
          <div className="fixed inset-0 z-50  overflow-y-auto ">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-55 dark:bg-gray-900 dark:opacity-90"></div>
              </div>
              
              <span className="bg-gray-700 bg-opacity-90 rounded rounded-full hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block w-auto align-bottom dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle">
                <div className="bg-claire bg-opacity-60 dark:bg-gray-800 px-4 items-center justify-start pt-5 pb-4 sm:p-6 sm:pb-4">
                   <div className="flex justify-between items-center mb-5">
                     <h2 className="text-l : g leading-8 font-medium font-semibold dark:text-white">
                      Profil de l'utilisateur
                    </h2>
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 shadow shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-2xl font-bold">
                        {profileUser.prenom?.[0]}{profileUser.nom?.[0]}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{profileUser.nom} {profileUser.prenom}</h4>
                        <div className="flex items-center mt-1">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(profileUser.fonction)}`}>
                            {profileUser.fonction}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    {/* Informations personnelles */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Informations personnelles</h4>
                      
                      <div className=" bg-gray-100 bg-opacity-85 dark:bg-gray-700 p-4 rounded-lg w-auto">
                        <div className="grid grid-cols-1 gap-4">
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Nom complet </p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.nom} {profileUser.prenom}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Genre</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.genre || '-'}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Date de naissance</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.dateDeNaissance || '-'}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Téléphone</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.telephone || '-'}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Adresse</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.adresse || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations professionnelles */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Informations professionnelles</h4>
                      
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="grid grid-cols-1 gap-4">

                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Email</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.email}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Fonction</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.fonction}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Département</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{profileUser.departement || '-'}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-medium text-gray-500 dark:text-gray-400">Date de création</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{formatDate(profileUser.dateCreation) || formatDate(profileUser.createdAt) || '-'}</p>
                          </div>
                          
                          <div className='flex bg-gray-200 bg-opacity-60 rounded rounded-md p-3 items-center justify-start'>
                            <p className="mr-3 text-md font-mediumml-3  text-gray-500 dark:text-gray-400">Accèes au plateforme</p> : 
                            <p className="ml-3 text-md text-gray-900 dark:text-white">{users.role || 'Accèes non chargée'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false);
                      handleEditUser(profileUser);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal pour ajouter/éditer un utilisateur */}
        
        {showModal && (
          <UserFormModal 
            currentUser={currentUser} 
            onSave={handleSaveUser} 
            onCancel={() => setShowModal(false)} 
          />
        )}
      </Layout>
    </RoleBasedRoute>
  );
};

// Implémentation de getInitialProps pour résoudre l'erreur
AdministrateurPanel.getInitialProps = async () => {
  return {
    props: {}
  };
};

export default AdministrateurPanel;