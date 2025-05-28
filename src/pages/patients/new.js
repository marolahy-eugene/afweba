import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FiSave, FiUser, FiCalendar, FiHome, FiBriefcase } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';

export default function NewPatientPage() {
  const router = useRouter();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    genre: '',
    profession: '',
    domicile: ''
  });
  
  // État des erreurs de validation
  const [errors, setErrors] = useState({});
  
  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    
    // Supprimer l'erreur lorsque l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs obligatoires
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.dateDeNaissance) newErrors.dateDeNaissance = 'La date de naissance est requise';
    if (!formData.genre) newErrors.genre = 'Le genre est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        // Enregistrer le patient dans Firebase
        await firebaseService.addPatient(formData);
        
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        // Rediriger vers la liste des patients après 2 secondes
        setTimeout(() => {
          router.push('/patients/list');
        }, 2000);
      } catch (error) {
        console.error('Erreur lors de la création du patient:', error);
        setIsSubmitting(false);
        setSubmitError('Erreur lors de la création du patient. Veuillez réessayer.');
      }
    } else {
      // Faire défiler jusqu'à la première erreur
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Nouveau patient</h1>
              <p className="mt-1 text-sm text-secondary">
                Ajoutez un nouveau patient à la base de données.
              </p>
            </div>
          </div>
          
          {/* Notification de succès */}
          {submitSuccess && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Patient créé avec succès ! Redirection en cours...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Notification d'erreur */}
          {submitError && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    {submitError}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mt-8 bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
              <div className="bg-primary/10 p-2 rounded-md">
                <FiUser className="h-6 w-6 text-primary" />
              </div>
              <h2 className="ml-3 text-lg font-medium text-gray-900">Informations du patient</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Prénom */}
                <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 required">
                    Prénom
                  </label>
                  <input
                    type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                    onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.prenom ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                  )}
                </div>
                
                {/* Nom */}
                <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 required">
                    Nom
                  </label>
                  <input
                    type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                    onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.nom ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                  )}
                </div>
                
                {/* Date de naissance */}
                <div>
                <label htmlFor="dateDeNaissance" className="block text-sm font-medium text-gray-700 required">
                    Date de naissance
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                    id="dateDeNaissance"
                    name="dateDeNaissance"
                    value={formData.dateDeNaissance}
                      onChange={handleChange}
                    className={`pl-10 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                      errors.dateDeNaissance ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                {errors.dateDeNaissance && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateDeNaissance}</p>
                  )}
                </div>
                
                {/* Genre */}
                <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 required">
                    Genre
                  </label>
                  <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                    onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.genre ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                  </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
                  )}
                </div>
                
              {/* Profession */}
                <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                  Profession
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Domicile */}
                <div>
                <label htmlFor="domicile" className="block text-sm font-medium text-gray-700">
                  Domicile
                  </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHome className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    type="text"
                    id="domicile"
                    name="domicile"
                    value={formData.domicile}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              </div>
              
            <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/patients/list')}
                className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 