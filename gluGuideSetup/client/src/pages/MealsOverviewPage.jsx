import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogMealPage from './LogMealPage';
import MealsCards from '../components/MealsCards';
import RecipesCards from '../components/RecipesCards';
import styles from '../styles/MealsOverview.module.css';
import { useTranslation } from 'react-i18next';

const MealsOverviewPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);

  const handleMealLogged = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>
        {t('mealsOverview.title')}
      </h1>

      <section className={styles.logMealSection}>
        <h2 className={styles.sectionTitle} style={{ margin: '0 0 20px 0' }}>
          {t('mealsOverview.logMealTitle')}
        </h2>
        <LogMealPage onMealLogged={handleMealLogged} />
      </section>

      <section className={styles.section} style={{ marginBottom: '30px' }}>
        <h2 className={styles.sectionTitle}>
          {t('mealsOverview.recentMealsTitle')}
        </h2>
        <MealsCards refreshTrigger={refreshKey} />
      </section>

      <section className={styles.section}>
        <div className={styles.recipeHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            {t('mealsOverview.recipesTitle')}
          </h2>
          <button
            className={styles.createBtn}
            onClick={() => navigate('/createRecipe')}
          >
            {t('mealsOverview.btnCreateRecipe')}
          </button>
        </div>

        <div className={showAllRecipes ? styles.recipesExpanded : styles.recipesCollapsed}>
          <RecipesCards
            limit={showAllRecipes ? undefined : 9}
            onCountChange={setRecipeCount}
          />
        </div>

        {!showAllRecipes && recipeCount > 9 && (
          <div className={styles.center}>
            <button className={styles.seeMoreBtn} onClick={() => setShowAllRecipes(true)}>
              {t('mealsOverview.btnSeeMore')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default MealsOverviewPage;