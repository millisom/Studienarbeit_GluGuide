import React, { useState, useEffect } from 'react';
import { getAllMealsForUser } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/MealHistoryPage.module.css'; 

const MealHistoryPage = () => {
  const { user, loading: authLoading } = useAuth();
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
        setError("Could not load meal history.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [userId]);

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
        const dateStr = new Date(meal.meal_time).toLocaleDateString('en-US', {
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
  }, [allMeals, filter]);

  if (authLoading || loading) return <div className={styles.container} style={{ textAlign: 'center' }}>Loading history...</div>;
  if (!user) return <div className={styles.container} style={{ textAlign: 'center' }}>Please log in to view history.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Meal History</h1>

      {/* FILTER BUTTONS */}
      <div className={styles.filterGroup}>
        <button 
          onClick={() => setFilter('7days')}
          className={`${styles.filterButton} ${filter === '7days' ? styles.filterButtonActive : ''}`}
        >
          Last 7 Days
        </button>
        <button 
          onClick={() => setFilter('30days')}
          className={`${styles.filterButton} ${filter === '30days' ? styles.filterButtonActive : ''}`}
        >
          Last 30 Days
        </button>
        <button 
          onClick={() => setFilter('all')}
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
        >
          All Time
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* TIMELINE VIEW (Grouped by Day) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {groupedMeals.length > 0 ? (
          groupedMeals.map((group, index) => (
            
            <div key={index} className={styles.dayFrame}>
              <h2 className={styles.dayTitle}>{group.date}</h2>
              
              {/* MEALS ROW: Nur noch die Mahlzeiten sind hier drin */}
              <div className={styles.mealsRow}>
                {group.meals.map(meal => (
                  <div 
                    key={meal.meal_id} 
                    className={styles.miniMealCard}
                    onClick={() => navigate(`/meals/${meal.meal_id}`)}
                    title="Click to view details"
                  >
                    <p className={styles.mealType}>
                      {meal.meal_type || 'Meal'}
                    </p>
                    <p className={styles.mealTime}>
                      {new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                ))}
              </div>

              {/* SUMMARY ROW: Aus der mealsRow herausgenommen! Sitzt jetzt immer in einer neuen Zeile ganz unten. */}
              <div 
                className={styles.summaryCard} 
                style={{ 
                  alignSelf: 'center',  /* Schiebt die Box nach rechts */
                  marginTop: '16px',       /* Ein kleiner Abstand nach oben zu den Mahlzeiten */
                  width: 'fit-content'    /* Verhindert, dass die Box über die volle Breite gezogen wird */
                }}
              >
                <p className={styles.summaryTitle}>Daily Total</p>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>Calories:</span> 
                    <span>{group.totals.calories.toFixed(0)} kcal</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>Proteins:</span> 
                    <span>{group.totals.proteins.toFixed(1)} g</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>Fats:</span> 
                    <span>{group.totals.fats.toFixed(1)} g</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span style={{ marginRight: '15px' }}>Carbs:</span> 
                    <span>{group.totals.carbs.toFixed(1)} g</span>
                  </div>
                </div>
              </div>
              
            </div>

          ))
        ) : (
          <div className={styles.emptyMessage}>
            No meals found for this time period.
          </div>
        )}
      </div>
    </div>
  );
};

export default MealHistoryPage;