import { useEffect, useState } from 'react';
import { getAllRecipes } from '../api/recipeApi';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/RecipesCards.module.css';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookReader, faPlusCircle, faUtensils } from '@fortawesome/free-solid-svg-icons';

const RecipesCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        setError('Failed to load recipes. Please refresh the page or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);


  if (!user) {
    return (
      <div className={styles.statusMessageContainer}>
          <FontAwesomeIcon icon={faUtensils} size="3x" style={{ marginBottom: '20px', color: '#ccc'}} />
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your recipe collection.</p>
          <Link to="/login" style={{ marginTop: '10px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
              Go to Login
          </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.statusMessageContainer}>
        <FontAwesomeIcon icon={faBookReader} size="3x" style={{ marginBottom: '20px' }} />
        <h2>Loading recipes...</h2>
      </div>
    );
  }


  if (error) {
    return (
      <div className={`${styles.statusMessageContainer} ${styles.errorMessage}`}>
        <h2>Error Loading Recipes</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={`${styles.statusMessageContainer} ${styles.noRecipesMessage}`}>
        <FontAwesomeIcon icon={faPlusCircle} size="3x" style={{ marginBottom: '20px' }} />
        <h2>Your Cookbook is Empty</h2>
        <p>No recipes found yet. How about creating your first culinary masterpiece?</p>
        <button 
            className={styles.viewRecipeButton} 
            onClick={() => navigate('/createRecipe')}
            style={{ marginTop: '15px' }}
        >
            Create Recipe
        </button>
      </div>
    );
  }

  return (
      <div className={styles.recipesGrid}>
        {recipes.map((recipe) => (
          <div key={recipe.id} className={styles.recipeSummaryCard}>
            <h3 className={styles.recipeName}>{recipe.name || 'Unnamed Recipe'}</h3>
            {recipe.total_calories != null && (
                <p className={styles.recipeCalories}>
                    <strong>Total Calories:</strong> {recipe.total_calories} kcal
                </p>
            )}
            <button
              className={styles.viewRecipeButton}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              View Full Recipe
            </button>
          </div>
        ))}
      </div>
  );
};

export default RecipesCards;