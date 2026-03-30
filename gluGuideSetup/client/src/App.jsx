import { BrowserRouter as Router } from 'react-router-dom';
import { Suspense } from 'react'; 
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import './i18n/config'; 

function App() {

  if (import.meta.env.DEV) {
    console.log("Backend URL:", import.meta.env.VITE_API_URL);
  }
  
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading translations...</div>}>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;