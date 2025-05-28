import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import firebaseService from '@/services/firebaseService';

// Création du contexte
export const AuthContext = createContext();

// Définition des rôles disponibles
export const ROLES = {
  ADMINISTRATEUR: 'administrateur',
  MEDECIN: 'medecin',
  INFIRMIER: 'infirmier',
  TECHNICIEN: 'technicien',
  ACCUEIL: 'accueil',
};

/**
 * Fournisseur du contexte d'authentification
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    let isMounted = true;
    
    // Ne vérifier l'authentification qu'une seule fois au chargement initial
    if (!initialAuthCheckDone) {
      const checkAuth = async () => {
        try {
          // Vérifier s'il existe un token dans le localStorage (côté client uniquement)
          if (typeof window !== 'undefined') {
            // Fonction sécurisée pour accéder au localStorage
            const safeGetItem = (key) => {
              try {
                if (window.localStorage) {
                  return window.localStorage.getItem(key);
                }
                return null;
              } catch (e) {
                console.error(`Erreur lors de l'accès à localStorage pour la clé ${key}:`, e);
                return null;
              }
            };
            
            // Récupérer les informations d'authentification directement
            const token = safeGetItem('eeg_auth_token');
            const userRole = safeGetItem('eeg_user_role');
            const userEmail = safeGetItem('eeg_user_email');
            const cachedUserData = safeGetItem('eeg_user_data');
            
            if (token && userEmail) {
              const role = userRole || ROLES.RECEPTIONNISTE;
              
              try {
                // Vérifier si nous avons des données utilisateur en cache
                if (cachedUserData) {
                  const userData = JSON.parse(cachedUserData);
                  if (isMounted) {
                    setUser(userData);
                    setLoading(false);
                    setInitialAuthCheckDone(true);
                    return;
                  }
                }
                
                // Si pas de cache ou cache invalide, récupérer depuis Firebase
                const dbUser = await firebaseService.getUserByEmail(userEmail);
                if (dbUser) {
                  const userData = {
                    id: dbUser.id,
                    name: `${dbUser.nom} ${dbUser.prenom}`,
                    email: dbUser.email,
                    role: dbUser.fonction.toLowerCase(),
                    avatar: 'https://via.placeholder.com/36',
                    ...dbUser
                  };
                  
                  if (isMounted) {
                    setUser(userData);
                    
                    // Mettre en cache les données utilisateur
                    if (typeof window !== 'undefined' && window.localStorage) {
                      try {
                        window.localStorage.setItem('eeg_user_data', JSON.stringify(userData));
                      } catch (e) {
                        console.error('Erreur lors de la mise en cache des données utilisateur:', e);
                      }
                    }
                  }
                } else {
                  if (isMounted) {
                    const defaultUser = {
                      id: '123',
                      name: 'Default User',
                      email: userEmail,
                      role: role,
                      avatar: 'https://via.placeholder.com/36'
                    };
                    setUser(defaultUser);
                    
                    // Mettre en cache les données utilisateur par défaut
                    if (typeof window !== 'undefined' && window.localStorage) {
                      try {
                        window.localStorage.setItem('eeg_user_data', JSON.stringify(defaultUser));
                      } catch (e) {
                        console.error('Erreur lors de la mise en cache des données utilisateur:', e);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                // Ne pas déconnecter l'utilisateur en cas d'erreur de récupération
                if (isMounted) {
                  const defaultUser = {
                    id: '123',
                    name: 'Default User',
                    email: userEmail,
                    role: role,
                    avatar: 'https://via.placeholder.com/36'
                  };
                  setUser(defaultUser);
                  
                  // Mettre en cache les données utilisateur par défaut
                  if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                      window.localStorage.setItem('eeg_user_data', JSON.stringify(defaultUser));
                    } catch (e) {
                      console.error('Erreur lors de la mise en cache des données utilisateur:', e);
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          // Ne pas déconnecter automatiquement en cas d'erreur
        } finally {
          if (isMounted) {
            setLoading(false);
            setInitialAuthCheckDone(true);
          }
        }
      };
      
      checkAuth();
    }
    
    return () => { isMounted = false; };
  }, [initialAuthCheckDone]);

  /**
   * Connecter un utilisateur et récupérer son rôle depuis Firebase
   */
  const login = async (email, password) => {
    setLoading(true);
    let isMounted = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let userData = null;
      try {
        userData = await firebaseService.getUserByEmail(email);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
      }
      
      // Si l'utilisateur n'existe pas dans la base de données
      if (!userData) {
        // Vérifier les identifiants de démo
        if (email === 'admin@eeg.com' && password === 'admin123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Administrateur',
            prenom: 'Demo',
            email: email,
            fonction: 'Administrateur'
          };
        } else if (email === 'technicien@eeg.com' && password === 'tech123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Technicien',
            prenom: 'Demo',
            email: email,
            fonction: 'Technicien'
          };
        } else if (email === 'medecin@eeg.com' && password === 'med123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Medecin',
            prenom: 'Demo',
            email: email,
            fonction: 'Medecin'
          };
        } else if (email === 'infirmier@eeg.com' && password === 'inf123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Infirmier',
            prenom: 'Demo',
            email: email,
            fonction: 'Infirmier'
          };
        } else if (email === 'professeur@eeg.com' && password === 'prof123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Professeur',
            prenom: 'Demo',
            email: email,
            fonction: 'Professeur'
          };
        } else if (email === 'receptionniste@eeg.com' && password === 'rec123') {
          userData = {
            id: Date.now().toString(),
            nom: 'Receptionniste',
            prenom: 'Demo',
            email: email,
            fonction: 'Receptionniste'
          };
        } else {
          throw new Error('Identifiants invalides');
        }
      }
      
      // Récupérer le rôle de l'utilisateur depuis la fonction stockée dans Firebase
      const userRole = userData.fonction ? userData.fonction.toLowerCase() : ROLES.RECEPTIONNISTE;
      
      // Créer l'objet utilisateur
      const user = {
        id: userData.id,
        name: `${userData.prenom} ${userData.nom}`,
        email: userData.email,
        role: userRole,
        avatar: 'https://via.placeholder.com/36',
        ...userData
      };
      
      // Rediriger l'utilisateur en fonction de son rôle
      try {
        switch (userRole) {
          case ROLES.ADMINISTRATEUR:
            router.push('/dashboard/administrateur');
            break;
          case ROLES.TECHNICIEN:
            router.push('/dashboard/technicien');
            break;
          case ROLES.INFIRMIER:
            router.push('/dashboard/infirmier');
            break;
          case ROLES.MEDECIN:
            router.push('/dashboard/medecin');
            break;
          case ROLES.PROFESSEUR:
            router.push('/dashboard/professeur');
            break;
          case ROLES.RECEPTIONNISTE:
          default:
            router.push('/dashboard/receptionniste');
            break;
        }
      } catch (error) {
        console.error("Erreur lors de la redirection:", error);
        router.push('/dashboard'); // Fallback au cas où une erreur se produit
      }

      const token = 'fake_jwt_token_' + Date.now();

      if (typeof window !== 'undefined') {
        try {
          // Utiliser une fonction sécurisée pour écrire dans le localStorage
            const safeSetItem = (key, value) => {
              try {
                // Vérifier si localStorage est accessible
                if (window.localStorage) {
                  window.localStorage.setItem(key, value);
                }
              } catch (e) {
                console.error(`Erreur lors de l'écriture dans localStorage pour la clé ${key}:`, e);
              }
            };
          
          // Utiliser setTimeout pour éviter les problèmes de sécurité liés aux iframes
          setTimeout(() => {
            try {
              safeSetItem('eeg_auth_token', token);
              safeSetItem('eeg_user_role', userRole); // Utiliser le rôle récupéré depuis Firebase
              safeSetItem('eeg_user_email', email);
              safeSetItem('eeg_user_data', JSON.stringify(user)); // Mettre en cache les données utilisateur
            } catch (error) {
              console.error('Erreur d\'écriture dans le localStorage:', error);
            }
          }, 0);
        } catch (error) {
          console.error('Erreur d\'écriture dans le localStorage:', error);
        }
      }

      if (isMounted) {
        setUser(user);
        // La redirection est déjà gérée plus haut dans le code
      }

      return user;

    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      if (isMounted) setLoading(false);
    }
  };
  
  /**
   * Déconnecter l'utilisateur
   */
  const logout = () => {
    // Supprimer les informations d'authentification (côté client uniquement)
    if (typeof window !== 'undefined') {
      try {
        // Utiliser une fonction sécurisée pour supprimer du localStorage
        const safeRemoveItem = (key) => {
          try {
            // Vérifier si localStorage est accessible
            if (window.localStorage) {
              window.localStorage.removeItem(key);
            }
          } catch (e) {
            console.error(`Erreur lors de la suppression dans localStorage pour la clé ${key}:`, e);
          }
        };
        
        // Utiliser setTimeout pour éviter les problèmes de sécurité liés aux iframes
        setTimeout(() => {
          try {
            safeRemoveItem('eeg_auth_token');
            safeRemoveItem('eeg_user_role');
            safeRemoveItem('eeg_user_email');
            safeRemoveItem('eeg_user_data'); // Supprimer également les données utilisateur en cache
          } catch (error) {
            console.error('Erreur de suppression du localStorage:', error);
          }
        }, 0);
      } catch (error) {
        console.error('Erreur de suppression du localStorage:', error);
      }
    }
    
    setUser(null);
    
    // Rediriger vers la page de connexion
    router.push('/login');
  };
  
  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (roles) => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   * @param {string} permission - La permission à vérifier
   * @returns {boolean} - True si l'utilisateur a la permission, false sinon
   */
  const checkUserPermission = (permission) => {
    if (!user) return false;
    
    // Si l'utilisateur est administrateur, il a toutes les permissions
    if (user.role === ROLES.ADMINISTRATEUR) return true;
    
    // Vérifier si l'utilisateur a des rôles définis
    if (!user.roles) return false;
    
    // Vérifier si l'utilisateur a la permission spécifique
    return user.roles[permission] === true;
  };
  
  // Fonction pour mettre à jour les données utilisateur en temps réel
  const updateUserData = async (userEmail) => {
    try {
      if (!userEmail) return;
      
      const dbUser = await firebaseService.getUserByEmail(userEmail);
      if (dbUser) {
        const userData = {
          id: dbUser.id,
          name: `${dbUser.nom} ${dbUser.prenom}`,
          email: dbUser.email,
          role: dbUser.fonction.toLowerCase(),
          avatar: 'https://via.placeholder.com/36',
          ...dbUser
        };
        
        setUser(userData);
        
        // Mettre en cache les données utilisateur
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('eeg_user_data', JSON.stringify(userData));
          } catch (e) {
            console.error('Erreur lors de la mise en cache des données utilisateur:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
    }
  };
  
  // Écouter les changements dans la base de données pour l'utilisateur connecté
  useEffect(() => {
    if (user && user.email) {
      // Configurer un écouteur pour les mises à jour de l'utilisateur
      const unsubscribe = firebaseService.listenToUserChanges(user.email, () => {
        // Mettre à jour les données utilisateur lorsqu'un changement est détecté
        updateUserData(user.email);
      });
      
      // Nettoyer l'écouteur lors du démontage du composant
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [user?.email]);
  
  // Valeur du contexte
  const contextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    hasRole,
    checkUserPermission,
    updateUserData,
    ROLES
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}