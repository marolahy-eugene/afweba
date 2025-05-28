import React, { useState } from 'react';
import { FiUser, FiLock, FiLogIn, FiEye, FiEyeOff, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials.email, credentials.password);
      // La redirection sera gérée par la fonction login en fonction du rôle de l'utilisateur
    } catch (err) {
      setError('Identifiants non reconnue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Remplir les identifiants de démo
  const fillDemoCredentials = () => {
    // Utiliser les identifiants de réceptionniste par défaut
    setCredentials({
      email: 'receptionniste@eeg.com',
      password: 'rec123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-3 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="h-[60vh] max-w-[50vh] w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-100 dark:text-white">
            Afweba Plateforme
          </h1>
          <h2 className="my-8 text-xl font-bold text-gray-400 dark:text-white">
            Connexion
          </h2>
        </div>
        
        <Card className='shadow-lg shadow-blue-900 bg-custom'>
          {error && (
            <div className="mb-2 bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/30 dark:border-red-500/50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-7 p-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-md font-medium text-gray-200 dark:text-gray-300">
                Adresse email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="bg-gray-600 block w-full pl-10 pr-3 py-2 border border-gray-500 text-gray-200 rounded-md shadow-md focus:outline-none focus:ring-red-500 focus:border-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="exemple@domaine.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-md font-medium text-gray-200 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    className="bg-gray-600 text-gray-200 block w-full pl-10 pr-3 py-2 border border-gray-500 rounded-md shadow-md focus:outline-none focus:ring-blue-500 focus:border-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-md text-gray-200 dark:text-gray-300">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-200 hover:text-blue-500 dark:text-blue-400">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FiLogIn className="h-5 w-5 text-blue-200 group-hover:text-blue-200" />
                </span>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 dark:text-gray-400">
            © {new Date().getFullYear()} EEG Platform. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}