import { useEffect, useState } from 'react';
import { getAllMealsForUser } from '../api/mealApi';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/MealsCards.module.css';
import { useAuth } from '../context/AuthContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAppleAlt,
  faDrumstickBite,
  faBreadSlice,
  faLeaf,
  faMugHot,
  faQuestionCircle,
  faUtensils,
  faHistory 
} from '@fortawesome/free-solid-svg-icons';

const MealsCards = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getMealIcon = (mealType) => {
    const type = mealType?.toLowerCase() || '';
    if (type.includes('breakfast')) return faMugHot;
    if (type.includes('lunch')) return faDrumstickBite;
    if (type.includes('dinner')) return faBreadSlice;
    if (type.includes('snack')) return faAppleAlt;
    return faQuestionCircle;
  };

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
        
        // --- NEW LOGIC: Filter for TODAY and Sort Early to Late ---
        const todayStr = new Date().toLocaleDateString('en-CA');
        
        const todaysMeals = data.filter(meal => {
          if (!meal.meal_time) return false;
          return new Date(meal.meal_time).toLocaleDateString('en-CA') === todayStr;
        });

        todaysMeals.sort((a, b) => new Date(a.meal_time) - new Date(b.meal_time));
        
        setMeals(todaysMeals);
        // ---------------------------------------------------------
        
      } catch (error) {
        console.error('Failed to fetch meals:', error);
        setError('Failed to load meals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user]); 


  if (!user) {
      return (
        <div className={styles.statusMessageContainer}>
            <FontAwesomeIcon icon={faUtensils} size="3x" style={{ marginBottom: '15px', color: '#ccc'}} />
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your meal history.</p>
            <Link to="/login" style={{ marginTop: '10px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                Go to Login
            </Link>
        </div>
      );
  }

  if (loading) {
    return (
        <div className={styles.statusMessageContainer}>
            <h2>Loading today's meals...</h2>
        </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.statusMessageContainer} ${styles.errorMessage}`}>
        <h2>Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
  
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {meals.length === 0 ? (
        <div className={`${styles.statusMessageContainer} ${styles.noMealsMessage}`} style={{ padding: '20px', textAlign: 'center' }}>
          <FontAwesomeIcon icon={faLeaf} size="3x" style={{ marginBottom: '15px', color: '#ccc'}} />
          <h3>No Meals Logged Today</h3>
          <p style={{ color: '#666' }}>Time to log your first one!</p>
        </div>
      ) : (
        <div className={styles.mealsGrid}>
          {meals.map((meal) => (
            <div key={meal.meal_id} className={styles.mealCard}>
              <h3 className={styles.mealType}>
                <FontAwesomeIcon icon={getMealIcon(meal.meal_type)} /> 
                {meal.meal_type?.toUpperCase() || 'MEAL'}
              </h3>
              <p className={styles.mealDateTime}>
                <strong>Time:</strong>{' '}
                {new Date(meal.meal_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
              <p className={styles.mealCalories}>
                <strong>Total Calories:</strong> {meal.total_calories != null ? `${parseFloat(meal.total_calories).toFixed(1)} kcal` : 'N/A'}
              </p>
              <button
                className={styles.viewMealButton}
                onClick={() => navigate(`/meals/${meal.meal_id}`)}
              >
                View Meal Details
              </button>
            </div>
          ))}
        </div>
      )}


      <button 
        onClick={() => navigate('/meal-history')}
        className={styles.viewMealButton}
        style={{ 
          marginTop: '20px', 
          backgroundColor: '#6c757d',
          border: 'none',
          padding: '12px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <FontAwesomeIcon icon={faHistory} />
        View Full Meal History
      </button>

    </div>
  );
};

export default MealsCards;