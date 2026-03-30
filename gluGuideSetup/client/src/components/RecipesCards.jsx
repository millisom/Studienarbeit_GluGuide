import { useEffect, useState } from 'react';
import { getAllRecipes } from '../api/recipeApi';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/RecipesCards.module.css';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookReader, faPlusCircle, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const RecipesCards = ({ limit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
          setLoading(false);
          return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setError(t('recipesCards.errorText'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user, t]);

  if (!user) {
    return (
      <div className={styles.statusMessageContainer}>
          <FontAwesomeIcon icon={faUtensils} size="3x" style={{ marginBottom: '20px', color: '#ccc'}} />
          <h2>{t('recipesCards.loginTitle')}</h2>
          <p>{t('recipesCards.loginText')}</p>
          <Link to="/login" style={{ marginTop: '10px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
              {t('recipesCards.goLogin')}
          </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.statusMessageContainer}>
        <FontAwesomeIcon icon={faBookReader} size="3x" style={{ marginBottom: '20px' }} />
        <h2>{t('recipesCards.loading')}</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.statusMessageContainer} ${styles.errorMessage}`}>
        <h2>{t('recipesCards.errorTitle')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={`${styles.statusMessageContainer} ${styles.noRecipesMessage}`}>
        <FontAwesomeIcon icon={faPlusCircle} size="3x" style={{ marginBottom: '20px' }} />
        <h2>{t('recipesCards.emptyTitle')}</h2>
        <p>{t('recipesCards.emptyText')}</p>
        <button 
            className={styles.viewRecipeButton} 
            onClick={() => navigate('/createRecipe')}
            style={{ marginTop: '15px' }}
        >
            {t('recipesCards.btnCreate')}
        </button>
      </div>
    );
  }

  const displayedRecipes = limit ? recipes.slice(0, limit) : recipes;

  return (
      <div className={styles.recipesGrid}>
        {displayedRecipes.map((recipe) => (
          <div key={recipe.id} className={styles.recipeSummaryCard}>
            <h3 className={styles.recipeName}>{recipe.name || t('recipesCards.unnamed')}</h3>
            {recipe.total_calories != null && (
                <p className={styles.recipeCalories}>
                    <strong>{t('recipesCards.totalCalories')}</strong> {recipe.total_calories} kcal
                </p>
            )}
            <button
              className={styles.viewRecipeButton}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              {t('recipesCards.btnView')}
            </button>
          </div>
        ))}
      </div>
  );
};

export default RecipesCards;