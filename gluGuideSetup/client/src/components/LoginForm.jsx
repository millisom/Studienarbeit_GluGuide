import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LoginForm.module.css';
import '../styles/signUp.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  
  const { login } = useAuth();

  const [values, setValues] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(values);

    if (result.success) {
      navigate('/account');
    } else {
      setError(result.message || 'Invalid username or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTitle}>Welcome Back!</h1>
      <p className={styles.pageDescription}>
        Log in to your account and manage your content effortlessly.
      </p>
      <form onSubmit={handleSubmit} className={styles.formLogIn}>
      <h1 className="pageTitle">Login</h1>
        <div className='inputField'>
        <input
          type="text"
          name="username"
          id="username"
          onChange={handleInput}
          required
          className={styles.input}
          placeholder="Username"
        />
        </div>
        <div className='inputField'>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleInput}
          required
          className={styles.input}
          placeholder="Password"
        />
        </div>
        <div className={`${styles.buttonGroup} ${styles.mt}`}>
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <p className={styles.linkGroup}>
          <Link to="/forgotPassword" className={styles.link}>
            Forgot Password?
          </Link>
          |
          <Link to="/signUp" className={styles.link}>
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;