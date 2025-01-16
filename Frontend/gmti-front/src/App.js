import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Facturas from './pages/Facturas/Facturas';
import Servicios from './pages/Servicios/Servicios';
import Ventas from './pages/Ventas/Ventas';
import Anulados from './pages/Anulados/Anulados';


function App() {
  
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/facturas" element={<Facturas />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/ventas" element={<Ventas />} />
      <Route path="/anulados" element={<Anulados />} />
      </Routes>
    </Router>
  );
}

export default App;
