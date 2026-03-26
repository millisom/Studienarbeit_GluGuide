import { useState, useEffect } from 'react';
import FoodItemInput from '../components/FoodItemInput';
import RecipeSelector from '../components/RecipeSelector';
import MealPreview from '../components/MealPreview';
import { createMeal, recalculateMealNutrition, getAllMealsForUser } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LogMealPage.module.css';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const LogMealPage = ({ onMealLogged }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.userId;

  const [mealType, setMealType] = useState('');
  const [mealTime, setMealTime] = useState(new Date().toISOString().slice(0, 16));
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
        console.error("Failed to fetch past meals to calculate snack number:", err);
      }
    };

    fetchSnackCount();
  }, [mealType, userId]);

  const addFoodItem = (item) => setFoodItems((prev) => [...prev, item]);
  const removeFoodItem = (index) => setFoodItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!mealType) return setStatus('Please select a meal type');
    if (foodItems.length === 0 && !selectedRecipe) return setStatus('Please add food or a recipe');

    setIsSaving(true);
    setStatus('');

    try {
      const payload = {
        meal_type: mealType,
        meal_time: new Date(mealTime).toISOString(),
        notes, 
        items: foodItems, 
        recipe_id: selectedRecipe?.id || null,
        quantity: Number(selectedRecipe?.quantity || 1),
        request_reminder: requestReminder
      };

      const meal = await createMeal(payload);
      await recalculateMealNutrition(meal.meal_id); 

      setStatus('Meal saved successfully!');
      
      if (requestReminder) {
         scheduleLocalReminder(meal.meal_id, mealTime, mealType);
      }

      // Reset form
      setMealType('');
      setNotes('');
      setFoodItems([]);
      setSelectedRecipe(null);
      setRequestReminder(false);
      setMealTime(new Date().toISOString().slice(0, 16));

      // Trigger refresh in MealsOverviewPage
      if (onMealLogged) onMealLogged();

      setTimeout(() => setStatus(''), 3000);
      
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      setStatus('Error saving meal');
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleLocalReminder = (mealId, timeString, type) => {
    const mealTimeMs = new Date(timeString).getTime();
    const oneHourLater = mealTimeMs + (60 * 60 * 1000);
    const delay = oneHourLater - Date.now();

    if (delay > 0) {
      setTimeout(() => alert(`Reminder: It has been 1 hour since your ${type === 'snack' ? 'Snack' : type}! Time to log your glucose.`), delay);
    } else {
       console.log("Meal time was too far in the past to set a 1-hour reminder.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.mealForm}>
        
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Meal Type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={styles.input} required>
              <option value="" disabled>Select Meal Type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">{mealType === 'snack' ? `Snack ${snackCount}` : 'Snack'}</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Time Eaten</label>
            <input type="datetime-local" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className={styles.input} required />
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <input type="checkbox" id="reminderCheck" checked={requestReminder} onChange={(e) => setRequestReminder(e.target.checked)} className={styles.checkbox} />
          <label htmlFor="reminderCheck" className={styles.checkboxLabel}>Remind me to test my glucose in 1 hour</label>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Notes</label>
          <div className={styles.quillWrapper}>
            <ReactQuill theme="snow" value={notes} onChange={setNotes} placeholder="How are you feeling? Any symptoms?" />
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
          {isSaving ? 'Saving...' : 'Save Meal'}
        </button>
      </form>

      {status && (
        <p className={status.includes('Error') ? styles.errorMessage : styles.status} style={{ marginTop: '15px' }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default LogMealPage;