import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

function PrivacyPolicy() {
    const { t } = useTranslation();

    const sectionStyle = { marginTop: '20px' };
    const h2Style = { fontSize: '1.2em', color: '#2980b9' };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                {t('privacyPolicy.title')}
            </h1>
            <p><strong>{t('privacyPolicy.lastUpdated')}</strong></p>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s1.title')}</h2>
                <p>{t('privacyPolicy.s1.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s2.title')}</h2>
                <p>{t('privacyPolicy.s2.intro')}</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>
                        <Trans i18nKey="privacyPolicy.s2.item1">
                            <strong>Account Data:</strong> Username, email address, and an encrypted password hash.
                        </Trans>
                    </li>
                    <li>
                        <Trans i18nKey="privacyPolicy.s2.item2">
                            <strong>Special Category Data (Health Data):</strong> Blood glucose logs, meal entries, nutritional information (carbs), and personal health notes.
                        </Trans>
                    </li>
                </ul>
                <p>
                    <Trans i18nKey="privacyPolicy.s2.consent">
                        We process health data solely based on your <strong>explicit consent</strong>, which you provided during registration.
                    </Trans>
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s3.title')}</h2>
                <p>
                    <Trans i18nKey="privacyPolicy.s3.content">
                        Your data is used strictly to operate the GluGuide application. This includes displaying your dashboard, calculating nutritional totals, and generating PDF health reports. We do <strong>not</strong> sell your data to third parties.
                    </Trans>
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s4.title')}</h2>
                <p>{t('privacyPolicy.s4.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s5.title')}</h2>
                <p>{t('privacyPolicy.s5.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s6.title')}</h2>
                <p>{t('privacyPolicy.s6.intro')}</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>
                        <Trans i18nKey="privacyPolicy.s6.item1">
                            <strong>Right to Access & Portability:</strong> You can download a copy of your health data at any time using the "Export PDF" feature in your profile.
                        </Trans>
                    </li>
                    <li>
                        <Trans i18nKey="privacyPolicy.s6.item2">
                            <strong>Right to Erasure:</strong> You can permanently delete your account and all associated data via the "Delete Account" button in your settings.
                        </Trans>
                    </li>
                    <li>
                        <Trans i18nKey="privacyPolicy.s6.item3">
                            <strong>Right to Rectification:</strong> You can edit or update your bio, meals, and glucose logs within the app.
                        </Trans>
                    </li>
                    <li>
                        <Trans i18nKey="privacyPolicy.s6.item4">
                            <strong>Right to Withdraw Consent:</strong> You may withdraw your consent for us to process your health data by deleting your account.
                        </Trans>
                    </li>
                </ul>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s7.title')}</h2>
                <p>{t('privacyPolicy.s7.content')}</p>
            </section>

            <section style={sectionStyle}>
                <h2 style={h2Style}>{t('privacyPolicy.s8.title')}</h2>
                <p>
                    <Trans i18nKey="privacyPolicy.s8.content">
                        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact the Data Controller at: <strong>gluguide01@gmail.com</strong>
                    </Trans>
                </p>
            </section>

            <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <Link to="/signup" style={{ 
                    display: 'inline-block', 
                    padding: '12px 24px', 
                    border: '2px solid #3498db', 
                    borderRadius: '6px', 
                    color: '#3498db', 
                    textDecoration: 'none', 
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa'
                }}>
                    &larr; {t('privacyPolicy.btnBack')}
                </Link>
            </div>
        </div>
    );
}

export default PrivacyPolicy;