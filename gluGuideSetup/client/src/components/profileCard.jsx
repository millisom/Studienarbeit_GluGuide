import { useEffect, useState } from 'react';
import { getRecipeById, deleteRecipe } from '../api/recipeApi';
import styles from '../styles/RecipeCard.module.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faPepperHot,
  faListCheck,
  faBalanceScale,
  faTrashAlt,
  faPenToSquare
} from '@fortawesome/free-solid-svg-icons';

const RecipeCard = ({ recipeId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        setRecipe(null);
        if (err.response?.status === 403) {
          setError(t('recipeCard.errorForbidden'));
        } else {
          setError(t('recipeCard.errorLoad'));
        }
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, t]);


  const isOwner = Boolean(
    user && recipe && (recipe.user_id === (user.id || user.userId))
  );

  const handleEdit = () => {
    navigate(`/recipes/${recipeId}/edit`);
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    const confirmed = window.confirm(t('recipeCard.deleteConfirm'));
    if (!confirmed) return;

    try {
      await deleteRecipe(recipeId);
      setSuccessMessage(t('recipeCard.deleteSuccess'));
      setTimeout(() => navigate('/recipes'), 1500);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError(t('recipeCard.deleteError'));
    }
  };

  if (loading) {
    return <div className={`${styles.statusMessage} ${styles.loadingMessage}`}>{t('recipeCard.loading')}</div>;
  }

  if (successMessage) {
    return (
      <div className={`${styles.statusMessage} ${styles.successMessage}`}>
        {successMessage}
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
        {error || t('recipeCard.notFound')}
      </div>
    );
  }

  return (
    <div className={styles.recipeDetailContainer}>
      <div className={styles.recipeHeader}>
        <h2 className={styles.recipeNameTitle}>
          <FontAwesomeIcon icon={faBook} style={{ marginRight: '10px' }} />
          {recipe.name || t('recipeCard.unnamed')}
        </h2>
      </div>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className={styles.recipeSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faPepperHot} />
            {t('recipeCard.ingredients')}
          </h3>
          <ul className={styles.ingredientList}>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={`ing-${i}`}>
                <span className={styles.ingredientName}>{ingredient.name || t('recipeCard.foodIdLabel', { id: ingredient.food_id || t('recipeCard.na') })}</span>
                <span className={styles.ingredientQuantity}> – {ingredient.quantity_in_grams != null ? `${ingredient.quantity_in_grams}g` : t('recipeCard.na')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.instructions && recipe.instructions.length > 0 && (
        <div className={styles.recipeSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faListCheck} />
            {t('recipeCard.instructions')}
          </h3>
          <ol className={styles.instructionList}>
            {recipe.instructions.map((step, i) => (
              <li key={`instr-${i}`}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {(recipe.total_calories != null || recipe.total_proteins != null || recipe.total_fats != null || recipe.total_carbs != null) && (
        <div className={styles.recipeSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBalanceScale} />
            {t('recipeCard.nutritionTitle')}
          </h3>
          <div className={styles.nutritionGrid}>
            <p><strong>{t('recipeCard.calories')}</strong> {recipe.total_calories != null ? `${recipe.total_calories} kcal` : t('recipeCard.na')}</p>
            <p><strong>{t('recipeCard.proteins')}</strong> {recipe.total_proteins != null ? `${recipe.total_proteins} g` : t('recipeCard.na')}</p>
            <p><strong>{t('recipeCard.fats')}</strong> {recipe.total_fats != null ? `${recipe.total_fats} g` : t('recipeCard.na')}</p>
            <p><strong>{t('recipeCard.carbs')}</strong> {recipe.total_carbs != null ? `${recipe.total_carbs} g` : t('recipeCard.na')}</p>
          </div>
        </div>
      )}


      {isOwner && (
        <div className={styles.actionButtonContainer}>
          <button onClick={handleEdit} className={styles.editButton}>
            <FontAwesomeIcon icon={faPenToSquare} /> {t('recipeCard.btnEdit')}
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrashAlt} /> {t('recipeCard.btnDelete')}
          </button>
        </div>
      )}

      {error && !loading && recipe && (
        <div className={`${styles.statusMessage} ${styles.errorMessage}`} style={{ marginTop: '15px' }}>{error}</div>
      )}
    </div>
  );
};

RecipeCard.propTypes = {
  recipeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default RecipeCard;