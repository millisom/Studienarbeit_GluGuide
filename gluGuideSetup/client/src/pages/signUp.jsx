import { useState } from "react";
import axiosInstance from '../api/axiosConfig';
import { Link, useNavigate } from "react-router-dom";
import styles from '../styles/signUp.module.css';
import { useTranslation, Trans } from 'react-i18next';

function SignUp() {
    const { t } = useTranslation();
    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [healthDataConsent, setHealthDataConsent] = useState(false);
    
    const [message, setMessage] = useState('');

    async function register(e) {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert(t('signUp.alertMismatch'));
            return;
        }

        if (!termsAccepted) {
            alert(t('signUp.alertTerms'));
            return;
        }

        if (!healthDataConsent) {
            alert(t('signUp.alertHealth'));
            return;
        }

        try {
            await axiosInstance.post("/signUp", {
                username,
                email,
                password,
                termsAccepted,
                healthDataConsent 
            })
            .then(res => {
                if (res.data === "exists") {
                    alert(t('signUp.messageErrorExists'));
                    setMessage(t('signUp.messageUserExists'));
                } else if (res.data === "notexist") {
                    setMessage(t('signUp.messageSuccess'));
                    history("/", { state: { id: email } });
                }
            })
            .catch(e => {
                setMessage(t('signUp.messageErrorGeneral'));
                console.log(e);
            });
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className={styles.formSignUp}>
            <h1 className={styles.pageTitle}>{t('signUp.title')}</h1>
            <form onSubmit={register} aria-label="registration-form">
                <div className={styles.inputField}>
                    <input
                        type="text"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('signUp.placeholderUsername')}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="email"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('signUp.placeholderEmail')}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('signUp.placeholderPassword')}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="password"
                        name="confirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('signUp.placeholderConfirmPassword')}
                        required
                        className={styles.input}
                    />
                </div>

                {/* GDPR: General Terms & Privacy Policy */}
                <div className={styles.inputField} style={{ marginBottom: '10px', textAlign: 'left' }}>
                    <label className={styles.label} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'flex-start' }}>
                        <input
                            type="checkbox"
                            name="termsAccepted"  
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            style={{ marginRight: '10px', marginTop: '4px' }}
                            required
                        />
                        <span>
                            <Trans i18nKey="signUp.gdprTerms">
                                I accept the <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Terms & Conditions</Link> and have read the <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Privacy Policy</Link>.
                            </Trans>
                        </span>
                    </label>
                </div>

                {/* GDPR: Explicit Health Data Consent */}
                <div className={styles.inputField} style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label className={styles.label} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'flex-start' }}>
                        <input
                            type="checkbox"
                            name="healthDataConsent"  
                            onChange={(e) => setHealthDataConsent(e.target.checked)}
                            style={{ marginRight: '10px', marginTop: '4px' }}
                            required
                        />
                        <span>
                            <Trans i18nKey="signUp.gdprHealth">
                                I explicitly consent to the processing of my <strong>health data</strong> (e.g., glucose levels, meal logs) to provide the GluGuide service, as outlined in the <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Privacy Policy</Link>.
                            </Trans>
                        </span>
                    </label>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.button}>{t('signUp.btnSubmit')}</button>
                </div>
                <p><Link to="/login" className={styles.forgotPassword}>{t('signUp.footerLink')}</Link></p>
            </form>
            
             {message && (
                <div
                    data-testid={message === t('signUp.messageSuccess') ? "success-message" : "error-message"}
                    style={{ 
                        color: message === t('signUp.messageSuccess') ? "green" : "red",
                        marginTop: '15px',
                        textAlign: 'center'
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}

export default SignUp;