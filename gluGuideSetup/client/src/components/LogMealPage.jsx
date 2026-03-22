import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchFoodItem from '../components/SearchFoodItem';
import RecipeSelector from '../components/RecipeSelector';
import MealPreview from '../components/MealPreview';
import { createMeal } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LogMealPage.module.css';

const LogMealPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mealType, setMealType] = useState('Breakfast');
  const [mealTime, setMealTime] = useState(new Date().toISOString().slice(0, 16));
  const [items, setItems] = useState([]); 
  
  // This single state holds the recipe AND its portion quantity
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addFoodItem = (item) => setItems((prev) => [...prev, item]);
  const removeFoodItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSelectRecipe = (recipeData) => {
    // We expect recipeData to be: { id: 11, name: "Oatmeal", quantity: 2, ... }
    console.log("📥 [2] LogMealPage received recipe data:", recipeData);
    setSelectedRecipe(recipeData);
  };

  const removeRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setStatus('You must be logged in to log a meal.');
    if (items.length === 0 && !selectedRecipe) return setStatus('Please add at least one food item or a recipe.');

    setIsSaving(true);
    setStatus('');

    try {
      // 🚨 CRITICAL FIX: Pull quantity directly from the object stored in state.
      // Do NOT use a separate state variable. If the object doesn't have it, default to 1.
      const finalMultiplier = selectedRecipe?.quantity ? Number(selectedRecipe.quantity) : 1;

      const payload = {
        user_id: user.id || user.userId,
        meal_type: mealType,
        meal_time: mealTime,
        items: items, 
        recipe_id: selectedRecipe ? selectedRecipe.id : null,
        // Match the backend property EXACTLY
        quantity: finalMultiplier, 
      };

      console.log("🚀 [3] PAYLOAD LEAVING BROWSER:", payload);

      await createMeal(payload);
      setStatus('Meal logged successfully!');
      setTimeout(() => navigate('/meals'), 1500);
    } catch (err) {
      console.error('Save error:', err);
      setStatus('Failed to log meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (<div className={styles.container}><h2>Log Your Meal</h2><p>Please log in.</p></div>);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Log a New Meal</h1>
      <form onSubmit={handleSubmit} className={styles.mealForm}>
        <div className={styles.inputGroup}>
          <label>Meal Type</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={styles.input}>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Date & Time</label>
          <input type="datetime-local" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.selectorsSection}>
          <div className={styles.selectorItem}><h3>Add Individual Foods</h3><SearchFoodItem onAdd={addFoodItem} /></div>
          <div className={styles.selectorItem}><h3>Add from Your Recipes</h3><RecipeSelector onSelect={handleSelectRecipe} /></div>
        </div>

        <MealPreview 
          items={items} 
          selectedRecipe={selectedRecipe} 
          // Extract the quantity for the preview to use
          recipeQuantity={selectedRecipe?.quantity ? Number(selectedRecipe.quantity) : 1} 
          onRemove={removeFoodItem} 
          onRemoveRecipe={removeRecipe} 
        />

        <button type="submit" className={styles.submitButton} disabled={isSaving}>
          {isSaving ? 'Logging...' : 'Log Meal'}
        </button>
      </form>
      {status && <p className={status.includes('Failed') ? styles.errorMessage : styles.status}>{status}</p>}
    </div>
  );
};

export default LogMealPage;