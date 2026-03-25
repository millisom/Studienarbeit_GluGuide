import { useState, useEffect } from 'react';
import { getFoodItemByName } from '../api/foodItemApi';
import FoodItem from './FoodItem';
import searchStyles from '../styles/SearchFoodItem.module.css'; // Keep for modal/dropdown
import styles from '../styles/LogMealPage.module.css'; // Import for unified inputs
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const SearchFoodItem = ({ onAdd }) => {
  const { user, loading: authLoading } = useAuth(); 
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [skipSuggestions, setSkipSuggestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {

      if (skipSuggestions || query.length < 2 || !user) {
        setSuggestions([]);
        return;
      }

      setError('');
      try {
        const response = await getFoodItemByName(query.toLowerCase());
        const foodArray = Array.isArray(response) ? response : [response];

        const sorted = foodArray.sort((a, b) => {
          const aMatch = a.name.toLowerCase().startsWith(query.toLowerCase());
          const bMatch = b.name.toLowerCase().startsWith(query.toLowerCase());
          return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
        });

        if (sorted.length === 0) {
            setError('No food items found matching your query.');
        }
        setSuggestions(sorted);
      } catch (err) {
        console.error('Suggestion fetch failed:', err);
        setError('Could not load suggestions. Please try again.');
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, skipSuggestions, user]);

  const handleSuggestionClick = (food) => {
    setSelectedFood(food);
    setSkipSuggestions(true);
    setQuery(food.name);
    setSuggestions([]);
    setError('');
  };

  const handleCloseModal = () => {
    setSelectedFood(null);
    setSkipSuggestions(false);
  };

  return (
    // 1. Used the unified inputGroup wrapper so it takes up the full width evenly
    <div className={styles.inputGroup}>
      
      {/* Added position relative so the dropdown suggestions list anchors to this input properly */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={user ? "Search food item..." : "Log in to search food..."}
          value={query}
          disabled={!user || authLoading} 
          onChange={(e) => {
            setQuery(e.target.value);
            setSkipSuggestions(false);
            setError('');
            if (e.target.value === '') {
              setSelectedFood(null);
              setSuggestions([]);
            }
          }}
          // 2. Used the unified input class for identical styling
          className={styles.input}
        />
        {suggestions.length > 0 && (
          <ul className={searchStyles.suggestions}>
            {suggestions.map((food, idx) => (
              <li key={food.food_id || `${food.name}-${idx}`} onClick={() => handleSuggestionClick(food)}>
                {food.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && !selectedFood && <p className={searchStyles.searchError}>{error}</p>}

      {/* MODAL KEEPS ITS ORIGINAL STYLES */}
      {selectedFood && (
        <div className={searchStyles.modalOverlay}>
          <div className={searchStyles.modalContent}>
            <button 
              className={searchStyles.closeButton} 
              onClick={handleCloseModal}
              aria-label="Close food details"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <FoodItem food={selectedFood} onAdd={(item) => {
              onAdd(item);
              handleCloseModal();
              setQuery('');
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

SearchFoodItem.propTypes = {
  onAdd: PropTypes.func.isRequired
};

export default SearchFoodItem;