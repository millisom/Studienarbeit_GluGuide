import styles from '../styles/AboutUs.module.css';
import { useTranslation, Trans } from 'react-i18next';

const AboutUs = () => {
    const { t } = useTranslation();

    const currentTeamMembers = [
        {
            name: 'Emili',
            role: t('aboutUs.roles.pm'),
            image: 'https://gdewomenhealth.wordpress.com/wp-content/uploads/2024/09/integration-2031395_1920.png',
        },
        {
            name: 'Hossey',
            role: t('aboutUs.roles.sa'),
            image: 'https://gdewomenhealth.wordpress.com/wp-content/uploads/2024/09/database-4941338_1920-1.png',
        },
        {
            name: 'Maja',
            role: t('aboutUs.roles.uid'),
            image: 'https://gdewomenhealth.wordpress.com/wp-content/uploads/2024/09/laptop-2282328_1920.png',
        },
        {
            name: 'Nilgün',
            role: t('aboutUs.roles.us'),
            image: 'https://gdewomenhealth.wordpress.com/wp-content/uploads/2024/09/baby-7318695_1920.jpg',
        },
    ];

    const honorableMentions = [
        {
            name: 'Hafsa',
            role: t('aboutUs.roles.pm_mentor'),
            image: 'https://gdewomenhealth.wordpress.com/wp-content/uploads/2024/09/priority-4303707_1920.png',
            note: t('aboutUs.hafsaNote'),
        },
    ];

    return (
        <div className={styles.aboutUsPageContainer}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.mainTitle}>{t('aboutUs.mainTitle')}</h1>

                <section className={styles.introSection}>
                    <p className={styles.description}>
                        <Trans i18nKey="aboutUs.introP1">
                            Welcome to <strong>GluGuide</strong>, your companion in managing gestational diabetes. Our mission is to develop GluGuide into a helpful resource for women managing gestational diabetes. Each feature, from tracking to reminders, is crafted with care to make life a little easier.
                        </Trans>
                    </p>
                    <p className={styles.description}>
                        {t('aboutUs.introP2')}
                    </p>
                </section>
                
                <section className={styles.teamSection}>
                    <h2 className={styles.sectionTitle}>{t('aboutUs.teamTitle')}</h2>
                    <div className={styles.teamGrid}>
                        {currentTeamMembers.map((member, index) => (
                            <div key={`team-${index}`} className={styles.teamCard}>
                                <img
                                    src={member.image}
                                    alt={`${member.name}'s profile`}
                                    className={styles.avatar}
                                />
                                <h3 className={styles.memberName}>{member.name}</h3>
                                <p className={styles.memberRole}>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.specialThanksSection}>
                    <h2 className={styles.sectionTitle}>{t('aboutUs.thanksTitle')}</h2>
                    <div className={styles.honorableMentionsContainer}>
                        {honorableMentions.map((member, index) => (
                            <div key={`honor-${index}`} className={styles.honorableMentionCard}>
                                <img
                                    src={member.image}
                                    alt={`${member.name}'s profile`}
                                    className={styles.avatar}
                                />
                                <div className={styles.honorableMentionInfo}>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                    <p className={styles.honorableMentionNote}>{member.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <p className={styles.closingStatement}>
                    {t('aboutUs.closing')}
                </p>
            </div>
        </div>
    );
};

export default AboutUs;