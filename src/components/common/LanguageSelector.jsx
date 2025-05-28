import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES } from '@/locales';

/**
 * Composant pour sélectionner la langue de l'application
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 */
const LanguageSelector = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className={`flex items-center ${className} bg-gray-700 bg-opacity-20`}>
      <label htmlFor="language-selector" className="mr-2 text-sm font-medium text-gray-400">
        {t('settings.language')}:
      </label>
      <select
        id="language-selector"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className='bg-gray-900 bg-opacity-100 text-gray-400'>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;