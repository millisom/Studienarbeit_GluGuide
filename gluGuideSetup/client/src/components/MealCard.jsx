import { useEffect, useState } from 'react';
import { getMealById, deleteMeal, updateMeal } from '../api/mealApi'; //
import styles from '../styles/MealCard.module.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAppleAlt,
  faDrumstickBite,
  faBreadSlice,
  faMugHot,
  faQuestionCircle,
  faTrashAlt,
  faStickyNote,
  faBalanceScale,
  faListOl,
  faBookOpen,
  faEdit,    
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const MealCard = ({ mealId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- NEW EDIT MODE STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTime, setEditTime] = useState('');
  const [consolidatedItems, setConsolidatedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const getMealIcon = (mealType) => {
    const type = mealType?.toLowerCase() || '';
    if (type.includes('breakfast')) return faMugHot;
    if (type.includes('lunch')) return faDrumstickBite;
    if (type.includes('dinner')) return faBreadSlice;
    if (type.includes('snack')) return faAppleAlt;
    return faQuestionCircle;
  };

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMealById(mealId);
        setMeal(data);
        

        if (data.meal_time) {

          const dateObj = new Date(data.meal_time);
          const formattedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setEditTime(formattedDate);
        }


        let allItems = [];
        if (data.items && Array.isArray(data.items)) {
           allItems = data.items.map(item => ({
             food_id: item.food_id,
             name: item.name || item.food_name || 'Unknown Item',
             quantity_in_grams: Number(item.quantity_in_grams)
           }));
        }
        setConsolidatedItems(allItems);

      } catch (err) {
        console.error('Failed to fetch meal:', err);
        setMeal(null);
        setError('Failed to load meal details. Please try again or check the meal ID.');
      } finally {
        setLoading(false);
      }
    };

    if (mealId) {
      fetchMeal();
    }
  }, [mealId]);

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = window.confirm('Are you sure you want to permanently delete this meal? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteMeal(mealId);
      setSuccessMessage('Meal deleted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/meals');
      }, 1500);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }
  };


  const handleIngredientChange = (index, newValue) => {
    const updated = [...consolidatedItems];
    updated[index].quantity_in_grams = Number(newValue) || 0;
    setConsolidatedItems(updated);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const payload = {
        meal_time: new Date(editTime).toISOString(),
        items: consolidatedItems
      };

      await updateMeal(mealId, payload); 
      
      setSuccessMessage('Meal updated successfully!');
      
 
      const freshData = await getMealById(mealId);
      setMeal(freshData);
      
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Failed to update meal:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className={`${styles.statusMessage} ${styles.loadingMessage}`}>Loading meal details...</div>;
  
  if (successMessage && successMessage.includes('Redirecting')) {
    return <div className={`${styles.statusMessage} ${styles.successMessage}`}>{successMessage}</div>;
  }
  
  if (error && !meal) return <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error || 'Meal not found.'}</div>;

  return (
    <div className={styles.mealDetailContainer}>
      

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {isEditing ? (
           <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={handleSaveEdit} className={styles.editButton} disabled={isSaving} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
               <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Saving...' : 'Save Changes'}
             </button>
             <button onClick={() => setIsEditing(false)} className={styles.editButton} style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
               <FontAwesomeIcon icon={faTimes} /> Cancel
             </button>
           </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className={styles.editButton} style={{ backgroundColor: '#0056b3', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faEdit} /> Edit Meal
          </button>
        )}
      </div>

      {successMessage && !successMessage.includes('Redirecting') && (
        <div className={`${styles.statusMessage} ${styles.successMessage}`} style={{ padding: '10px', marginBottom: '15px' }}>
          {successMessage}
        </div>
      )}

      {error && <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error}</div>}

      <div className={styles.mealHeader}>
        <h2 className={styles.mealTypeTitle}>
          <FontAwesomeIcon icon={getMealIcon(meal.meal_type)} />
          {meal.meal_type?.toUpperCase() || 'MEAL DETAILS'}
        </h2>
        
        <p className={styles.mealTimeInfo}>
          {isEditing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <strong>Time Eaten:</strong> 
              <input 
                type="datetime-local" 
                value={editTime} 
                onChange={(e) => setEditTime(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </span>
          ) : (
            <>
              <strong>Logged on:</strong> {new Date(meal.meal_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              <br />
              <strong>Time:</strong> {new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </>
          )}
        </p>
      </div>

      {meal.notes && (
        <div className={styles.mealSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />Notes
          </h3>
          <div className={styles.notesText} dangerouslySetInnerHTML={{ __html: meal.notes }} />
        </div>
      )}

      <div className={styles.mealSection}>
        <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBalanceScale} style={{ marginRight: '8px' }} />Nutritional Summary
        </h3>
        <div className={styles.nutritionGrid}>
          <p><strong>Calories:</strong> {meal.total_calories != null ? `${parseFloat(meal.total_calories).toFixed(1)} kcal` : 'N/A'}</p>
          <p><strong>Proteins:</strong> {meal.total_proteins != null ? `${parseFloat(meal.total_proteins).toFixed(1)} g` : 'N/A'}</p>
          <p><strong>Fats:</strong> {meal.total_fats != null ? `${parseFloat(meal.total_fats).toFixed(1)} g` : 'N/A'}</p>
          <p><strong>Carbs:</strong> {meal.total_carbs != null ? `${parseFloat(meal.total_carbs).toFixed(1)} g` : 'N/A'}</p>
        </div>
      </div>


      <div className={styles.mealSection}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faListOl} style={{ marginRight: '8px' }} />Ingredients
        </h3>
        
        {meal.recipe_snapshot && meal.recipe_snapshot.name && !isEditing && (
           <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>
             <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '5px' }} />
             Base recipe: {meal.recipe_snapshot.name}
           </p>
        )}

        <ul className={styles.itemList}>
          {consolidatedItems.map((item, i) => (
            <li key={`food-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
              <span>{item.name}</span>
              

              {isEditing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="number" 
                    value={item.quantity_in_grams} 
                    onChange={(e) => handleIngredientChange(i, e.target.value)}
                    style={{ width: '80px', padding: '5px', textAlign: 'right', borderRadius: '4px', border: '1px solid #ccc' }}
                    min="0"
                  /> g
                </span>
              ) : (
                <span>{item.quantity_in_grams != null ? `${parseFloat(item.quantity_in_grams).toFixed(1)}g` : 'N/A'}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {user && !isEditing && (
        <div className={styles.deleteButtonContainer} style={{ marginTop: '20px' }}>
            <button onClick={handleDelete} className={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrashAlt} /> Delete Meal
            </button>
        </div>
      )}
    </div>
  );
};

MealCard.propTypes = {
  mealId: PropTypes.string.isRequired
};

export default MealCard;