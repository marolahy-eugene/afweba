import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';

export default function NouveauPatient() {
  const router = useRouter();
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nom) newErrors.nom = 'Le nom est requis';
    if (!form.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!form.dateDeNaissance) newErrors.dateDeNaissance = 'La date de naissance est requise';
    if (!form.genre) newErrors.genre = 'Le genre est requis';
    if (!form.phone) newErrors.phone = 'Le téléphone est requis';
    if (!form.phoneAssurance) newErrors.phoneAssurance = 'Le téléphone assurance est requis';
    if (!form.email) newErrors.email = "L'email est requis";
    if (!form.assuranceMaladie) newErrors.assuranceMaladie = "L'assurance maladie est requise";
    if (!form.domicile) newErrors.domicile = 'Le domicile est requis';
    if (!form.profession) newErrors.profession = 'La profession est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;
    setLoading(true);
    
    try {
      // Ajouter la date de création et le statut par défaut
      const patientData = {
        ...form,
        createdAt: serverTimestamp(), // Utiliser serverTimestamp pour avoir la date exacte du serveur
        status: 'En attente'
      };
      
      // Utiliser le service Firebase pour ajouter le patient
      const newPatient = await firebaseService.addPatient(patientData);
      
      setMessage('Patient ajouté avec succès !');
      setTimeout(() => {
        router.push('/patients/list');
      }, 1000);
    } catch (err) {
      setMessage("Erreur lors de l'ajout : " + err.message);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Nouveau patient</h1>
        </div>

        <div className="w-[85%] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          {message && (
            <div className="mb-6 p-4 rounded-md bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-500/50 text-green-700 dark:text-green-200">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Nom *</label>
              <input 
                name="nom" 
                value={form.nom} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.nom ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.nom && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nom}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom *</label>
              <input 
                name="prenom" 
                value={form.prenom} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.prenom ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.prenom && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.prenom}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Date de naissance *</label>
              <input 
                type="date" 
                name="dateDeNaissance" 
                value={form.dateDeNaissance} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.dateDeNaissance ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.dateDeNaissance && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.dateDeNaissance}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Genre *</label>
              <select 
                name="genre" 
                value={form.genre} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.genre ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              >
                <option value="">Sélectionner</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.genre && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.genre}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Profession *</label>
              <input 
                name="profession" 
                value={form.profession} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.profession ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.profession && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.profession}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone *</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.phone ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.phone && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone assurance *</label>
              <input 
                name="phoneAssurance" 
                value={form.phoneAssurance} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.phoneAssurance ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.phoneAssurance && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phoneAssurance}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">E-mail *</label>
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.email && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Assurance maladie *</label>
              <input 
                name="assuranceMaladie" 
                value={form.assuranceMaladie} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.assuranceMaladie ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.assuranceMaladie && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.assuranceMaladie}</div>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Domicile *</label>
              <input 
                name="domicile" 
                value={form.domicile} 
                onChange={handleChange} 
                className={`mt-1 w-full border rounded px-3 py-2 ${errors.domicile ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`} 
              />
              {errors.domicile && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.domicile}</div>}
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}