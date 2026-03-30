import RecipesCards from "../components/RecipesCards";
import styles from '../styles/pages.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMortarPestle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const RecipeSummaryPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.recipesSummaryPageContainer}>
      <div className={styles.recipesPageHeader}>
        <h1 className={styles.recipesPageTitle}>
          <FontAwesomeIcon icon={faMortarPestle} style={{ marginRight: '15px' }} />
          {t('recipeSummary.title')}
        </h1>
      </div>
      <RecipesCards />
    </div>
  );
};

export default RecipeSummaryPage;