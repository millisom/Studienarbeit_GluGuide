import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogMealPage from './LogMealPage'; 
import MealsCards from '../components/MealsCards';
import RecipesCards from '../components/RecipesCards';
import styles from '../styles/MealsOverview.module.css';

const MealsOverviewPage = () => {
  const navigate = useNavigate();
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMealLogged = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>
        Nutrition Hub
      </h1>

      {/* SECTION 1: Log Meal (Centered, Full Width) */}
      <section className={`${styles.section} ${styles.fullWidth}`} style={{ maxWidth: '800px', margin: '0 auto 30px auto' }}>
        <h2 className={styles.sectionTitle}>
          Log a New Meal
        </h2>
        <LogMealPage onMealLogged={handleMealLogged} />
      </section>

      {/* SECTION 2: Recent Meals (Full Width, below Log Meal) */}
      <section className={`${styles.section} ${styles.fullWidth}`} style={{ marginBottom: '30px' }}>
        <h2 className={styles.sectionTitle}>
          Recent Meals
        </h2>
        <MealsCards refreshTrigger={refreshKey} />
      </section>

      {/* SECTION 3: Recipes */}
      <section className={`${styles.section} ${styles.fullWidth}`}>
        <div className={styles.recipeHeader}>
          <h2 className={styles.sectionTitle}>
            My Recipes
          </h2>
          <button 
            className={styles.createBtn} 
            onClick={() => navigate('/createRecipe')}
          >
            Create a New Recipe
          </button>
        </div>

        <div className={showAllRecipes ? styles.recipesExpanded : styles.recipesCollapsed}>
           <RecipesCards limit={showAllRecipes ? undefined : 9} />
        </div>

        {!showAllRecipes && (
          <div className={styles.center}>
            <button className={styles.seeMoreBtn} onClick={() => setShowAllRecipes(true)}>
              See More Recipes
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default MealsOverviewPage;