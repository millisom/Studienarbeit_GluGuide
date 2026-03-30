import { useState } from 'react';
import styles from '../styles/LogMealPage.module.css';
import { useTranslation } from 'react-i18next';

const RecipeInstructionsInput = ({ instructions, setInstructions }) => {
  const { t } = useTranslation();
  const [newStep, setNewStep] = useState('');

  const handleChange = (e, index) => {
    const updated = [...instructions];
    updated[index] = e.target.value;
    setInstructions(updated);
  };

  const removeStep = (index) => {
    const updated = instructions.filter((_, i) => i !== index);
    setInstructions(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newStep.trim()) {
      e.preventDefault();
      setInstructions([...instructions, newStep.trim()]);
      setNewStep('');
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    if (newStep.trim()) {
      setInstructions([...instructions, newStep.trim()]);
      setNewStep('');
    }
  }

  return (
    <div className={styles.inputGroup}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('recipeInstructions.placeholderAdd')}
          className={styles.input}
          style={{ flex: 1 }}
        />
        <button 
          onClick={handleAddClick} 
          className={styles.submitButton} 
          style={{ marginTop: 0, padding: '12px 16px' }}
        >
          {t('recipeInstructions.btnAdd')}
        </button>
      </div>

      {instructions.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className={styles.label} style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
            {t('recipeInstructions.currentSteps')}
          </h3>
          
          {instructions.map((step, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <label className={styles.label} style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>
                {t('recipeInstructions.stepLabel', { index: index + 1 })}
              </label>
              
              <textarea
                className={styles.textarea}
                value={step}
                onChange={(e) => handleChange(e, index)}
                placeholder={t('recipeInstructions.placeholderEdit', { index: index + 1 })}
                style={{ height: '80px', marginBottom: '4px' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={(e) => { e.preventDefault(); removeStep(index); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#d9534f', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    padding: '4px 8px'
                  }}
                >
                  {t('recipeInstructions.btnRemove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeInstructionsInput;