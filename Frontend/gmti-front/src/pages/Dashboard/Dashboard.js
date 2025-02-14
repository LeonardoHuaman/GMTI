import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
      const verifyToken = async () => {
        const token = localStorage.getItem('token');
        console.log(token);
        try {
          const response = await fetch(
            `http://localhost:8000/verify-token/${token}`
          );
          if (!response.ok) {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          localStorage.removeItem('token');
          navigate('/');
        }
      };
  
      verifyToken();
    }, [navigate]);
  
  return (
    <div className="facturas-layout">
        <Sidebar />
        <div className="facturas-container">
          <header className="facturas-header">
            <h1>Gestión de Dashboard</h1>
            <p>Consulta, edita y administra tus Dashboard de manera eficiente.</p>
          </header>
        </div>
      </div>
  );
};

export default Dashboard;