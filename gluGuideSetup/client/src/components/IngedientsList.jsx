import React from 'react';
import styles from '../styles/LogMealPage.module.css';
import { useTranslation } from 'react-i18next';

const IngredientList = ({ ingredients, onRemove }) => {
  const { t } = useTranslation();

  return (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      <h3 className={styles.title}>{t('ingredientList.title')}</h3>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {ingredients.map((item, index) => (
          <li
            key={index}
            style={{
              background: 'var(--color-background)',
              border: '1px solid var(--color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{item.name} — {item.quantity || t('ingredientList.customQuantity')}</span>
            <button
              onClick={() => onRemove(index)}
              style={{
                background: 'transparent',
                color: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientList;