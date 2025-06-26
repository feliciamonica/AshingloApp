import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './poubelles.css';

const Poubelle = () => {
  const [trashBins, setTrashBins] = useState([]);
  const [currentTrashId, setCurrentTrashId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    ville: '',
    quartier: '',
    status: 'active'
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const navigate = useNavigate();

  // Charger des données d'exemple
  useEffect(() => {
    loadSampleData();
  }, []);

  // Fonction pour afficher une notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

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

  const loadSampleData = () => {
    const sampleData = [
      {
        id: 1,
        name: 'Poubelle #1',
        region: 'Littoral',
        ville: 'Douala',
        quartier: 'Akwa',
        status: 'active'
      },
      {
        id: 2,
        name: 'Poubelle #2',
        region: 'Centre',
        ville: 'Yaoundé',
        quartier: 'Mfoundi',
        status: 'inactive'
      },
      {
        id: 3,
        name: 'Poubelle #3',
        region: 'Littoral',
        ville: 'Douala',
        quartier: 'Bonanjo',
        status: 'maintenance'
      }
    ];
    setTrashBins(sampleData);
    setNextId(4);
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    const statusTexts = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'maintenance': 'En maintenance'
    };
    return statusTexts[status] || status;
  };

  // Créer une nouvelle poubelle
  const createNewTrash = () => {
    setCurrentTrashId(null);
    resetForm();
  };

  // Sélectionner une poubelle
  const selectTrash = (id) => {
    setCurrentTrashId(id);
    const trash = trashBins.find(t => t.id === id);
    if (trash) {
      fillForm(trash);
    }
  };

  // Éditer une poubelle
  const editTrash = (id) => {
    selectTrash(id);
  };

  // Supprimer une poubelle
  const deleteTrash = (id) => {
    const trash = trashBins.find(t => t.id === id);
    if (trash && window.confirm(`Êtes-vous sûr de vouloir supprimer "${trash.name}" ?`)) {
      setTrashBins(trashBins.filter(t => t.id !== id));
      if (currentTrashId === id) {
        createNewTrash();
      }
      showNotification(`✓ Poubelle "${trash.name}" supprimée avec succès !`, 'success');
    }
  };

  // Remplir le formulaire avec les données d'une poubelle
  const fillForm = (trash) => {
    setFormData({
      name: trash.name,
      region: trash.region,
      ville: trash.ville,
      quartier: trash.quartier,
      status: trash.status
    });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      ville: '',
      quartier: '',
      status: 'active'
    });
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Annuler le formulaire
  const cancelForm = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler les modifications ?')) {
      if (currentTrashId) {
        const trash = trashBins.find(t => t.id === currentTrashId);
        if (trash) {
          fillForm(trash);
        }
      } else {
        resetForm();
      }
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentTrashId) {
      // Modifier une poubelle existante
      setTrashBins(prev => prev.map(trash => 
        trash.id === currentTrashId 
          ? { ...trash, ...formData }
          : trash
      ));
      showNotification(`✓ Poubelle "${formData.name}" modifiée avec succès !`, 'success');
    } else {
      // Créer une nouvelle poubelle
      const newTrash = {
        id: nextId,
        ...formData
      };
      setTrashBins(prev => [...prev, newTrash]);
      setCurrentTrashId(newTrash.id);
      setNextId(prev => prev + 1);
      showNotification(`✓ Poubelle "${formData.name}" créée avec succès !`, 'success');
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="logo">
          🗑️ SmartWaste
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
      </div>
    
      {showSuccess && (
        <div className="logout-success-message">
          ✓ Déconnexion réussie ! Redirection en cours...
        </div>
      )}

      {notification.show && (
        <div className={`notification-message ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Poubelles</h2>
            <button className="add-btn" onClick={createNewTrash}>
              Ajouter
            </button>
          </div>

          <div className="trash-list" id="trashList">
            {trashBins.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗑️</div>
                <p>Aucune poubelle créée</p>
                <p>Cliquez sur "Ajouter" pour commencer</p>
              </div>
            ) : (
              trashBins.map(trash => (
                <div 
                  key={trash.id}
                  className={`trash-item ${currentTrashId === trash.id ? 'active' : ''}`}
                  onClick={() => selectTrash(trash.id)}
                >
                  <div className="trash-item-header">
                    <div className="trash-item-name">{trash.name}</div>
                    <div className="trash-item-actions">
                      <button 
                        className="action-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          editTrash(trash.id);
                        }}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrash(trash.id);
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="trash-item-info">
                    📍 {trash.region}, {trash.ville}, {trash.quartier}
                  </div>
                  <div className="trash-item-info">
                    <span className={`trash-item-status status-${trash.status}`}>
                      {getStatusText(trash.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-container">
          <h1 className="form-title">
            {currentTrashId ? 'Modifier la Poubelle' : 'Nouvelle Poubelle'}
          </h1>

          <form id="trashForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nom de la poubelle</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Région</label>
              <select
                name="region"
                className="form-select"
                value={formData.region}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner une région</option>
                <option value="Littoral">Littoral</option>
                <option value="Centre">Centre</option>
                <option value="Ouest">Ouest</option>
                <option value="Sud">Sud</option>
                <option value="Est">Est</option>
                <option value="Nord">Nord</option>
                <option value="Adamaoua">Adamaoua</option>
                <option value="Nord-Ouest">Nord-Ouest</option>
                <option value="Sud-Ouest">Sud-Ouest</option>
                <option value="Extrême-Nord">Extrême-Nord</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ville</label>
              <input
                type="text"
                name="ville"
                className="form-input"
                value={formData.ville}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quartier</label>
              <input
                type="text"
                name="quartier"
                className="form-input"
                value={formData.quartier}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary" id="saveBtn">
                {currentTrashId ? 'Sauvegarder' : 'Créer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Poubelle;