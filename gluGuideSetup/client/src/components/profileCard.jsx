import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrashAlt, faSave, faTimes, faSignOutAlt, 
  faBlog, faUtensils, faBookOpen, faPlusCircle, faFileAlt,
  faFileDownload 
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import styles from '../styles/ProfileCard.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import AlertForm from './AlertForm';
import AlertsTable from './AlertsTable';
import ExportReportModal from './ExportReportModal';
import { useTranslation } from 'react-i18next';

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [bio, setBio] = useState('');
  const [currentBio, setCurrentBio] = useState('');
  const [dpUrl, setDpUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingDp, setIsEditingDp] = useState(false);
  const [selectedDpFile, setSelectedDpFile] = useState(null);
  const [previewDp, setPreviewDp] = useState(null);

  const [alertRefreshTrigger, setAlertRefreshTrigger] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [bioRes, dpRes] = await Promise.all([
          axiosInstance.get('/bio'),
          axiosInstance.get('/dp').catch(err => {
            if (err.response && err.response.status === 404) {
              return { data: { url: '' } };
            }
            throw err;
          })
        ]);

        setBio(bioRes.data.profile_bio || '');
        setCurrentBio(bioRes.data.profile_bio || '');
        setDpUrl(dpRes.data.url || '');
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(t('profileCard.fetchError'));
        setBio(t('profileCard.bioLoadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, t]);

  const handleBioEditToggle = () => {
    setCurrentBio(bio);
    setIsEditingBio(!isEditingBio);
  };

  const handleSaveBio = async () => {
    try {
      const response = await axiosInstance.post('/setBio', { profile_bio: currentBio });
      if (response.status === 200) {
        setBio(currentBio);
        setIsEditingBio(false);
        setError(null);
      }
    } catch (error) {
      setError(t('profileCard.bioUpdateError', { error: error.response?.data?.error || error.message }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDpFile(file);
      setPreviewDp(URL.createObjectURL(file));
    }
  };

  const handleSaveDp = async () => {
    if (!selectedDpFile) return;
    const formData = new FormData();
    formData.append('dp', selectedDpFile);
    try {
      const response = await axiosInstance.post('/setDp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDpUrl(response.data.url + `?t=${new Date().getTime()}`);
      setIsEditingDp(false);
      setSelectedDpFile(null);
      setPreviewDp(null);
    } catch (error) {
      setError(t('profileCard.dpUpdateError', { error: error.message }));
    }
  };

  const handleCancelDpEdit = () => {
    setIsEditingDp(false);
    setSelectedDpFile(null);
    setPreviewDp(null);
  };

  const handleDeleteDp = async () => {
    if (!window.confirm(t('profileCard.dpDeleteConfirm'))) return;
    try {
      await axiosInstance.delete('/deleteDp');
      setDpUrl('');
      setIsEditingDp(false);
    } catch (error) {
      setError(t('profileCard.dpDeleteError', { error: error.message }));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = t('profileCard.accountDeleteKey');
    const confirmation = prompt(t('profileCard.accountDeletePrompt', { confirmText }));
    if (confirmation !== confirmText) return;

    try {
      const response = await axiosInstance.post('/deleteAccount', { confirmDelete: user.username });
      if (response.status === 200) {
        await logout();
        navigate('/login');
      }
    } catch (error) {
      setError(t('profileCard.accountDeleteError', { error: error.message }));
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  if (!user) return null;
  if (loading) return <div className={styles.loadingState}>{t('profileCard.loading')}</div>;

  return (
    <div className={styles.profileCardContainer}>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <div className={styles.profileHeaderBanner}></div>
      <div className={styles.profileGrid}>
        
        <aside className={styles.profileSidebar}>
          <div className={styles.dpWrapper}>
            <img
              className={styles.profileDp}
              src={previewDp || dpUrl || 'https://via.placeholder.com/180'}
              alt={t('profileCard.ariaDp', { username: user.username })}
            />
            {!isEditingDp && (
              <button className={styles.dpEditButton} onClick={() => setIsEditingDp(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>

          {isEditingDp && (
            <div className={styles.dpEditControls}>
              <input type='file' onChange={handleFileChange} accept="image/*" className={styles.dpFileInput} />
              <div className={styles.dpEditActions}>
                <button onClick={handleSaveDp} className={`${styles.actionButtonSmall} ${styles.saveButtonSmall}`} disabled={!selectedDpFile}>
                  <FontAwesomeIcon icon={faSave} /> {t('profileCard.btnSave')}
                </button>
                <button onClick={handleCancelDpEdit} className={`${styles.actionButtonSmall} ${styles.cancelButtonSmall}`}>
                  <FontAwesomeIcon icon={faTimes} /> {t('profileCard.btnCancel')}
                </button>
              </div>
            </div>
          )}

          <h1 className={styles.profileUsername}>{user.username}</h1>
          
          <nav className={styles.profileActions}>
            <button className={styles.actionButton} onClick={() => navigate('/myBlogs')}>
              <FontAwesomeIcon icon={faBlog} className={styles.buttonIcon} /> {t('profileCard.navMyBlogs')}
            </button>

            <button className={styles.actionButton} onClick={() => setIsExportModalOpen(true)} style={{ backgroundColor: '#27ae60', color: 'white' }}>
              <FontAwesomeIcon icon={faFileDownload} className={styles.buttonIcon} /> {t('profileCard.navExportPdf')}
            </button>

            <div style={{ marginTop: '30px', width: '100%' }}>
              <AlertForm fetchAlerts={() => setAlertRefreshTrigger(prev => prev + 1)} />
            </div>
          </nav>

          <div className={styles.dangerZone}>
            <button className={styles.deleteAccountButton} onClick={handleDeleteAccount}>
              <FontAwesomeIcon icon={faSignOutAlt} className={styles.buttonIcon} /> {t('profileCard.btnDeleteAccount')}
            </button>
          </div>
        </aside>

        <main className={styles.profileContent}>
          <div className={styles.bioSectionHeader}>
            <h2 className={styles.bioTitle}>{t('profileCard.bioTitle')}</h2>
            {!isEditingBio && (
              <button className={styles.bioEditIcon} onClick={handleBioEditToggle}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className={styles.bioEditSection}>
              <ReactQuill
                theme='snow'
                value={currentBio}
                onChange={setCurrentBio}
                modules={quillModules}
                className={styles.quillEditor}
              />
              <div className={styles.bioEditActions}>
                <button onClick={handleSaveBio} className={`${styles.actionButton} ${styles.saveButton}`}>
                  <FontAwesomeIcon icon={faSave} /> {t('profileCard.btnSaveBio')}
                </button>
                <button onClick={handleBioEditToggle} className={`${styles.actionButton} ${styles.cancelButton}`}>
                  <FontAwesomeIcon icon={faTimes} /> {t('profileCard.btnCancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.bioDisplay}>
              {bio ? parse(bio) : <p>{t('profileCard.noBio')}</p>}
            </div>
          )}

          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
             <AlertsTable refreshTrigger={alertRefreshTrigger} />
          </div>
          
        </main>
      </div>

      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </div>
  );
};

export default ProfileCard;