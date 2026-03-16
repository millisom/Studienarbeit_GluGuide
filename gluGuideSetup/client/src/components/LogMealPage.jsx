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

  // State for meal details
  const [mealType, setMealType] = useState('Breakfast');
  const [mealTime, setMealTime] = useState(new Date().toISOString().slice(0, 16));
  const [items, setItems] = useState([]); // For individual food items
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Handlers for adding/removing food items
  const addFoodItem = (item) => {
    setItems((prev) => [...prev, item]);
  };

  const removeFoodItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for recipes
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const removeRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus('You must be logged in to log a meal.');
      return;
    }

    if (items.length === 0 && !selectedRecipe) {
      setStatus('Please add at least one food item or a recipe.');
      return;
    }

    setIsSaving(true);
    setStatus('');

    try {
      const payload = {
        user_id: user.id || user.userId,
        meal_type: mealType,
        meal_time: mealTime,
        items: items, // Array of food items with quantity_in_grams
        recipe_id: selectedRecipe ? selectedRecipe.id : null,
      };

      await createMeal(payload);
      setStatus('Meal logged successfully!');
      
      // Redirect to the meals list after a short delay
      setTimeout(() => navigate('/meals'), 1500);
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      setStatus('Failed to log meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Log Your Meal</h2>
        <p>Please log in to track your nutrition.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Log a New Meal</h1>

      <form onSubmit={handleSubmit} className={styles.mealForm}>
        <div className={styles.inputGroup}>
          <label>Meal Type</label>
          <select 
            value={mealType} 
            onChange={(e) => setMealType(e.target.value)}
            className={styles.input}
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Date & Time</label>
          <input
            type="datetime-local"
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.selectorsSection}>
          <div className={styles.selectorItem}>
            <h3>Add Individual Foods</h3>
            <SearchFoodItem onAdd={addFoodItem} />
          </div>

          <div className={styles.selectorItem}>
            <h3>Add from Your Recipes</h3>
            <RecipeSelector onSelect={handleSelectRecipe} />
          </div>
        </div>

        <MealPreview 
          items={items} 
          selectedRecipe={selectedRecipe} 
          onRemove={removeFoodItem} 
          onRemoveRecipe={removeRecipe} 
        />

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSaving}
        >
          {isSaving ? 'Logging...' : 'Log Meal'}
        </button>
      </form>

      {status && (
        <p className={status.includes('Failed') ? styles.errorMessage : styles.status}>
          {status}
        </p>
      )}
    </div>
  );
};

export default LogMealPage;