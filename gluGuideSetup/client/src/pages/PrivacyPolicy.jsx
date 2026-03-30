import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Privacy Policy</h1>
            <p><strong>Last Updated:</strong> March 2026</p>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>1. Introduction</h2>
                <p>Welcome to GluGuide. We take your privacy seriously. This policy explains what personal data we collect, why we collect it, and how we protect it, in compliance with the General Data Protection Regulation (GDPR).</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>2. What Data We Collect</h2>
                <p>To provide our service, we collect the following information:</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li><strong>Account Data:</strong> Username, email address, and an encrypted password hash.</li>
                    <li><strong>Special Category Data (Health Data):</strong> Blood glucose logs, meal entries, nutritional information (carbs), and personal health notes.</li>
                </ul>
                <p>We process health data solely based on your <strong>explicit consent</strong>, which you provided during registration.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>3. How We Use Your Data</h2>
                <p>Your data is used strictly to operate the GluGuide application. This includes displaying your dashboard, calculating nutritional totals, and generating PDF health reports. We do <strong>not</strong> sell your data to third parties.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>4. Where Your Data is Stored</h2>
                <p>GluGuide is hosted securely using Microsoft Azure infrastructure located within the European Union. Your data is protected by encryption in transit (HTTPS) and encryption at rest in our PostgreSQL database.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>5. Data Retention</h2>
                <p>We keep your data only as long as you have an active account. If you choose to delete your account, all associated data (including glucose logs and meals) is permanently and irreversibly deleted from our active database.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>6. Your GDPR Rights</h2>
                <p>Under the GDPR, you have the following rights regarding your data:</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li><strong>Right to Access & Portability:</strong> You can download a copy of your health data at any time using the "Export PDF" feature in your profile.</li>
                    <li><strong>Right to Erasure:</strong> You can permanently delete your account and all associated data via the "Delete Account" button in your settings.</li>
                    <li><strong>Right to Rectification:</strong> You can edit or update your bio, meals, and glucose logs within the app.</li>
                    <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for us to process your health data by deleting your account.</li>
                </ul>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>7. Cookies</h2>
                <p>We use a single, strictly necessary session cookie to keep you logged into the application securely. We do not use any tracking, advertising, or third-party analytics cookies.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#2980b9' }}>8. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact the Data Controller at: <strong>[Insert Your Email Here]</strong></p>
            </section>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Return to Home</Link>
            </div>
        </div>
    );
}

export default PrivacyPolicy;