import { useState } from 'react';
import styles from '../styles/LogMealPage.module.css';

const RecipeInstructionsInput = ({ instructions, setInstructions }) => {
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
    // REMOVED the extra marginTop here! The parent's gap: 24px will handle the spacing now.
    <div className={styles.inputGroup}>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a step and press Enter"
          className={styles.input}
          style={{ flex: 1 }}
        />
        <button 
            onClick={handleAddClick} 
            className={styles.submitButton} 
            style={{ marginTop: 0, padding: '12px 16px' }}
        >
            Add Step
        </button>
      </div>

      {instructions.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className={styles.label} style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
            Current Steps:
          </h3>
          
          {instructions.map((step, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <label className={styles.label} style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>
                Step {index + 1}
              </label>
              
              <textarea
                className={styles.textarea}
                value={step}
                onChange={(e) => handleChange(e, index)}
                placeholder={`Edit step ${index + 1}`}
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
                    Remove step
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