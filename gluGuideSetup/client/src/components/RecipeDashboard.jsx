import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchFoodItem from './SearchFoodItem';
import IngredientList from './IngedientsList';
import RecipeInstructionsInput from './RecipeInstructionsInput';
import { createRecipe } from '../api/recipeApi';
import styles from '../styles/LogMealPage.module.css';
import { useAuth } from '../context/AuthContext';

const RecipeDashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addIngredient = (item) => {
    setIngredients((prev) => [...prev, item]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInstructions = (newInstructions) => {
    setInstructions(newInstructions);
  };

  const handleSubmit = async () => {

    if (!user) {
        setStatus('You must be logged in to save a recipe.');
        return;
    }

    if (!recipeName.trim()) return setStatus('Please enter a recipe name');
    if (ingredients.length === 0) return setStatus('Please add at least one ingredient');
    if (instructions.length === 0) return setStatus('Please add instructions');

    setIsSaving(true);
    setStatus('');

    try {
      const payload = {
        user_id: user.id || user.userId, 
        name: recipeName,
        ingredients,
        instructions,
      };

      const newRecipe = await createRecipe(payload);

      setStatus('Recipe created successfully!');
      setRecipeName('');
      setIngredients([]);
      setInstructions([]);

  
      if (newRecipe?.id) {
        setTimeout(() => {
            navigate(`/recipes/${newRecipe.id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      setStatus('Failed to create recipe');
    } finally {
        setIsSaving(false);
    }
  };


  if (!user) {
    return (
        <div className={styles.container} style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Create Your Recipe</h2>
            <p>Please <Link to="/login" style={{ color: 'blue' }}>log in</Link> to create and save your own recipes.</p>
        </div>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Create Your Recipe</h1>

      <input
        type="text"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        placeholder="Recipe Name"
        className={styles.input}
      />
      <SearchFoodItem onAdd={addIngredient} />

      {ingredients.length > 0 && (
        <IngredientList ingredients={ingredients} onRemove={removeIngredient} />
      )}

      <RecipeInstructionsInput
        instructions={instructions}
        setInstructions={updateInstructions}
      />

      <button 
        onClick={handleSubmit} 
        className={styles.submitButton}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Recipe'}
      </button>

      {status && (
        <p className={status.startsWith('Failed') ? styles.errorMessage : styles.status}>
            {status}
        </p>
      )}
    </>
  );
};

export default RecipeDashboard;