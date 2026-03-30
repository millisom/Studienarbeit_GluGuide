import React from 'react';
import styles from '../styles/Footer.module.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} GluGuide. {t('footer.rights')}</p>
            <nav>
                <a href="/contact">{t('footer.contact')}</a> | 
                <a href="/about">{t('footer.about')}</a>
            </nav>
        </footer>
    );
};

export default Footer;