import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';

export default function Admission() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    typeAdmission: 'EEG',
    nomCentreMedical: '',
    adresseCentreMedical: '',
    dateAdmission: new Date().toISOString().split('T')[0],
    motifAdmission: '',
    medecinPrescripteur: '',
    medecinReference: '',
    montantTotal: '',
    modePayement: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [medecins, setMedecins] = useState([]);
  
  // Charger les données du patient et la liste des médecins
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          // Charger les données du patient
          const patientData = await firebaseService.getPatientById(id);
          setPatient(patientData);
          
          // Charger la liste des médecins
          const medecinsList = await firebaseService.getAllMedecins();
          setMedecins(medecinsList);
        } catch (err) {
          console.error('Erreur lors du chargement des données:', err);
          setError('Impossible de charger les données nécessaires');
        }
      }
    };
    
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      typeAdmission: type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Validation des champs obligatoires
      const requiredFields = ['nomCentreMedical', 'adresseCentreMedical', 'dateAdmission', 'motifAdmission', 'medecinPrescripteur', 'medecinReference', 'montantTotal', 'modePayement'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      // Créer l'objet d'admission
      const admissionData = {
        idPatient: patient.id,
        nomPatient: `${patient.nom} ${patient.prenom}`,
        ...formData,
        etat: 'Observation',
        dateCreation: serverTimestamp()
      };

      // Enregistrer dans Firebase
      const docRef = await addDoc(collection(db, 'admissions'), admissionData);
      console.log('Admission enregistrée avec succès, ID:', docRef.id);
      
      // Afficher le message de succès
      setSuccess(true);
      
      // Rediriger après un délai
      setTimeout(() => {
        router.push('/patients/list');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'admission:', err);
      setError('Une erreur est survenue lors de l\'enregistrement');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!patient && id) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mt-7 mb-10">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {patient ? `Admission de ${patient.prenom} ${patient.nom}` : 'Admission'}
          </h1>
        </div>

        <div className="w-[85%] mx-auto bg-gray-400 dark:bg-gray-800 rounded-lg shadow-md p-8 min-h-[70vh]">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500/50 text-red-700 dark:text-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-md bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-500/50 text-green-700 dark:text-green-200">
              Admission enregistrée avec succès !
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xl bg-custom-3">
            <div className="mb-6">
              <label className="block text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 required">
                Type de traitement
              </label>
              <div className="flex flex-wrap gap-6 py-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="typeAdmission"
                    className="form-radio h-5 w-5 text-blue-600 "
                    checked={formData.typeAdmission === 'Hospitalisation'}
                    onChange={() => handleTypeChange('Hospitalisation')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Hospitalisation</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="typeAdmission"
                    className="form-radio h-5 w-5 text-blue-600"
                    checked={formData.typeAdmission === 'EEG'}
                    onChange={() => handleTypeChange('EEG')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">EEG</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="typeAdmission"
                    className="form-radio h-5 w-5 text-blue-600"
                    checked={formData.typeAdmission === 'Consultation'}
                    onChange={() => handleTypeChange('Consultation')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Consultation</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="typeAdmission"
                    className="form-radio h-5 w-5 text-blue-600"
                    checked={formData.typeAdmission === 'Suivi covid 19'}
                    onChange={() => handleTypeChange('Suivi covid 19')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Suivi covid 19</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="typeAdmission"
                    className="form-radio h-5 w-5 text-blue-600"
                    checked={formData.typeAdmission === 'Enquête'}
                    onChange={() => handleTypeChange('Enquête')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Enquête</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 my-2">
                  Nom du centre médical *
                </label>
                <input
                  type="text"
                  name="nomCentreMedical"
                  value={formData.nomCentreMedical}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse du centre médical *
                </label>
                <input
                  type="text"
                  name="adresseCentreMedical"
                  value={formData.adresseCentreMedical}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'admission *
                </label>
                <input
                  type="date"
                  name="dateAdmission"
                  value={formData.dateAdmission}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif d'admission *
                </label>
                <input
                  type="text"
                  name="motifAdmission"
                  value={formData.motifAdmission}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Médecin prescripteur *
                </label>
                <select
                  name="medecinPrescripteur"
                  value={formData.medecinPrescripteur}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl"
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map(medecin => (
                    <option key={medecin.id} value={medecin.id}>
                      {medecin.nom} {medecin.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Médecin référent *
                </label>
                <select
                  name="medecinReference"
                  value={formData.medecinReference}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl"
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map(medecin => (
                    <option key={medecin.id} value={medecin.id}>
                      {medecin.nom} {medecin.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant total *
                </label>
                <input
                  type="number"
                  name="montantTotal"
                  value={formData.montantTotal}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px]  text-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mode de paiement *
                </label>
                <select
                  name="modePayement"
                  value={formData.modePayement}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[45px]"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Virement">Virement</option>
                  <option value="Assurance">Assurance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 h-[45px] w-[150px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 h-[45px] w-[150px]"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}