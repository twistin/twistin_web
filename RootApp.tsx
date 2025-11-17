import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './App';
import AdminPanel from './AdminPanel';

export default function RootApp() {
  return (
    <Router>
      <Routes>
        {/*
          CORRECCIÓN: Se añade '/*' al final del 'path'.
          Esto asegura que el AdminPanel se muestre para CUALQUIER
          ruta que comience con /admin/ (ej. /admin/ o /admin/edit/123)
        */}
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
