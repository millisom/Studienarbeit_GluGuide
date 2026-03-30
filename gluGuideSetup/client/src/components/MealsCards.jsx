import { useEffect, useState } from 'react';
import { getAllMealsForUser } from '../api/mealApi';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/MealsCards.module.css';
import { useAuth } from '../context/AuthContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const MealsCards = ({ refreshTrigger }) => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, proteins: 0, fats: 0, carbs: 0 }); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user) {
          setLoading(false);
          return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await getAllMealsForUser();
        
        // We keep 'en-CA' for the API filter as it produces YYYY-MM-DD
        const todayStr = new Date().toLocaleDateString('en-CA');
        
        const todaysMeals = data.filter(meal => {
          if (!meal.meal_time) return false;
          return new Date(meal.meal_time).toLocaleDateString('en-CA') === todayStr;
        });

        todaysMeals.sort((a, b) => new Date(b.meal_time) - new Date(a.meal_time));
        
        let dailyCals = 0, dailyPro = 0, dailyFat = 0, dailyCarb = 0;
        todaysMeals.forEach(meal => {
            dailyCals += Number(meal.total_calories) || 0;
            dailyPro += Number(meal.total_proteins) || 0;
            dailyFat += Number(meal.total_fats) || 0;
            dailyCarb += Number(meal.total_carbs) || 0;
        });
        
        setTotals({ calories: dailyCals, proteins: dailyPro, fats: dailyFat, carbs: dailyCarb });
        setMeals(todaysMeals);
        
      } catch (error) {
        console.error('Failed to fetch meals:', error);
        setError(t('mealsCards.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user, refreshTrigger, t]); 

  if (!user) return <div className={styles.statusMessageContainer}>{t('mealsCards.loginPrompt')}</div>;
  if (loading) return <div className={styles.statusMessageContainer}>{t('mealsCards.loading')}</div>;
  if (error) return <div className={`${styles.statusMessageContainer} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--color-primary)', textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          {t('mealsCards.todayTotal')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', fontSize: '1rem', color: '#475569' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>{totals.calories.toFixed(0)}</span>
            <span style={{ fontSize: '0.85rem' }}>{t('mealsCards.unitKcal')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>{totals.proteins.toFixed(1)}g</span>
            <span style={{ fontSize: '0.85rem' }}>{t('mealsCards.labelProtein')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>{totals.fats.toFixed(1)}g</span>
            <span style={{ fontSize: '0.85rem' }}>{t('mealsCards.labelFat')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>{totals.carbs.toFixed(1)}g</span>
            <span style={{ fontSize: '0.85rem' }}>{t('mealsCards.labelCarbs')}</span>
          </div>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className={`${styles.statusMessageContainer} ${styles.noMealsMessage}`} style={{ padding: '20px', textAlign: 'center' }}>
          <FontAwesomeIcon icon={faLeaf} size="3x" style={{ marginBottom: '15px', color: '#ccc'}} />
          <h3>{t('mealsCards.noMeals')}</h3>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          overflowX: 'auto', 
          gap: '16px', 
          paddingBottom: '15px',
          marginBottom: '20px'
        }}>
          {meals.map((meal) => (
            <div key={meal.meal_id} className={styles.mealCard} style={{ minWidth: '280px', flexShrink: 0 }}>
              <h3 className={styles.mealType} style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>
                {meal.meal_type?.toUpperCase() || t('mealsCards.mealFallback')}
              </h3>
              <p className={styles.mealDateTime}>
                <strong>{t('mealsCards.labelTime')}</strong> {new Date(meal.meal_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className={styles.mealCalories}>
                <strong>{t('mealsCards.labelTotalCalories')}</strong> {meal.total_calories != null ? `${parseFloat(meal.total_calories).toFixed(1)} ${t('mealsCards.unitKcal')}` : t('mealsCards.na')}
              </p>
              <button className={styles.viewMealButton} onClick={() => navigate(`/meals/${meal.meal_id}`)}>
                {t('mealsCards.btnViewDetails')}
              </button>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => navigate('/meal-history')}
        className={styles.viewMealButton}
        style={{ 
          backgroundColor: '#8b9bb4',
          color: 'white',
          border: 'none',
          padding: '12px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          borderRadius: '8px'
        }}
      >
        {t('mealsCards.btnViewHistory')}
      </button>

    </div>
  );
};

export default MealsCards;