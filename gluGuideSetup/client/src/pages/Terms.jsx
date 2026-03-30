import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

function Terms() {
    const { t } = useTranslation();

    const sectionStyle = { marginTop: '20px' };
    const h2Style = { fontSize: '1.2em', color: '#d35400' };
    const disclaimerBox = { 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fdf2e9', 
        borderLeft: '4px solid #e67e22' 
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>
                {t('terms.title')}
            </h1>
            <p><strong>{t('terms.lastUpdated')}</strong></p>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('terms.s1.title')}</h2>
                <p>{t('terms.s1.content')}</p>
            </section>

            <section style={disclaimerBox}>
                <h2 style={{ ...h2Style, marginTop: 0 }}>{t('terms.s2.title')}</h2>
                <p><strong>{t('terms.s2.disclaimer')}</strong></p>
                <p>{t('terms.s2.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('terms.s3.title')}</h2>
                <p>{t('terms.s3.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('terms.s4.title')}</h2>
                <p>{t('terms.s4.intro')}</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>{t('terms.s4.item1')}</li>
                    <li>{t('terms.s4.item2')}</li>
                    <li>{t('terms.s4.item3')}</li>
                </ul>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('terms.s5.title')}</h2>
                <p>{t('terms.s5.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('terms.s6.title')}</h2>
                <p>{t('terms.s6.content')}</p>
            </section>

            <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <Link to="/signup" style={{ 
                    display: 'inline-block', 
                    padding: '12px 24px', 
                    border: '2px solid #e67e22', 
                    borderRadius: '6px', 
                    color: '#e67e22', 
                    textDecoration: 'none', 
                    fontWeight: 'bold',
                    backgroundColor: '#fdf2e9'
                }}>
                    &larr; {t('terms.btnBack')}
                </Link>
            </div>
        </div>
    );
}

export default Terms;