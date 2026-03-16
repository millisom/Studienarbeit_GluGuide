import { lazy } from 'react';

const LogMealPage = lazy(() => import('../../pages/LogMealPage.jsx'));
const CreateRecipePage = lazy(() => import('../../pages/CreateRecipePage.jsx'));
const SummaryPage = lazy(() => import('../../pages/RecipeSummaryPage.jsx'));
const RecipeCardRoute = lazy(() => import('../../components/RecipeCardRoute.jsx'));
const MealsOverviewPage = lazy(() => import('../../pages/MealsOverviewPage.jsx'));
const MealCardRoute = lazy(() => import('../../components/MealCardRoute.jsx'));

export const healthRoutes = [
  { path: "/meals", element: MealsOverviewPage }, 
  
  { path: "/logMeal", element: LogMealPage },
  { path: "/createRecipe", element: CreateRecipePage },
  { path: "/Recipes", element: SummaryPage },
  { path: "/recipes/:id", element: RecipeCardRoute },
  { path: "/meals/:mealId", element: MealCardRoute },
];