import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './App';
import AdminPanel from './AdminPanel';

export default function RootApp() {
  return (
    <Router>
      <Routes>
        {/* Esto asegura que CUALQUIER ruta que empiece con /admin cargue el panel */}
        <Route path="/admin/*" element={<AdminPanel />} />
        
        {/* Esto carga la web principal para todo lo demás */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
