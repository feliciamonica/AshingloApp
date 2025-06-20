import React from 'react';
import './acceuil.css';

const Acceuil = () => {
  const handleLogout = () => {
    alert('Déconnexion réussie !');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <img src="/images/logo3.png" alt="Ashinglo Logo" className="logo-img" />
        </div>
        <button className="logout-btn" onClick={handleLogout}>Se Déconnecter</button>
      </header>

      <main className="dashboard-main">
        <div className="card">
          <div className="card-icon">🗑️</div>
          <h2>Gérer les Poubelles Intelligentes</h2>
          <p>Organisez et surveillez toutes les poubelles intelligentes de manière efficace.</p>
          <button className="card-btn">Aller aux Poubelles</button>
        </div>

        <div className="card">
          <div className="card-icon">📊</div>
          <h2>Visualiser les Données des Capteurs</h2>
          <p>Analysez les données de tous les capteurs connectés.</p>
          <button className="card-btn">Voir les Données</button>
        </div>

        <div className="card">
          <div className="card-icon">⚙️</div>
          <h2>Accéder aux Paramètres</h2>
          <p>Configurez les paramètres et préférences de l’application.</p>
          <button className="card-btn">Paramètres</button>
        </div>
      </main>
    </div>
  );
};

export default Acceuil;
