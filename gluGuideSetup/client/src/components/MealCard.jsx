import { useEffect, useState } from 'react';
import { getMealById, deleteMeal, updateMeal } from '../api/mealApi'; 
import styles from '../styles/MealCard.module.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
             name: item.name || item.food_name || t('mealCard.unknownItem'),
             quantity_in_grams: Number(item.quantity_in_grams)
           }));
        }
        setConsolidatedItems(allItems);

      } catch (err) {
        console.error('Failed to fetch meal:', err);
        setMeal(null);
        setError(t('mealCard.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (mealId) {
      fetchMeal();
    }
  }, [mealId, t]);

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = window.confirm(t('mealCard.confirmDelete'));
    if (!confirmed) return;

    try {
      await deleteMeal(mealId);
      setSuccessMessage(t('mealCard.deleteSuccess'));
      setTimeout(() => {
        navigate('/meals');
      }, 1500);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError(t('mealCard.deleteError'));
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
      
      setSuccessMessage(t('mealCard.updateSuccess'));
      
      const freshData = await getMealById(mealId);
      setMeal(freshData);
      
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Failed to update meal:", err);
      setError(t('mealCard.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className={`${styles.statusMessage} ${styles.loadingMessage}`}>{t('mealCard.loading')}</div>;
  
  if (successMessage && successMessage.includes('Redirecting')) {
    return <div className={`${styles.statusMessage} ${styles.successMessage}`}>{successMessage}</div>;
  }
  
  if (error && !meal) return <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error || t('mealCard.notFound')}</div>;

  return (
    <div className={styles.mealDetailContainer}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {isEditing ? (
           <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={handleSaveEdit} className={styles.editButton} disabled={isSaving} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
               <FontAwesomeIcon icon={faSave} /> {isSaving ? t('mealCard.btnSaving') : t('mealCard.btnSave')}
             </button>
             <button onClick={() => setIsEditing(false)} className={styles.editButton} style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
               <FontAwesomeIcon icon={faTimes} /> {t('mealCard.btnCancel')}
             </button>
           </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className={styles.editButton} style={{ backgroundColor: '#0056b3', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faEdit} /> {t('mealCard.btnEdit')}
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
          {meal.meal_type?.toUpperCase() || t('mealCard.titleFallback')}
        </h2>
        
        <div className={styles.mealTimeInfo}>
          {isEditing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <strong>{t('mealCard.labelTimeEaten')}</strong> 
              <input 
                type="datetime-local" 
                value={editTime} 
                onChange={(e) => setEditTime(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </span>
          ) : (
            <>
              <strong>{t('mealCard.labelLoggedOn')}</strong> {new Date(meal.meal_time).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              <br />
              <strong>{t('mealCard.labelTime')}</strong> {new Date(meal.meal_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
            </>
          )}
        </div>
      </div>

      {meal.notes && (
        <div className={styles.mealSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />{t('mealCard.notes')}
          </h3>
          <div className={styles.notesText} dangerouslySetInnerHTML={{ __html: meal.notes }} />
        </div>
      )}

      <div className={styles.mealSection}>
        <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBalanceScale} style={{ marginRight: '8px' }} />{t('mealCard.nutritionalSummary')}
        </h3>
        <div className={styles.nutritionGrid}>
          <p><strong>{t('mealCard.calories')}</strong> {meal.total_calories != null ? `${parseFloat(meal.total_calories).toFixed(1)} kcal` : t('mealCard.na')}</p>
          <p><strong>{t('mealCard.proteins')}</strong> {meal.total_proteins != null ? `${parseFloat(meal.total_proteins).toFixed(1)} g` : t('mealCard.na')}</p>
          <p><strong>{t('mealCard.fats')}</strong> {meal.total_fats != null ? `${parseFloat(meal.total_fats).toFixed(1)} g` : t('mealCard.na')}</p>
          <p><strong>{t('mealCard.carbs')}</strong> {meal.total_carbs != null ? `${parseFloat(meal.total_carbs).toFixed(1)} g` : t('mealCard.na')}</p>
        </div>
      </div>

      <div className={styles.mealSection}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faListOl} style={{ marginRight: '8px' }} />{t('mealCard.ingredients')}
        </h3>
        
        {meal.recipe_snapshot && meal.recipe_snapshot.name && !isEditing && (
           <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>
             <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '5px' }} />
             {t('mealCard.baseRecipe', { name: meal.recipe_snapshot.name })}
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
                <span>{item.quantity_in_grams != null ? `${parseFloat(item.quantity_in_grams).toFixed(1)}g` : t('mealCard.na')}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {user && !isEditing && (
        <div className={styles.deleteButtonContainer} style={{ marginTop: '20px' }}>
            <button onClick={handleDelete} className={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrashAlt} /> {t('mealCard.btnDelete')}
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