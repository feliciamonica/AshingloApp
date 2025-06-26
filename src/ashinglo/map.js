import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useNavigate } from 'react-router-dom';

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Données des poubelles
const binsData = [
  { lat: 4.0511, lon: 9.7679, status: 'vide', region: 'Littoral', ville: 'Douala', quartier: 'Bonanjo' },
  { lat: 3.8480, lon: 11.5021, status: 'mipleine', region: 'Centre', ville: 'Yaoundé', quartier: 'Bastos' },
  { lat: 5.9601, lon: 10.1546, status: 'pleine', region: 'Nord-Ouest', ville: 'Bamenda', quartier: 'Commercial Ave' },
  { lat: 6.0, lon: 10.7, status: 'horsligne', region: 'Ouest', ville: 'Bafoussam', quartier: 'Marché A' },
  { lat: 2.9304, lon: 11.7304, status: 'pleine', region: 'Sud', ville: 'Ebolowa', quartier: 'Centre Ville' },
  { lat: 10.6096, lon: 14.2906, status: 'vide', region: 'Extrême-Nord', ville: 'Maroua', quartier: 'Domayo' },
];

// Localisations connues
const locationsData = [
  ...binsData,
  { lat: 4.0611, lon: 9.7779, region: 'Littoral', ville: 'Douala', quartier: 'Akwa' },
  { lat: 3.8580, lon: 11.5121, region: 'Centre', ville: 'Yaoundé', quartier: 'Mokolo' },
  { lat: 5.9701, lon: 10.1646, region: 'Nord-Ouest', ville: 'Bamenda', quartier: 'Up Station' },
  { lat: 6.01, lon: 10.71, region: 'Ouest', ville: 'Bafoussam', quartier: 'Banengo' },
];

const Map = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showRegionsList, setShowRegionsList] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showOSMResults, setShowOSMResults] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Initialisation de la carte avec zoom max à 18
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [7.3697, 12.3547],
      zoom: 6,
      minZoom: 6,
      maxZoom: 18,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        })
      ]
    });

    setMapInstance(map);
    return () => map.remove();
  }, []);

  // Mise à jour des marqueurs
  useEffect(() => {
    if (!mapInstance) return;

    markers.forEach(marker => mapInstance.removeLayer(marker));

    const filteredBins = binsData.filter(bin => {
      const statusMatch = filter === 'all' || bin.status === filter;
      const regionMatch = !selectedRegion || bin.region === selectedRegion;
      return statusMatch && regionMatch;
    });

    const newMarkers = filteredBins.map(bin => {
      const marker = L.circleMarker([bin.lat, bin.lon], {
        radius: 10,
        fillColor: getColor(bin.status),
        color: '#fff',
        weight: 1,
        fillOpacity: 1,
      }).addTo(mapInstance);

      marker.bindPopup(`
        <b>Région:</b> ${bin.region}<br>
        <b>Ville:</b> ${bin.ville}<br>
        <b>Quartier:</b> ${bin.quartier}<br>
        <b>Statut:</b> ${bin.status}<br>
        <b>Position:</b> ${bin.lat.toFixed(4)}, ${bin.lon.toFixed(4)}
      `);

      return marker;
    });

    setMarkers(newMarkers);
  }, [mapInstance, filter, selectedRegion]);

  // Recherche étendue
  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    const localResults = locationsData.filter(loc => 
      `${loc.region} ${loc.ville} ${loc.quartier}`.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (localResults.length > 0) {
      setSearchResults(localResults);
      setShowRegionsList(true);
      setShowOSMResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)},Cameroun&format=json&limit=5`
      );
      const data = await response.json();

      setSearchResults(data);
      setShowOSMResults(data.length > 0);
      setShowRegionsList(false);
      
      if (data.length === 0) {
        alert("Aucun résultat trouvé");
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
    }
  };

  const zoomToLocation = (location) => {
    if (!mapInstance) return;

    const lat = location.lat ?? parseFloat(location.lat);
    const lon = location.lon ?? parseFloat(location.lon);
    
    mapInstance.flyTo([lat, lon], 18);
    
    setSelectedRegion(location.region);
    setShowRegionsList(false);
    setShowOSMResults(false);
  };

  const getColor = (status) => {
    switch (status) {
      case 'vide': return 'green';
      case 'mipleine': return 'orange';
      case 'pleine': return 'red';
      case 'horsligne': return 'gray';
      default: return 'blue';
    }
  };

  const counts = {
    vide: binsData.filter(b => b.status === 'vide').length,
    mipleine: binsData.filter(b => b.status === 'mipleine').length,
    pleine: binsData.filter(b => b.status === 'pleine').length,
    horsligne: binsData.filter(b => b.status === 'horsligne').length,
  };

  return (
    <div className="map-container">
      {showSuccess && (
        <div className="logout-success-message">
          ✓ Déconnexion réussie ! Redirection en cours...
        </div>
      )}

      <div className="header">
        <div className="logo-title">
          <img src="/images/logo3.png" alt="Logo" className="logo" />
        </div>
        
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher n'importe quel lieu au Cameroun"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowRegionsList(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              Rechercher
            </button>
          </div>

          {showRegionsList && searchResults.length > 0 && (
            <div className="regions-dropdown">
              {searchResults.map((location, index) => (
                <div
                  key={index}
                  className="region-item"
                  onClick={() => zoomToLocation(location)}
                >
                  {location.region}, {location.ville}, {location.quartier}
                </div>
              ))}
            </div>
          )}

          {showOSMResults && searchResults.length > 0 && (
            <div className="regions-dropdown">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="region-item"
                  onClick={() => zoomToLocation(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className={`logout ${isLoggingOut ? 'logging-out' : ''}`} 
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

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button 
          className={`filter-btn ${filter === 'vide' ? 'active' : ''}`}
          onClick={() => setFilter('vide')}
        >
          <span className="dot green"></span> Vides: {counts.vide}
        </button>
        <button 
          className={`filter-btn ${filter === 'mipleine' ? 'active' : ''}`}
          onClick={() => setFilter('mipleine')}
        >
          <span className="dot orange"></span> Mi-pleines: {counts.mipleine}
        </button>
        <button 
          className={`filter-btn ${filter === 'pleine' ? 'active' : ''}`}
          onClick={() => setFilter('pleine')}
        >
          <span className="dot red"></span> Pleines: {counts.pleine}
        </button>
        <button 
          className={`filter-btn ${filter === 'horsligne' ? 'active' : ''}`}
          onClick={() => setFilter('horsligne')}
        >
          <span className="dot gray"></span> Maintenance: {counts.horsligne}
        </button>
      </div>

      <div ref={mapRef} id="map"></div>
    </div>
  );
};

export default Map;