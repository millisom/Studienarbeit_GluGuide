import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogMealPage from './LogMealPage'; 
import MealsCards from '../components/MealsCards';
import RecipesCards from '../components/RecipesCards';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faHistory, faBook, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from '../styles/MealsOverview.module.css';

const MealsOverviewPage = () => {
  const navigate = useNavigate();
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Nutrition Hub</h1>

      <div className={styles.topGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUtensils} /> Log a New Meal
          </h2>
          <LogMealPage />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faHistory} /> Recent Meals
          </h2>
          <div className={styles.scrollableHistory}>
             <MealsCards />
          </div>
        </section>
      </div>

      <section className={`${styles.section} ${styles.fullWidth}`}>
        <div className={styles.recipeHeader}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBook} /> My Recipes
          </h2>
          <button 
            className={styles.createBtn} 
            onClick={() => navigate('/createRecipe')}
          >
            <FontAwesomeIcon icon={faPlus} /> Create a New Recipe
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