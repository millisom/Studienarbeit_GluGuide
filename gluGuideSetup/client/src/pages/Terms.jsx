import React from 'react';
import { Link } from 'react-router-dom';

function Terms() {
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>Terms and Conditions</h1>
            <p><strong>Last Updated:</strong> March 2026</p>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400' }}>1. Acceptance of Terms</h2>
                <p>By registering for and using GluGuide, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fdf2e9', borderLeft: '4px solid #e67e22' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400', marginTop: 0 }}>2. Medical Disclaimer (Important)</h2>
                <p><strong>GluGuide is not a medical device or a substitute for professional medical advice.</strong></p>
                <p>The application is designed solely for tracking and logging personal health data (such as glucose levels and carbohydrate intake). You should never delay seeking medical advice, disregard medical advice, or discontinue medical treatment because of information on this application. Always consult your doctor or healthcare provider regarding your diabetes management.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400' }}>3. User Accounts & Security</h2>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information when logging your health data. GluGuide cannot be held liable for any loss or damage arising from your failure to protect your login information.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400' }}>4. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, GluGuide and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from:</p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Your access to or use of (or inability to access or use) the service.</li>
                    <li>Any inaccuracies or errors in the application's calculations, nutritional data, or export reports.</li>
                    <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400' }}>5. Account Termination</h2>
                <p>We reserve the right to suspend or terminate your account at any time, without prior notice or liability, for any reason, including without limitation if you breach these Terms and Conditions.</p>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2em', color: '#d35400' }}>6. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or a prominent notice within the application. Continued use of the app after changes constitutes acceptance of the new terms.</p>
            </section>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#e67e22', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Return to Home</Link>
            </div>
        </div>
    );
}

export default Terms;