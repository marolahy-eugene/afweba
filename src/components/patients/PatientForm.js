import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import firebaseService from '@/services/firebaseService';

/**
 * Composant de formulaire réutilisable pour les patients.
 * Gère la création et la modification d'un patient.
 * @param {Object} props - Propriétés du composant.
 * @param {Object} [props.initialData] - Données initiales du patient pour la modification. Si absent, c'est un formulaire de création.
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire avec les données.
 * @param {Function} props.onCancel - Fonction appelée lors de l'annulation.
 */
export default function PatientForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    genre: '',
    profession: '',
    phone: '',
    phoneAssurance: '',
    email: '',
    assuranceMaladie: '',
    domicile: ''
  });

  // État de loading supprimé pour améliorer la fluidité
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Charger les données initiales si disponibles (mode modification)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Formatter la date si nécessaire
      let formattedDate = initialData.dateDeNaissance;
      if (initialData.dateDeNaissance && typeof initialData.dateDeNaissance === 'object' && 'seconds' in initialData.dateDeNaissance) {
         const date = new Date(initialData.dateDeNaissance.seconds * 1000);
         formattedDate = date.toISOString().split('T')[0];
      }

      setFormData({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        dateDeNaissance: formattedDate || '',
        genre: initialData.genre || '',
        profession: initialData.profession || '',
        phone: initialData.phone || '',
        phoneAssurance: initialData.phoneAssurance || '',
        email: initialData.email || '',
        assuranceMaladie: initialData.assuranceMaladie || '',
        domicile: initialData.domicile || ''
      });
    } else {
       // Réinitialiser le formulaire pour la création
       setFormData({
          nom: '',
          prenom: '',
          dateDeNaissance: '',
          genre: '',
          profession: '',
          phone: '',
          phoneAssurance: '',
          email: '',
          assuranceMaladie: '',
          domicile: ''
       });
    }
    setMessage(null);
    setErrors({});
  }, [initialData]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.dateDeNaissance) newErrors.dateDeNaissance = 'La date de naissance est requise';
    if (!formData.genre) newErrors.genre = 'Le genre est requis';
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.phoneAssurance) newErrors.phoneAssurance = 'Le téléphone assurance est requis';
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.assuranceMaladie) newErrors.assuranceMaladie = "L'assurance maladie est requise";
    if (!formData.domicile) newErrors.domicile = 'Le domicile est requis';
    if (!formData.profession) newErrors.profession = 'La profession est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        // Conserver les timestamps et autres champs non modifiables en mode modification
        ...(initialData.createdAt && { createdAt: initialData.createdAt }),
        status: initialData.status || 'En attente' // Conserver le statut existant ou définir par défaut
      };

      if (initialData && initialData.id) {
        // Mode modification
        console.log('Modification du patient avec ID:', initialData.id);
        const patientRef = doc(db, 'patients', initialData.id);
        await updateDoc(patientRef, dataToSave);
        console.log('Patient modifié avec succès');
        setMessage('Patient modifié avec succès !');
        if (onSubmit) onSubmit(initialData.id); // Passer l'ID pour confirmation
      } else {
        // Mode création
        console.log('Création d\'un nouveau patient');
        const newPatient = await firebaseService.addPatient({
           ...dataToSave,
           createdAt: serverTimestamp(), // Ajouter le timestamp seulement à la création
        });
        console.log('Patient ajouté avec succès, ID:', newPatient.id);
        setMessage('Patient ajouté avec succès !');
        if (onSubmit) onSubmit(newPatient.id); // Passer l'ID pour confirmation
      }

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du patient:', err);
      setMessage("Erreur lors de l'enregistrement : " + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {message && (
        <div className={`mb-4 p-3 ${message.includes('succès') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 rounded`}>
          {message}
        </div>
      )}
      <div>
        <label className="block font-medium text-gray-300 mb-1">Nom *</label>
        <input
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className={`w-full border bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 text-gray-200 rounded px-3 py-2 ${errors.nom ? 'border-red-300' : 'border-gray-500'}`}
        />
        {errors.nom && <div className="text-red-500 text-xs mt-1">{errors.nom}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Prénom *</label>
        <input
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.prenom ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.prenom && <div className="text-red-500 text-xs mt-1">{errors.prenom}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Date de naissance *</label>
        <input
          type="date"
          name="dateDeNaissance"
          value={formData.dateDeNaissance}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.dateDeNaissance ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.dateDeNaissance && <div className="text-red-500 text-md mt-1">{errors.dateDeNaissance}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Genre *</label>
        <select
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.genre ? 'border-red-400' : 'border-gray-500'}`}
        >
          <option value="">Sélectionner</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
          <option value="Autre">Autre</option>
        </select>
        {errors.genre && <div className="text-red-500 text-xs mt-1">{errors.genre}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Profession *</label>
        <input
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.profession ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.profession && <div className="text-red-500 text-xs mt-1">{errors.profession}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Téléphone *</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.phone ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Téléphone assurance *</label>
        <input
          name="phoneAssurance"
          value={formData.phoneAssurance}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.phoneAssurance ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.phoneAssurance && <div className="text-red-500 text-xs mt-1">{errors.phoneAssurance}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">E-mail *</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Assurance maladie *</label>
        <input
          name="assuranceMaladie"
          value={formData.assuranceMaladie}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.assuranceMaladie ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.assuranceMaladie && <div className="text-red-500 text-xs mt-1">{errors.assuranceMaladie}</div>}
      </div>
      <div>
        <label className="block font-medium text-gray-300 mb-1">Domicile *</label>
        <input
          name="domicile"
          value={formData.domicile}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 bg-gray-700 bg-opacity-20 focus:border-gray-300 focus:outline-none focus:ring-gray-400 ${errors.domicile ? 'border-red-400' : 'border-gray-500'}`}
        />
        {errors.domicile && <div className="text-red-500 text-xs mt-1">{errors.domicile}</div>}
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Annuler</button>
        <button type="submit" className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">
          {initialData.id ? 'Modifier' : 'Confirmer'}
        </button>
      </div>
    </form>
  );
}