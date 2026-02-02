import React from 'react';
import { useParams } from 'react-router-dom';
import MealCard from './MealCard';

const MealCardRoute = () => {
  const { mealId } = useParams();

  return <MealCard mealId={mealId} />;
};

export default MealCardRoute;
