import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, FiUsers, FiFileText, FiActivity, 
  FiSettings, FiHelpCircle, FiLogOut,
  FiChevronRight, FiChevronDown, FiUser, 
  FiEye, FiList, FiEdit, FiMoon, FiSliders, 
  FiPackage, FiClipboard, FiTool
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
// import { useLanguage } from '@/hooks/useLanguage'; // Désactivé pour améliorer la stabilité
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

const Sidebar = ({ open }) => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { activeColors } = useTheme(); // Get activeColors from theme context
  // const { t } = useLanguage(); // Désactivé pour améliorer la stabilité
  
  // État pour gérer l'ouverture des sous-menus
  const [openSubmenus, setOpenSubmenus] = useState({
    patients: false,
    analyses: false,
    settings: false,
    prestations: false // Added new submenu key
  });

  // Fonction pour basculer l'état d'un sous-menu
  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Éléments de menu avec sous-menus
  const menuItems = [
    { 
      icon: FiHome, 
      title: 'Tableau de bord', 
      path: '/dashboard',
      hasSubmenu: false
    },
    // Patients menu - visible only for receptionniste and admin
    ...(user?.role === 'receptionniste' || user?.role === 'admin' ? [{
      icon: FiUsers,
      title: 'Patients',
      path: '/patients', // This path might need adjustment if the main /patients page is restricted
      hasSubmenu: true,
      submenuKey: 'patients',
      submenu: user?.role === 'receptionniste' ? [
        { icon: FiUser, title: 'Nouveau patient', path: '/patients/new' },
        { icon: FiList, title: 'Liste des patients', path: '/patients/list' }
      ] : [
        { icon: FiList, title: 'Liste des patients', path: '/patients/list' }
      ]
    }] : []),
    { 
      icon: FiFileText, 
      title: 'Examens', 
      path: '/examens',
      hasSubmenu: true,
      submenuKey: 'examens',
      submenu: [
        { icon: FiList, title: 'Liste des examens', path: '/examens' }
      ]
    },
    {
      icon: FiUsers,
      title: 'Utilisateurs',
      path: '/users', // This path might need adjustment
      hasSubmenu: true,
      submenuKey: 'users',
      submenu: [
        // Conditional submenus for Utilisateur
        ...(user?.role === 'admin' ? [
          { icon: FiEdit, title: 'Nouvel utilisateur', path: '/users/new' },
          { icon: FiList, title: 'Liste des utilisateurs', path: '/users' }
        ] : []),
        { icon: FiList, title: 'Profil', path: '/users/profile' } // Profil is always visible
      ].filter(Boolean) // Remove potential null/undefined entries if roles don't match
    },
    // New Prestations menu
    {
      icon: FiClipboard, // Using FiClipboard for Prestations, can be changed
      title: 'Prestations',
      path: '/prestations', // Main path for Prestations
      hasSubmenu: true,
      submenuKey: 'prestations',
      submenu: [
        { icon: FiList, title: 'Hospitalisations', path: '/prestations/hospitalisations' },
        { icon: FiList, title: 'EEG', path: '/prestations/eeg' },
        { icon: FiList, title: 'Consultations', path: '/prestations/consultations' },
        { icon: FiList, title: 'Covid', path: '/prestations/sui-covid-19' },
        { icon: FiList, title: 'Enquetes', path: '/prestations/enquetes' }
      ]
    },
    { 
      icon: FiActivity, 
      title: 'Analyses', 
      path: '/analyses',
      hasSubmenu: true,
      submenuKey: 'analyses',
      submenu: [
        { icon: FiList, title: 'Liste des analyses', path: '/analyses/list' }
      ]
    },
    { 
      icon: FiSettings, 
      title: 'Paramètres', 
      path: '/settings',
      hasSubmenu: true,
      submenuKey: 'settings',
      submenu: [
        { icon: FiMoon, title: 'Thème', path: '/settings/theme' },
        { icon: FiTool, title: 'Plateforme', path: '/settings/configuration' }
      ]
    },
    { 
      icon: FiHelpCircle, 
      title: 'Aide', 
      path: '/help',
      hasSubmenu: false
    },
  ];

  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  // Vérifier si un sous-menu doit être ouvert en fonction de la route active
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.hasSubmenu && item.submenu) {
        const shouldBeOpen = item.submenu.some(subItem => isActive(subItem.path));
        if (shouldBeOpen && !openSubmenus[item.submenuKey]) {
          setOpenSubmenus(prev => ({
            ...prev,
            [item.submenuKey]: true
          }));
        }
      }
    });
  }, [router.pathname]);

  return (
    <aside 
      className={`fixed top-0 inset-y-0 left-0 bg-[#1e284f] z-10
        ${open ? 'w-64' : 'w-20'} flex flex-col`}
     style={{ backgroundColor: activeColors.sidebar }} // Use sidebar color from theme context
    >
      <div className="flex items-center justify-center h-16 border-b border-primary-700">
        {open ? (
          <h1 className="text-xl font-bold text-white">Afweba-upgrade</h1>
        ) : (
          <h1 className="text-xl font-bold text-white">EEG</h1>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.submenuKey)}
                    className={`flex items-center justify-between w-full py-3 px-3 rounded-md
                      ${isActive(item.path) 
                        ? 'text-white' // Keep text white for active item
                        : 'text-primary-100 hover:bg-[#013354d9] hover:text-white'}`}
                    style={isActive(item.path) ? { backgroundColor:'#016177'} : {}} // Use primary color for active background
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5" />
                      {open && <span className="ml-3">{item.title}</span>}
                    </div>
                    {open && (
                      openSubmenus[item.submenuKey] 
                        ? <FiChevronDown className="h-4 w-4" /> 
                        : <FiChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {open && openSubmenus[item.submenuKey] && (
                    <ul className="mt-1 pl-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <div
                            onClick={() => router.push(subItem.path)}
                            className={`flex items-center py-2 px-3 text-sm rounded-md cursor-pointer
                              ${isActive(subItem.path) 
                                ? 'bg-[#013354d9] text-white' 
                                : 'text-primary-100 hover:bg-[#014f73] hover:text-white'}`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span className="ml-3">{subItem.title}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => {
                    // Utiliser une navigation optimisée pour le tableau de bord
                    if (item.path === '/dashboard') {
                      const userRole = user?.role || 'receptionniste';
                      router.push(`/dashboard/${userRole}`, undefined, { shallow: true });
                    } else {
                      router.push(item.path);
                    }
                  }}
                  className={`flex items-center py-3 px-3 rounded-md cursor-pointer
                    ${isActive(item.path) 
                      ? 'bg-[#01648fd7] text-white' 
                      : 'text-primary-100 hover:bg-[#013354d9] hover:text-white'}`}
                >
                  <item.icon className="h-5 w-5" />
                  {open && <span className="ml-3">{item.title}</span>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            // Demander confirmation avant de se déconnecter
            if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
              handleLogout();
            }
          }}
          className="flex items-center py-2 px-3 text-primary-100 hover:bg-primary-800 hover:text-white rounded-md w-full"
        >
          <FiLogOut className="h-5 w-5" />
          {open && <span className="ml-3">Déconnexion</span>}
        </button>
      </div>
      
    </aside>
  );
};

export default Sidebar;