import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getFoodItemByName } from '../api/foodItemApi';
import FoodItem from './FoodItem';
import searchStyles from '../styles/SearchFoodItem.module.css'; 
import styles from '../styles/LogMealPage.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SearchFoodItem = ({ onAdd }) => {
  const { user, loading: authLoading } = useAuth(); 
  const { t } = useTranslation();
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
            setError(t('searchFoodItem.noResults'));
        }
        setSuggestions(sorted);
      } catch (err) {
        console.error('Suggestion fetch failed:', err);
        setError(t('searchFoodItem.errorLoad'));
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, skipSuggestions, user, t]);

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
    <div className={styles.inputGroup}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={user ? t('searchFoodItem.placeholder') : t('searchFoodItem.loginPlaceholder')}
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

      {selectedFood && (
        <div className={searchStyles.modalOverlay}>
          <div className={searchStyles.modalContent}>
            <button 
              className={searchStyles.closeButton} 
              onClick={handleCloseModal}
              aria-label={t('searchFoodItem.ariaClose')}
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