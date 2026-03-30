import React, { useState, useEffect } from 'react';
import { getAllMealsForUser } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/MealHistoryPage.module.css'; 
import { useTranslation } from 'react-i18next';

const MealHistoryPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const userId = user?.id || user?.userId || null;

  const [allMeals, setAllMeals] = useState([]);
  const [groupedMeals, setGroupedMeals] = useState([]);
  const [filter, setFilter] = useState('7days'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeals = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getAllMealsForUser(userId);
        setAllMeals(data);
      } catch (err) {
        console.error("Failed to fetch meals:", err);
        setError(t('mealHistory.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [userId, t]);

  useEffect(() => {
    if (allMeals.length === 0) {
        setGroupedMeals([]);
        return;
    }

    const now = new Date();
    let filtered = [...allMeals];

    // --- 1. FILTERING ---
    if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(meal => new Date(meal.meal_time) >= sevenDaysAgo);
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filtered = filtered.filter(meal => new Date(meal.meal_time) >= thirtyDaysAgo);
    }

    // --- 2. SORTING ---
    filtered.sort((a, b) => {
      const dateA = new Date(a.meal_time).toLocaleDateString('en-CA');
      const dateB = new Date(b.meal_time).toLocaleDateString('en-CA');
      
      if (dateA > dateB) return -1; 
      if (dateA < dateB) return 1;  

      const timeA = new Date(a.meal_time).getTime();
      const timeB = new Date(b.meal_time).getTime();
      return timeA - timeB; 
    });

    // --- 3. GROUPING AND CALCULATING TOTALS ---
    const groups = [];
    let currentGroup = null;

    filtered.forEach(meal => {
        // Dynamic formatting based on the active language
        const dateStr = new Date(meal.meal_time).toLocaleDateString(i18n.language, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        
        if (!currentGroup || currentGroup.date !== dateStr) {
            currentGroup = { 
              date: dateStr, 
              meals: [],
              totals: { calories: 0, proteins: 0, fats: 0, carbs: 0 }
            };
            groups.push(currentGroup);
        }
        currentGroup.meals.push(meal);

        currentGroup.totals.calories += Number(meal.total_calories) || 0;
        currentGroup.totals.proteins += Number(meal.total_proteins) || 0;
        currentGroup.totals.fats += Number(meal.total_fats) || 0;
        currentGroup.totals.carbs += Number(meal.total_carbs) || 0;
    });

    setGroupedMeals(groups);
  }, [allMeals, filter, i18n.language]);

  if (authLoading || loading) return <div className={styles.container} style={{ textAlign: 'center' }}>{t('mealHistory.loading')}</div>;
  if (!user) return <div className={styles.container} style={{ textAlign: 'center' }}>{t('mealHistory.loginRequired')}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('mealHistory.title')}</h1>

      <div className={styles.filterGroup}>
        <button 
          onClick={() => setFilter('7days')}
          className={`${styles.filterButton} ${filter === '7days' ? styles.filterButtonActive : ''}`}
        >
          {t('mealHistory.filter7Days')}
        </button>
        <button 
          onClick={() => setFilter('30days')}
          className={`${styles.filterButton} ${filter === '30days' ? styles.filterButtonActive : ''}`}
        >
          {t('mealHistory.filter30Days')}
        </button>
        <button 
          onClick={() => setFilter('all')}
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
        >
          {t('mealHistory.filterAll')}
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {groupedMeals.length > 0 ? (
          groupedMeals.map((group, index) => (
            
            <div key={index} className={styles.dayFrame}>
              <h2 className={styles.dayTitle}>{group.date}</h2>
              
              <div className={styles.mealsRow}>
                {group.meals.map(meal => (
                  <div 
                    key={meal.meal_id} 
                    className={styles.miniMealCard}
                    onClick={() => navigate(`/meals/${meal.meal_id}`)}
                    title={t('mealHistory.clickTooltip')}
                  >
                    <p className={styles.mealType}>
                      {meal.meal_type ? t(`mealHistory.types.${meal.meal_type.toLowerCase()}`) : t('mealHistory.mealFallback')}
                    </p>
                    <p className={styles.mealTime}>
                      {new Date(meal.meal_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>

              <div 
                className={styles.summaryCard} 
                style={{ 
                  alignSelf: 'center',
                  marginTop: '16px',
                  width: 'fit-content'
                }}
              >
                <p className={styles.summaryTitle}>{t('mealHistory.dailyTotal')}</p>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>{t('mealHistory.calories')}</span> 
                    <span>{group.totals.calories.toFixed(0)} kcal</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>{t('mealHistory.proteins')}</span> 
                    <span>{group.totals.proteins.toFixed(1)} g</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>{t('mealHistory.fats')}</span> 
                    <span>{group.totals.fats.toFixed(1)} g</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>{t('mealHistory.carbs')}</span> 
                    <span>{group.totals.carbs.toFixed(1)} g</span>
                  </div>
                </div>
              </div>
              
            </div>

          ))
        ) : (
          <div className={styles.emptyMessage}>
            {t('mealHistory.emptyMessage')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealHistoryPage;