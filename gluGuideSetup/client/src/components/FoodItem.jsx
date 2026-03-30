import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/FoodItem.module.css';
import { useTranslation } from 'react-i18next';

const FoodItem = ({ food, onAdd }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    const qty = parseInt(quantity);
    if (!isNaN(qty) && qty > 0) {
      const foodWithQuantity = {
        ...food,
        quantity_in_grams: qty,
      };
      onAdd(foodWithQuantity);
      setQuantity(''); 
    } else {
      alert(t('foodItem.errorInvalid'));
    }
  };

  return (
    <div className={styles.foodItemContainer}>
      <div className={styles.header}>
        <h1 className={styles.foodItemTitle}>{food.name}</h1>
        <h2 className={styles.foodItemTitle2}>{t('foodItem.serving')}</h2>
      </div>
      <div className={styles.line}></div>
      <div className={styles.macros}>
        <p>{t('foodItem.calories')} {food.calories} kcal</p>
        <p>{t('foodItem.carbs')} {food.carbs}g</p>
        <p>{t('foodItem.protein')} {food.proteins}g</p>
        <p>{t('foodItem.fat')} {food.fats}g</p>
      </div>
      <div className={styles.quantityRow}>
        <input
          type="number"
          min="1"
          placeholder={t('foodItem.placeholder')}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={styles.quantityInput}
        />
        <button className={styles.addButtonStyled} onClick={handleAdd}>+</button>
      </div>
    </div>
  );
};

FoodItem.propTypes = {
  food: PropTypes.shape({
    name: PropTypes.string.isRequired,
    calories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    carbs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    proteins: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onAdd: PropTypes.func.isRequired
};

export default FoodItem;