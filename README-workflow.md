# Workflow EEG Platform - Gestion des rôles

Ce document décrit le système de workflows mis en place dans la plateforme EEG pour gérer les différentes étapes de traitement des examens EEG selon les rôles des utilisateurs.

## Rôles et responsabilités

La plateforme EEG gère quatre types d'utilisateurs, chacun avec des responsabilités spécifiques :

### 1. Réceptionniste
- Création et gestion des dossiers patients
- Création de nouveaux dossiers d'examen
- Suivi des dossiers en attente de traitement

### 2. Infirmier
- Accès aux dossiers en attente d'observation et d'enregistrement
- Réalisation des observations patient
- Enregistrement des données EEG

### 3. Médecin
- Accès aux dossiers en attente d'analyse
- Analyse des enregistrements EEG
- Rédaction des rapports d'analyse

### 4. Professeur
- Accès aux dossiers analysés en attente d'interprétation
- Interprétation finale des analyses
- Validation des rapports et clôture des dossiers

## Workflow du processus EEG

Le processus de traitement d'un examen EEG suit les étapes suivantes :

1. **Création** : Le réceptionniste crée un dossier pour le patient et planifie un examen EEG (statut : "En attente")
2. **Observation** : L'infirmier procède à l'observation initiale du patient (statut : "Observation")
3. **Enregistrement** : L'infirmier réalise l'enregistrement EEG (statut : "Enregistrement")
4. **Analyse** : Le médecin analyse les données EEG et rédige un rapport préliminaire (statut : "Analyse")
5. **Interprétation** : Le professeur interprète l'analyse et valide le diagnostic (statut : "Interprétation")
6. **Finalisation** : Le professeur valide le rapport final et clôture le dossier (statut : "Terminé")

## Tableaux de bord spécifiques

### Tableau de bord du Réceptionniste
- Affiche tous les patients enregistrés dans le système
- Permet de créer de nouveaux dossiers patients
- Permet de créer de nouveaux examens pour les patients
- Affiche des statistiques sur le nombre total de patients et ceux en attente de traitement

### Tableau de bord de l'Infirmier
- Affiche uniquement les dossiers d'examens en attente d'observation ou d'enregistrement
- Permet d'accéder aux détails des examens pour saisir les observations
- Permet de gérer l'enregistrement des données EEG
- Affiche des statistiques sur le nombre de dossiers en observation et en enregistrement

### Tableau de bord du Médecin
- Affiche uniquement les dossiers d'examens dont l'enregistrement est terminé et en attente d'analyse
- Permet d'accéder aux enregistrements EEG pour analyse
- Permet de rédiger et soumettre des rapports d'analyse
- Affiche des statistiques sur le nombre de dossiers en analyse et en attente d'analyse

### Tableau de bord du Professeur
- Affiche uniquement les dossiers d'examens dont l'analyse est terminée et en attente d'interprétation
- Permet d'accéder aux analyses pour interprétation finale
- Permet de valider les rapports et de clôturer les dossiers
- Affiche des statistiques sur le nombre de dossiers en interprétation, terminés et en attente

## Système d'authentification et contrôle d'accès

Le système utilise un mécanisme d'authentification basé sur les rôles :

- Chaque utilisateur se connecte avec son email, mot de passe et sélectionne son rôle
- Le système authentifie l'utilisateur et stocke son rôle dans le contexte d'authentification
- Les routes sont protégées par un composant `RoleBasedRoute` qui vérifie si l'utilisateur a le rôle requis
- Si l'utilisateur tente d'accéder à une route pour laquelle il n'a pas les droits, il est redirigé vers son tableau de bord approprié
- La page d'accueil et le tableau de bord principal redirigent automatiquement vers le tableau de bord spécifique au rôle de l'utilisateur

## Statuts des examens

Les différents statuts possibles pour un examen sont :

1. **En attente** : Dossier créé, en attente d'observation
2. **Observation** : Observation en cours par l'infirmier
3. **Enregistrement** : Enregistrement EEG en cours
4. **Analyse** : Analyse des données EEG en cours par le médecin
5. **Interprétation** : Interprétation de l'analyse en cours par le professeur
6. **Terminé** : Examen terminé et rapport final validé

Chaque rôle ne peut voir et traiter que les dossiers correspondant à ses responsabilités dans le workflow.

## Implémentation technique

Cette fonctionnalité est implémentée à travers plusieurs composants :

- **Contexte d'authentification** : Gère l'authentification et les rôles des utilisateurs
- **Composant de route basé sur les rôles** : Protège les routes en fonction des rôles
- **Tableaux de bord spécifiques** : Interface utilisateur adaptée à chaque rôle
- **Filtrage des données** : Affiche uniquement les dossiers pertinents pour chaque rôle
- **Statistiques en temps réel** : Affiche des métriques pertinentes selon le rôle

## Test du système

Pour tester le système, vous pouvez vous connecter avec les identifiants suivants :
- Email : test@example.com
- Mot de passe : password
- Rôle : Sélectionnez le rôle que vous souhaitez tester 