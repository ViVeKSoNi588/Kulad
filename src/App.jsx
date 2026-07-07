import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import About from './components/About';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const secretPath = import.meta.env.VITE_ADMIN_PATH || '/artisan-pune-secret-9881';

  // Check URL path on mount and check admin session status
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === secretPath) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
      
      const token = sessionStorage.getItem('admin_token');
      setIsLoggedIn(!!token);
    };

    handleUrlChange();
    
    // Watch for back/forward navigation
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [secretPath]);

  // Re-sync login status when admin view states toggle
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    setIsLoggedIn(!!token);
  }, [isAdminView]);

  const handleNavigateAdmin = () => {
    window.history.pushState({}, '', secretPath);
    setIsAdminView(true);
  };

  const handleNavigateHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  return (
    <div className="app-container">
      {isAdminView ? (
        <AdminPanel onBack={handleNavigateHome} />
      ) : (
        <>
          {/* Outer Card Frame wrapping header and hero matching Spylt reference */}
          <div className="outer-card-frame">
            <Navbar isLoggedIn={isLoggedIn} onNavigateAdmin={handleNavigateAdmin} />
            <Hero />
          </div>

          {/* Main product showcase & interactive carton/wholesale calculator */}
          <ProductShowcase isAdmin={isLoggedIn} onManageCatalog={handleNavigateAdmin} />

          {/* Core brand values and eco-friendly stats */}
          <About />

          {/* Bottom informational footer */}
          <Footer />
        </>
      )}

      <style>{`
        .app-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Separator gap between outer card frame and showcase */
        }

        @media (max-width: 768px) {
          .app-container {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

