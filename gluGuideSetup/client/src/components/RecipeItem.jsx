import PropTypes from 'prop-types';
import styles from '../styles/RecipeItem.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

// Added 'quantity' to the destructured props
const RecipeItem = ({ recipe, onAdd, quantity = 1 }) => {
  const { user } = useAuth();

  if (!recipe) {
    return <div className={styles.loading}>Loading recipe details...</div>;
  }

  const { name, description, total_calories, total_proteins, total_fats, total_carbs, ingredients } = recipe;

  // Helper function to calculate scaled values
  const scale = (value) => {
    const num = parseFloat(value) || 0;
    const result = num * quantity;
    // If it's a whole number, show it; otherwise, show 1 decimal point
    return result % 1 === 0 ? result : result.toFixed(1);
  };

  const handleAddClick = () => {
    if (!user) {
        alert("Please log in to add recipes to your meal.");
        return;
    }
    // We pass the base recipe; the parent already handles the quantity logic
    onAdd(recipe);
  };

  return (
    <div className={styles.recipeItemContainer}>
      <h2 className={styles.recipeName}>{name || 'Recipe Name'}</h2>
      
      {description && (
        <p className={styles.recipeDescription}>{description}</p>
      )}

      <div className={styles.nutritionSection}>
        <h3 className={styles.sectionTitle}>
          Nutritional Information {quantity !== 1 ? `(for ${quantity}x portion)` : '(Total)'}
        </h3>
        <div className={styles.nutritionGrid}>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Calories:</span>
            <span className={styles.nutritionValue}>{scale(total_calories)} kcal</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Protein:</span>
            <span className={styles.nutritionValue}>{scale(total_proteins)} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Fat:</span>
            <span className={styles.nutritionValue}>{scale(total_fats)} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Carbs:</span>
            <span className={styles.nutritionValue}>{scale(total_carbs)} g</span>
          </div>
        </div>
      </div>

      {ingredients && ingredients.length > 0 && (
        <div className={styles.ingredientsSection}>
          <h3 className={styles.sectionTitle}>Adjusted Ingredients</h3>
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
        title={!user ? "Login to add recipes" : "Add to meal"}
      >
        <FontAwesomeIcon icon={faPlusCircle} /> Add This Recipe to Meal
      </button>
    </div>
  );
};

RecipeItem.propTypes = {
  // Added quantity to propTypes
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