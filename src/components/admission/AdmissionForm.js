import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import firebaseService from '@/services/firebaseService';

/**
 * Composant de formulaire réutilisable pour les admissions.
 * Gère la création et la modification d'une admission.
 * @param {Object} props - Propriétés du composant.
 * @param {Object} [props.initialData] - Données initiales de l'admission pour la modification. Si absent, c'est un formulaire de création.
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire avec les données.
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation.
 * @param {Object} props.patient - Les données du patient associé à l'admission.
 */
export default function AdmissionForm({ initialData = {}, onSubmit, onCancel, patient }) {
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

  // Charger la liste des médecins depuis Firebase
  useEffect(() => {
    const loadMedecins = async () => {
      try {
        const medecinsList = await firebaseService.getAllMedecins();
        setMedecins(medecinsList);
      } catch (err) {
        console.error('Erreur lors du chargement des médecins:', err);
        setError('Impossible de charger la liste des médecins');
      }
    };

    loadMedecins();
  }, []);

  // Charger les données initiales si disponibles (mode modification)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Formatter la date si nécessaire
      let formattedDate = initialData.dateAdmission;
      if (initialData.dateAdmission && typeof initialData.dateAdmission === 'object' && 'seconds' in initialData.dateAdmission) {
         const date = new Date(initialData.dateAdmission.seconds * 1000);
         formattedDate = date.toISOString().split('T')[0];
      }

      setFormData({
        typeAdmission: initialData.typeAdmission || 'EEG',
        nomCentreMedical: initialData.nomCentreMedical || '',
        adresseCentreMedical: initialData.adresseCentreMedical || '',
        dateAdmission: formattedDate || new Date().toISOString().split('T')[0],
        motifAdmission: initialData.motifAdmission || '',
        medecinPrescripteur: initialData.medecinPrescripteur || '',
        medecinReference: initialData.medecinReference || '',
        montantTotal: initialData.montantTotal || '',
        modePayement: initialData.modePayement || ''
      });
    } else {
       // Réinitialiser le formulaire pour la création
       setFormData({
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
    }
    setError('');
    setSuccess(false);
  }, [initialData]);

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

      // Préparer les données pour Firebase
      const dataToSave = {
        ...formData,
        // Ajouter ou mettre à jour les champs spécifiques à l'admission
        idPatient: patient.id,
        nomPatient: `${patient.nom} ${patient.prenom}`,
        etat: (initialData && initialData.etat) || 'Observation', // Vérifier si initialData existe avant d'accéder à etat
      };

      if (initialData && initialData.id) {
        // Mode modification
        console.log('Modification de l\'admission avec ID:', initialData.id);
        const admissionRef = doc(db, 'admissions', initialData.id);
        await updateDoc(admissionRef, dataToSave);
        console.log('Admission modifiée avec succès');
        setSuccess(true);
        if (onSubmit) onSubmit(initialData.id); // Passer l'ID pour confirmation
      } else {
        // Mode création
        console.log('Création d\'une nouvelle admission pour le patient:', patient.id);
        const docRef = await addDoc(collection(db, 'admissions'), {
           ...dataToSave,
           dateCreation: serverTimestamp(), // Ajouter le timestamp seulement à la création
        });
        console.log('Admission enregistrée avec succès, ID:', docRef.id);
        setSuccess(true);
        if (onSubmit) onSubmit(docRef.id); // Passer l'ID pour confirmation
      }

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'admission:', err);
      setError('Une erreur est survenue lors de l\'enregistrement');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          Admission enregistrée avec succès ! Redirection...
        </div>
      )}

      <div className="mb-8">
        <label className="block text-md font-medium text-gray-200 mb-2 required">
          Type de traitement
        </label>
        <div className="flex flex-wrap gap-8">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="typeAdmission"
              className="form-radio h-5 w-5 text-blue-600"
              checked={formData.typeAdmission === 'Hospitalisation'}
              onChange={() => handleTypeChange('Hospitalisation')}
            />
            <span className="ml-2">Hospitalisation</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="typeAdmission"
              className="form-radio h-5 w-5 text-blue-600"
              checked={formData.typeAdmission === 'EEG'}
              onChange={() => handleTypeChange('EEG')}
            />
            <span className="ml-2">EEG</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="typeAdmission"
              className="form-radio h-5 w-5 text-blue-600"
              checked={formData.typeAdmission === 'Consultation'}
              onChange={() => handleTypeChange('Consultation')}
            />
            <span className="ml-2">Consultation</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="typeAdmission"
              className="form-radio h-5 w-5 text-blue-600"
              checked={formData.typeAdmission === 'Suivi covid 19'}
              onChange={() => handleTypeChange('Suivi covid 19')}
            />
            <span className="ml-2">Suivi covid 19</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="typeAdmission"
              className="form-radio h-5 w-5 text-blue-600"
              checked={formData.typeAdmission === 'Enquête'}
              onChange={() => handleTypeChange('Enquête')}
            />
            <span className="ml-2">Enquête</span>
          </label>
        </div>
      </div>

      <div className="my-8">
        <label htmlFor="nomCentreMedical" className="block text-md font-medium text-gray-200 required">
          Nom du centre médical
        </label>
        <input
          type="text"
          id="nomCentreMedical"
          name="nomCentreMedical"
          value={formData.nomCentreMedical}
          onChange={handleChange}
          className="mt-1 block w-full border bg-gray-700 bg-opacity-40 border-gray-500 rounded-md shadow-md py-2 px-3 focus:outline-none focus:ring-gray-400 focus:border-gray-500"
        />
      </div>

      <div className="mb-8">
        <label htmlFor="adresseCentreMedical" className="block text-md font-medium text-gray-200 required">
          Adresse du centre médical
        </label>
        <input
          type="text"
          id="adresseCentreMedical"
          name="adresseCentreMedical"
          value={formData.adresseCentreMedical}
          onChange={handleChange}
          className="mt-1 block w-full border bg-gray-700 bg-opacity-40 border-gray-500 rounded-md shadow-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className='mb-1 mr-2'>
          <label htmlFor="dateAdmission" className="block text-md font-medium text-gray-200 required">
            Date de l'admission
          </label>
          <input
            type="date"
            id="dateAdmission"
            name="dateAdmission"
            value={formData.dateAdmission}
            onChange={handleChange}
            className="mt-1 block w-full border bg-gray-700 bg-opacity-40 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className='mb-2 ml-3'>
          <label htmlFor="motifAdmission" className="block text-md font-medium text-gray-200 required">
            Motif d'admission
          </label>
          <select
            id="motifAdmission"
            name="motifAdmission"
            value={formData.motifAdmission}
            onChange={handleChange}
            className="mt-2 block w-full border bg-gray-700 bg-opacity-40 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className='bg-gray-800 bg-opacity-90 border-gray-500'>Sélectionner un motif</option>
            <option value="Consultation" className='bg-gray-800 bg-opacity-90 border-gray-500'>Consultation</option>
            <option value="EEG" className='bg-gray-800 bg-opacity-90 border-gray-500 '>EEG</option>
            <option value="ECG" className='bg-gray-800 bg-opacity-90 border-gray-500'>ECG</option>
            <option value="Biologie" className='bg-gray-800 bg-opacity-90 border-gray-500'>Biologie</option>
            <option value="Hospitalisation" className='bg-gray-800 bg-opacity-90 border-gray-500'>Hospitalisation</option>
            <option value="Imagerie" className='bg-gray-800 bg-opacity-90 border-gray-500'>Imagerie</option>
            <option value="Autre" className='bg-gray-800 bg-opacity-90 border-gray-500'>Autre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className='mr-2'>
          <label htmlFor="medecinPrescripteur" className="block text-md font-medium text-gray-200 required">
            Médecin prescripteur
          </label>
          <select
            id="medecinPrescripteur"
            name="medecinPrescripteur"
            value={formData.medecinPrescripteur}
            onChange={handleChange}
            className="mt-1 block w-full border bg-gray-700 bg-opacity-90 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className='bg-gray-800 bg-opacity-90 border-gray-500'>Sélectionner un médecin</option>
            {medecins.map(medecin => (
              <option key={medecin.id} value={medecin.id}>{medecin.nom}</option>
            ))}
          </select>
        </div>
        <div className='ml-3'>
          <label htmlFor="medecinReference" className="block text-md font-medium text-gray-200 required">
            Médecin référent
          </label>
          <select
            id="medecinReference"
            name="medecinReference"
            value={formData.medecinReference}
            onChange={handleChange}
            className="mt-1 block w-full border bg-gray-700 bg-opacity-90 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className='bg-gray-800 bg-opacity-90 border-gray-500'>Sélectionner un médecin</option>
            {medecins.map(medecin => (
              <option key={medecin.id} value={medecin.id}>{medecin.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className='mr-2'>
          <label htmlFor="montantTotal" className="block text-md font-medium text-gray-200 required">
            Montant total
          </label>
          <input
            type="number"
            id="montantTotal"
            name="montantTotal"
            value={formData.montantTotal}
            onChange={handleChange}
            className="mt-1 block w-full border bg-gray-700 bg-opacity-90 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className='ml-3'>
          <label htmlFor="modePayement" className="block text-md font-medium text-gray-200 required">
            Mode de payement
          </label>
          <select
            id="modePayement"
            name="modePayement"
            value={formData.modePayement}
            onChange={handleChange}
            className="mt-2 block w-full border bg-gray-700 bg-opacity-90 border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className='bg-gray-800 bg-opacity-90 border-gray-500'>Sélectionner un mode</option>
            <option value="Espèces" className='bg-gray-800 bg-opacity-90 border-gray-500'>Espèces</option>
            <option value="Carte bancaire" className='bg-gray-800 bg-opacity-90 border-gray-500'>Carte bancaire</option>
            <option value="Chèque" className='bg-gray-800 bg-opacity-90 border-gray-500'>Chèque</option>
            <option value="Virement" className='bg-gray-800 bg-opacity-90 border-gray-500'>Virement</option>
            <option value="Assurance" className='bg-gray-800 bg-opacity-90 border-gray-500'>Assurance</option>
          </select>
        </div>
      </div>

      <div className="pt-3 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 w-[20vh] bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 w-[20vh]"
        >
          {loading ? 'Traitement...' : (initialData && initialData.id) ? 'Modifier' : 'Confirmer'}
        </button>
      </div>
    </form>
  );
}