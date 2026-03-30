import { useState } from "react";
import axiosInstance from '../api/axiosConfig';
import { Link, useNavigate } from "react-router-dom";
import styles from '../styles/signUp.module.css';

function SignUp() {
    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // GDPR Consent States
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [healthDataConsent, setHealthDataConsent] = useState(false);
    
    const [message, setMessage] = useState('');

    async function register(e) {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // GDPR Validation
        if (!termsAccepted) {
            alert("You must accept the Terms and Conditions and Privacy Policy to proceed.");
            return;
        }

        if (!healthDataConsent) {
            alert("Explicit consent for processing health data is required to use GluGuide.");
            return;
        }

        try {
            await axiosInstance.post("/signUp", {
                username,
                email,
                password,
                termsAccepted,
                healthDataConsent // Send this to the backend to prove consent!
            })
            .then(res => {
                if (res.data === "exists") {
                    alert("There is already a user account with this email");
                    setMessage("User already exists");
                } else if (res.data === "notexist") {
                    setMessage("Account created successfully");
                    history("/", { state: { id: email } });
                }
            })
            .catch(e => {
                setMessage("An error occurred. Please try again.");
                console.log(e);
            });
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className={styles.formSignUp}>
            <h1 className={styles.pageTitle}>Sign Up</h1>
            <form onSubmit={register}>
                <div className={styles.inputField}>
                    <input
                        type="text"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="email"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputField}>
                    <input
                        type="password"
                        name="confirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className={styles.input}
                    />
                </div>

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
                            I accept the <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Terms & Conditions</Link> and have read the <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Privacy Policy</Link>.
                        </span>
                    </label>
                </div>

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
                            I explicitly consent to the processing of my <strong>health data</strong> (e.g., glucose levels, meal logs) to provide the GluGuide service, as outlined in the <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Privacy Policy</Link>.
                        </span>
                    </label>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.button}>Sign Up</button>
                </div>
                <p><Link to="/login" className={styles.forgotPassword}>Already have an Account? Login here</Link></p>
            </form>
            
             {message && (
                <div
                    data-testid={message === "Account created successfully" ? "success-message" : "error-message"}
                    style={{ 
                        color: message === "Account created successfully" ? "green" : "red",
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