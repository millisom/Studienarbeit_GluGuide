import { useState } from "react";
import styles from "../styles/ContactUs.module.css";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccessMessage(t('contactUs.success'));
        setFormData({
            name: "",
            email: "",
            message: ""
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('contactUs.title')}</h1>
            <p className={styles.subtitle}>
                {t('contactUs.subtitle')}
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>{t('contactUs.labelName')}</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>{t('contactUs.labelEmail')}</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.label}>{t('contactUs.labelMessage')}</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        required
                    ></textarea>
                </div>
                <button type="submit" className={styles.submitButton}>{t('contactUs.btnSubmit')}</button>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            </form>
            <div className={styles.contactInfo}>
                <p>{t('contactUs.directEmail')} <a href="mailto:gluguide01@gmail.com" className={styles.link}>gluguide01@gmail.com</a></p>
                <p>{t('contactUs.directPhone')} 123-456-7890</p>
            </div>
        </div>
    );
};

export default ContactUs;