import React, { useState, useEffect } from 'react'; // Ajout de useEffect ici
import './acceuil.css';
import { useNavigate } from 'react-router-dom';
import Preloader from './Preloader';

const Acceuil = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false); 
 
  useEffect(() => {
  const timer = setTimeout(() => {
    setPageLoaded(true);
  }, 1000); // Minimum 1 seconde d'affichage du preloader

  window.addEventListener('load', () => {
    setPageLoaded(true);
    clearTimeout(timer);
  });
  
  if (document.readyState === 'complete') {
    setPageLoaded(true);
    clearTimeout(timer);
  }

  return () => {
    clearTimeout(timer);
    window.removeEventListener('load', () => {
      setPageLoaded(true);
    });
  };
}, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      setShowSuccess(true);
      
      setTimeout(() => {
        setIsLoggingOut(false);
        setShowSuccess(false);
        navigate('/login');
      }, 1500);
    }, 500);
  };

  const handleMapClick = () => {
    navigate('/map');
  };

  const handleTrashClick = () => {
    navigate('/poubelle');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Afficher le preloader tant que la page n'est pas chargée
  if (!pageLoaded) {
    return <Preloader />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <img src="/images/logo3.png" alt="Ashinglo Logo" className="logo-img" />
        </div>
        <button 
          className={`logout-btn ${isLoggingOut ? 'logging-out' : ''}`} 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <div className="logout-loading">
              <span>Déconnexion...</span>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            'Se Déconnecter'
          )}
        </button>
      </header>

      {showSuccess && (
        <div className="logout-success-message">
          ✓ Déconnexion réussie ! Redirection en cours...
        </div>
      )}

      <main className="dashboard-main">
        <div className="card">
          <div className="card-icon">🗑️</div>
          <h2>Gérer les Poubelles connectées</h2>
          <p>Organisez et surveillez toutes les poubelles connectées de manière efficace.</p>
          <button className="card-btn" onClick={handleTrashClick}>Aller aux Poubelles</button>
        </div>

        <div className="card">
          <div className="card-icon">🗺️</div>
          <h2>Visualiser les Données des Capteurs</h2>
          <p>Analysez les données de tous les capteurs connectés depuis la map.</p>
          <button className="card-btn" onClick={handleMapClick}>Voir la map</button>
        </div>

        <div className="card">
          <div className="card-icon">⚙️</div>
          <h2>Gérer les alertes et taches</h2>
          <p>Configurez les alertes et planifier les taches.</p>
          <button className="card-btn" onClick={handleSettingsClick}>Paramètres</button>
        </div>

        <div className="card">
          <div className="card-icon">📊</div>
          <h2>Acceder au tableau de bord</h2>
          <p>Ayez un apercu global sur l'etat des poubelles et la gestion de celles ci</p>
          <button className="card-btn" onClick={handleDashboardClick}>Ouvrir le tableau de bord</button>
        </div>
      </main>
    </div>
  );
};

export default Acceuil;