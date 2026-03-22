import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getRecipeById, getRecipeByName } from '../api/recipeApi';
import styles from '../styles/RecipeSelector.module.css';
import RecipeItem from './RecipeItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const RecipeSelector = ({ onSelect }) => {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [skipSuggestions, setSkipSuggestions] = useState(false);
  const [error, setError] = useState('');
  
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (skipSuggestions || query.length < 2 || authLoading) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await getRecipeByName(query.toLowerCase());
        const recipeArray = Array.isArray(data) ? data : [data];
        const filtered = recipeArray.filter(recipe =>
          recipe.name.toLowerCase().includes(query.toLowerCase())
        );
        const sorted = filtered.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
          return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
        });
        setSuggestions(sorted);
      } catch (err) {
        console.error('Failed to load recipe suggestions', err);
        if (user) setError('Could not load suggestions');
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, skipSuggestions, authLoading, user]);

  const handleSelect = async (recipe) => {
    if (!user) {
        setError('Please log in to view recipe details.');
        setSuggestions([]);
        return;
    }
    setSkipSuggestions(true);
    setQuery(recipe.name);
    setSuggestions([]);
    try {
      const fullRecipe = await getRecipeById(recipe.id);
      setSelectedRecipe(fullRecipe);
      setQuantity(1); 
    } catch (err) {
      console.error('Failed to load recipe details', err);
      setSelectedRecipe(null);
      setError('Failed to load recipe details.');
    }
  };

  const handleAddWithQuantity = (recipe) => {
    // BUG CATCHER: Force it to be a pure number before sending to LogMealPage
    const finalQ = Number(quantity) || 1;
    console.log("🛒 [1] RecipeSelector is passing quantity:", finalQ);
    
    onSelect({ ...recipe, quantity: finalQ });
    setSelectedRecipe(null);
    setQuery('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder={user ? "Search recipe..." : "Log in to search recipes"}
          value={query}
          disabled={!user && !authLoading}
          onChange={(e) => {
            setSkipSuggestions(false);
            setQuery(e.target.value);
            setError('');
            if (e.target.value.length === 0) {
              setSelectedRecipe(null);
              setSuggestions([]);
            }
          }}
          className={styles.searchInput}
        />
        {suggestions.length > 0 && (
          <ul className={styles.suggestions}>
            {suggestions.map((recipe, index) => (
              <li
                key={recipe.id || `${recipe.name}-${index}`}
                onClick={() => handleSelect(recipe)}
              >
                {recipe.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {selectedRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setSelectedRecipe(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div style={{ backgroundColor: '#f8fbff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #d0e3ff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#0056b3' }}>Portion Size:</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.1"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} // Just store what they type
                style={{ width: '80px', padding: '5px', textAlign: 'center', border: '2px solid #007bff', borderRadius: '5px', fontSize: '1.1rem' }}
              />
            </div>

            <RecipeItem
              recipe={selectedRecipe}
              quantity={Number(quantity) || 1} 
              onAdd={() => handleAddWithQuantity(selectedRecipe)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

RecipeSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default RecipeSelector;