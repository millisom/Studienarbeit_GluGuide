import PropTypes from 'prop-types';
import styles from '../styles/MealPreview.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const MealPreview = ({ items, selectedRecipe, onRemove, onRemoveRecipe }) => {
  const { t } = useTranslation();
  const hasContent = items.length > 0 || selectedRecipe;

  return (
    <div className={styles.previewSection}>
      <h2 className={styles.previewTitle}>{t('mealPreview.title')}</h2>
      {!hasContent ? (
        <div className={styles.emptyPreview}>
          <p>{t('mealPreview.emptyTitle')}</p>
          <p>{t('mealPreview.emptySubtext')}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={`food-${index}`} className={styles.item}>
              <div className={styles.itemText}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemDetails}> – {item.quantity_in_grams || t('mealPreview.na')}g</span>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.removeBtn} 
                  onClick={() => onRemove(index)} 
                  aria-label={t('mealPreview.ariaRemoveItem', { name: item.name })}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          ))}

          {selectedRecipe && (
            <li className={`${styles.item} ${styles.recipeItemPreview}`}>
              <div className={styles.itemText}>
                <span className={styles.itemName}>{selectedRecipe.name}</span>
                <span className={styles.itemDetails}> {t('mealPreview.recipeLabel')}</span>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.removeBtn} 
                  onClick={onRemoveRecipe} 
                  aria-label={t('mealPreview.ariaRemoveRecipe', { name: selectedRecipe.name })}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

MealPreview.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    quantity_in_grams: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })).isRequired,
  selectedRecipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  onRemove: PropTypes.func.isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
};

MealPreview.defaultProps = {
  selectedRecipe: null,
};

export default MealPreview;