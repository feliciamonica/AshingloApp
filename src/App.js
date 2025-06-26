import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PageConnexion from './ashinglo/login';  
import Acceuil from './ashinglo/acceuil';
import Map from './ashinglo/map';
import Poubelle from './ashinglo/poubelle';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PageConnexion />} />
        <Route path="/acceuil" element={<Acceuil />} />
        <Route path="/" element={<Acceuil />} />
        <Route path="/map" element={<Map />} />
        <Route path="/" element={<Acceuil />} />
        <Route path="/login" element={<PageConnexion />} />
        <Route path="/" element={<Acceuil />} />
        <Route path="/poubelle" element={<Poubelle/>} />

      </Routes>
    </Router>
  );
}

export default App;
