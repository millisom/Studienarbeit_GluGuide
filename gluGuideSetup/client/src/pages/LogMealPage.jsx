import { useState, useEffect } from 'react';
import FoodItemInput from '../components/FoodItemInput';
import RecipeSelector from '../components/RecipeSelector';
import MealPreview from '../components/MealPreview';
import { createMeal, recalculateMealNutrition, getAllMealsForUser } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LogMealPage.module.css';
import axiosInstance from '../api/axiosConfig';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';

const getLocalDatetimeString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; 
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

const LogMealPage = ({ onMealLogged }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.id || user?.userId;

  const [mealType, setMealType] = useState('');
  const [mealTime, setMealTime] = useState(getLocalDatetimeString());
  const [snackCount, setSnackCount] = useState(1);
  const [requestReminder, setRequestReminder] = useState(false);
  const [notes, setNotes] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSnackCount = async () => {
      if (mealType !== 'snack' || !userId) return;

      try {
        const allMeals = await getAllMealsForUser(userId);
        const todayStr = new Date().toLocaleDateString('en-CA');
        
        let count = 1;
        allMeals.forEach(meal => {
          if (!meal.meal_time) return;
          const mealDateStr = new Date(meal.meal_time).toLocaleDateString('en-CA');
          
          if (mealDateStr === todayStr && meal.meal_type === 'snack') {
            count++;
          }
        });
        
        setSnackCount(count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSnackCount();
  }, [mealType, userId]);

  const addFoodItem = (item) => setFoodItems((prev) => [...prev, item]);
  const removeFoodItem = (index) => setFoodItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!mealType) return setStatus(t('logMeal.errorNoType'));
    if (foodItems.length === 0 && !selectedRecipe) return setStatus(t('logMeal.errorNoFood'));

    setIsSaving(true);
    setStatus('');

    try {
      const payload = {
        meal_type: mealType,
        meal_time: mealTime, 
        notes, 
        items: foodItems, 
        recipe_id: selectedRecipe?.id || null,
        quantity: Number(selectedRecipe?.quantity || 1),
        request_reminder: requestReminder
      };

      const meal = await createMeal(payload);
      await recalculateMealNutrition(meal.meal_id); 

      setStatus(t('logMeal.success'));
      
      if (requestReminder) {
         scheduleLocalReminder(meal.meal_id, mealTime, mealType);
      }

      setMealType('');
      setNotes('');
      setFoodItems([]);
      setSelectedRecipe(null);
      setRequestReminder(false);
      setMealTime(getLocalDatetimeString());

      if (onMealLogged) onMealLogged();

      setTimeout(() => setStatus(''), 3000);
      
    } catch (err) {
      console.error(err);
      setStatus(t('logMeal.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleLocalReminder = async (mealId, timeString, type) => {
    const mealTimeMs = new Date(timeString).getTime();
    const oneHourLater = new Date(mealTimeMs + (60 * 60 * 1000));
    
    if (oneHourLater.getTime() > Date.now()) {
      try {
        await axiosInstance.post('/alerts', {
          userId: userId,
          reminderFrequency: 'once', 
          reminderTime: oneHourLater.toISOString(),
          notificationMethod: 'app' 
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.mealForm}>
        
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('logMeal.labelMealType')}</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={styles.input} required>
              <option value="" disabled>{t('logMeal.placeholderSelect')}</option>
              <option value="breakfast">{t('logMeal.breakfast')}</option>
              <option value="lunch">{t('logMeal.lunch')}</option>
              <option value="dinner">{t('logMeal.dinner')}</option>
              <option value="snack">
                {mealType === 'snack' 
                  ? t('logMeal.snackNumbered', { count: snackCount }) 
                  : t('logMeal.snack')}
              </option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('logMeal.labelTimeEaten')}</label>
            <input type="datetime-local" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className={styles.input} required />
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <input type="checkbox" id="reminderCheck" checked={requestReminder} onChange={(e) => setRequestReminder(e.target.checked)} className={styles.checkbox} />
          <label htmlFor="reminderCheck" className={styles.checkboxLabel}>{t('logMeal.labelReminder')}</label>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t('logMeal.labelNotes')}</label>
          <div className={styles.quillWrapper}>
            <ReactQuill theme="snow" value={notes} onChange={setNotes} placeholder={t('logMeal.placeholderNotes')} />
          </div>
        </div>

        <div className={styles.selectorsSection}>
          <RecipeSelector onSelect={setSelectedRecipe} />
          <FoodItemInput onAdd={addFoodItem} />
        </div>

        {(foodItems.length > 0 || selectedRecipe) && (
          <div className={styles.previewSection}>
            <MealPreview
              items={foodItems} selectedRecipe={selectedRecipe} recipeQuantity={Number(selectedRecipe?.quantity || 1)}
              onRemove={removeFoodItem} onEdit={() => {}} onEditRecipe={() => {}} onRemoveRecipe={() => setSelectedRecipe(null)}
            />
          </div>
        )}

        <button type="submit" className={styles.submitButton} disabled={isSaving}>
          {isSaving ? t('logMeal.btnSaving') : t('logMeal.btnSave')}
        </button>
      </form>

      {status && (
        <p className={status.includes(t('logMeal.errorSave')) ? styles.errorMessage : styles.status} style={{ marginTop: '15px' }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default LogMealPage;