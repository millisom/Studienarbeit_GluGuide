import { useEffect, useState } from 'react';
import { getMealById, deleteMeal } from '../api/mealApi';
import styles from '../styles/MealCard.module.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAppleAlt,
  faDrumstickBite,
  faBreadSlice,
  faMugHot,
  faQuestionCircle,
  faTrashAlt,
  faStickyNote,
  faBalanceScale,
  faListOl,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';

const MealCard = ({ mealId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getMealIcon = (mealType) => {
    const type = mealType?.toLowerCase() || '';
    if (type.includes('breakfast')) return faMugHot;
    if (type.includes('lunch')) return faDrumstickBite;
    if (type.includes('dinner')) return faBreadSlice;
    if (type.includes('snack')) return faAppleAlt;
    return faQuestionCircle;
  };

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMealById(mealId);
        setMeal(data);
      } catch (err) {
        console.error('Failed to fetch meal:', err);
        setMeal(null);
        setError('Failed to load meal details. Please try again or check the meal ID.');
      } finally {
        setLoading(false);
      }
    };

    if (mealId) {
      fetchMeal();
    }
  }, [mealId]);

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this meal? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteMeal(mealId);
      setSuccessMessage('✅ Meal deleted successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/meals');
      }, 1500);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }
  };

  if (loading) {
    return <div className={`${styles.statusMessage} ${styles.loadingMessage}`}>Loading meal details...</div>;
  }


  if (successMessage) {
    return (
      <div className={`${styles.statusMessage} ${styles.successMessage}`}>
        {successMessage}
      </div>
    );
  }
  
  if (error || !meal) {
    return (
      <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
        {error || 'Meal not found.'}
      </div>
    );
  }

  return (
    <div className={styles.mealDetailContainer}>
      <div className={styles.mealHeader}>
        <h2 className={styles.mealTypeTitle}>
          <FontAwesomeIcon icon={getMealIcon(meal.meal_type)} />
          {meal.meal_type?.toUpperCase() || 'MEAL DETAILS'}
        </h2>
        <p className={styles.mealTimeInfo}>
          <strong>Logged on:</strong> {
            new Date(meal.meal_time).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            })
          }
          <br />
          <strong>Time:</strong> {
            new Date(meal.meal_time).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit', hour12: true
            })
          }
        </p>
      </div>

      {meal.notes && (
        <div className={styles.mealSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />Notes
          </h3>
          <p className={styles.notesText}>{meal.notes}</p>
        </div>
      )}

      <div className={styles.mealSection}>
        <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBalanceScale} style={{ marginRight: '8px' }} />Nutritional Summary
        </h3>
        <div className={styles.nutritionGrid}>
          <p><strong>Calories:</strong> {meal.total_calories != null ? `${meal.total_calories} kcal` : 'N/A'}</p>
          <p><strong>Proteins:</strong> {meal.total_proteins != null ? `${meal.total_proteins} g` : 'N/A'}</p>
          <p><strong>Fats:</strong> {meal.total_fats != null ? `${meal.total_fats} g` : 'N/A'}</p>
          <p><strong>Carbs:</strong> {meal.total_carbs != null ? `${meal.total_carbs} g` : 'N/A'}</p>
        </div>
      </div>

      {meal.food_snapshot && meal.food_snapshot.length > 0 && (
        <div className={styles.mealSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faListOl} style={{ marginRight: '8px' }} />Individual Food Items
          </h3>
          <ul className={styles.itemList}>
            {meal.food_snapshot.map((item, i) => (
              <li key={`food-${i}`}>
                {item.name || item.food_name || 'Unknown Item'} – {item.quantity_in_grams != null ? `${item.quantity_in_grams}g` : 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {meal.recipe_snapshot && meal.recipe_snapshot.name && (
        <div className={styles.mealSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '8px' }} />Recipe Used: <span className={styles.recipeName}>{meal.recipe_snapshot.name}</span>
          </h3>
          {meal.recipe_snapshot.ingredients && meal.recipe_snapshot.ingredients.length > 0 && (
            <>
              <h4 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '15px', marginBottom: '5px' }}>Ingredients:</h4>
              <ul className={styles.itemList}>
                {meal.recipe_snapshot.ingredients.map((ingredient, i) => (
                  <li key={`recipe-ing-${i}`}>
                    {ingredient.name || ingredient.food_name || 'Unknown Ingredient'} – {ingredient.quantity_in_grams != null ? `${ingredient.quantity_in_grams}g` : 'N/A'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {user && (
        <div className={styles.deleteButtonContainer}>
            <button onClick={handleDelete} className={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrashAlt} /> Delete Meal
            </button>
        </div>
      )}

      {error && !loading && meal && (
        <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error}</div>
      )} 
    </div>
  );
};

MealCard.propTypes = {
  mealId: PropTypes.string.isRequired
};

export default MealCard;