import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SearchFoodItem from './SearchFoodItem';
import IngredientList from './IngedientsList';
import RecipeInstructionsInput from './RecipeInstructionsInput';
import { createRecipe, updateRecipe, getRecipeById } from '../api/recipeApi';
import styles from '../styles/LogMealPage.module.css';
import { useAuth } from '../context/AuthContext';
import { useTranslation, Trans } from 'react-i18next';

const RecipeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const isEditMode = Boolean(routeId);
  const { t } = useTranslation();

  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // UC-07: Im Edit-Mode bestehendes Rezept laden; Backend verweigert fremde Rezepte (403)
  useEffect(() => {
    if (!isEditMode || !user) return;

    const loadRecipe = async () => {
      try {
        const data = await getRecipeById(routeId);
        setRecipeName(data.name || '');
        setIngredients(Array.isArray(data.ingredients) ? data.ingredients : []);
        setInstructions(Array.isArray(data.instructions) ? data.instructions : []);
      } catch (err) {
        console.error('Failed to load recipe for edit:', err);
        if (err.response?.status === 403) {
          setStatus(t('recipeDashboard.errorForbidden'));
        } else {
          setStatus(t('recipeDashboard.errorLoad'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [isEditMode, routeId, user, t]);

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
      setStatus(t('recipeDashboard.errorAuth'));
      return;
    }

    if (!recipeName.trim()) return setStatus(t('recipeDashboard.errorName'));
    if (ingredients.length === 0) return setStatus(t('recipeDashboard.errorIngredients'));
    if (instructions.length === 0) return setStatus(t('recipeDashboard.errorInstructions'));

    setIsSaving(true);
    setStatus('');

    try {
      const payload = {
        name: recipeName,
        ingredients,
        instructions,
      };

      if (isEditMode) {
        await updateRecipe(routeId, payload);
        setStatus(t('recipeDashboard.successUpdate'));
        setTimeout(() => navigate(`/recipes/${routeId}`), 1000);
      } else {
        const newRecipe = await createRecipe(payload);
        setStatus(t('recipeDashboard.success'));
        setRecipeName('');
        setIngredients([]);
        setInstructions([]);
        if (newRecipe?.id) {
          setTimeout(() => navigate(`/recipes/${newRecipe.id}`), 1000);
        }
      }
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        setStatus(t('recipeDashboard.errorForbidden'));
      } else {
        setStatus(t('recipeDashboard.errorFailed'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('recipeDashboard.title')}</h1>
        <p style={{ textAlign: 'center' }}>
          <Trans i18nKey="recipeDashboard.loginPrompt">
            Please <Link to="/login" style={{ color: 'var(--color-primary)' }}>log in</Link> to create and save your own recipes.
          </Trans>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('recipeDashboard.titleEdit')}</h1>
        <p>{t('recipeDashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isEditMode ? t('recipeDashboard.titleEdit') : t('recipeDashboard.title')}
      </h1>

      <div className={styles.mealForm}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="recipeName">
            {t('recipeDashboard.placeholderName')}
          </label>
          <input
            id="recipeName"
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder={t('recipeDashboard.placeholderName')}
            className={styles.input}
          />
        </div>

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
          {isSaving
            ? t('recipeDashboard.btnSaving')
            : isEditMode
              ? t('recipeDashboard.btnUpdate')
              : t('recipeDashboard.btnSave')}
        </button>

        {status && (
          <p className={status.includes(t('recipeDashboard.errorFailed')) ? styles.errorMessage : styles.status}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecipeDashboard;