import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language.split('-')[0];

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button 
        onClick={() => changeLanguage('en')}
        style={{ 
          fontWeight: currentLanguage === 'en' ? 'bold' : 'normal',
          border: 'none', background: 'none', cursor: 'pointer',
          color: currentLanguage === 'en' ? '#3498db' : '#7f8c8d'
        }}
      >
        EN 🇺🇸
      </button>
      <span style={{ color: '#ccc' }}>|</span>
      <button 
        onClick={() => changeLanguage('de')}
        style={{ 
          fontWeight: currentLanguage === 'de' ? 'bold' : 'normal',
          border: 'none', background: 'none', cursor: 'pointer',
          color: currentLanguage === 'de' ? '#3498db' : '#7f8c8d'
        }}
      >
        DE 🇩🇪
      </button>
    </div>
  );
};

export default LanguageSwitcher;