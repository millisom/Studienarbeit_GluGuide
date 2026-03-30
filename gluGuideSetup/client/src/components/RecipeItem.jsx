import PropTypes from 'prop-types';
import styles from '../styles/RecipeItem.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const RecipeItem = ({ recipe, onAdd, quantity = 1 }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!recipe) {
    return <div className={styles.loading}>{t('recipeItem.loading')}</div>;
  }

  const { name, description, total_calories, total_proteins, total_fats, total_carbs, ingredients } = recipe;

  const scale = (value) => {
    const num = parseFloat(value) || 0;
    const result = num * quantity;
    return result % 1 === 0 ? result : result.toFixed(1);
  };

  const handleAddClick = () => {
    if (!user) {
        alert(t('recipeItem.alertLogin'));
        return;
    }
    onAdd(recipe);
  };

  return (
    <div className={styles.recipeItemContainer}>
      <h2 className={styles.recipeName}>{name || t('recipeItem.nameFallback')}</h2>
      
      {description && (
        <p className={styles.recipeDescription}>{description}</p>
      )}

      <div className={styles.nutritionSection}>
        <h3 className={styles.sectionTitle}>
          {t('recipeItem.labelCalories').replace(':', '')} {quantity !== 1 ? t('recipeItem.nutritionHeaderPortion', { count: quantity }) : t('recipeItem.nutritionHeaderTotal')}
        </h3>
        <div className={styles.nutritionGrid}>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>{t('recipeItem.labelCalories')}</span>
            <span className={styles.nutritionValue}>{scale(total_calories)} kcal</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>{t('recipeItem.labelProtein')}</span>
            <span className={styles.nutritionValue}>{scale(total_proteins)} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>{t('recipeItem.labelFat')}</span>
            <span className={styles.nutritionValue}>{scale(total_fats)} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>{t('recipeItem.labelCarbs')}</span>
            <span className={styles.nutritionValue}>{scale(total_carbs)} g</span>
          </div>
        </div>
      </div>

      {ingredients && ingredients.length > 0 && (
        <div className={styles.ingredientsSection}>
          <h3 className={styles.sectionTitle}>{t('recipeItem.ingredientsTitle')}</h3>
          <ul className={styles.ingredientsList}>
            {ingredients.map((ing, index) => (
              <li key={index} className={styles.ingredientItem}>
                {ing.food_item?.name || ing.name} - <strong>{scale(ing.quantity_in_grams)}g</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={handleAddClick} 
        className={styles.addRecipeButton}
        disabled={!user}
        style={!user ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        title={!user ? t('recipeItem.btnTitleDisabled') : t('recipeItem.btnTitleEnabled')}
      >
        <FontAwesomeIcon icon={faPlusCircle} /> {t('recipeItem.btnAdd')}
      </button>
    </div>
  );
};

RecipeItem.propTypes = {
  quantity: PropTypes.number,
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    total_calories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_proteins: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_fats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_carbs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingredients: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      food_item: PropTypes.shape({ name: PropTypes.string }),
      quantity_in_grams: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })),
  }),
  onAdd: PropTypes.func.isRequired,
};

export default RecipeItem;