import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const Ventas = () => {
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
        <div>
            <Sidebar />
            <h1>Ventas</h1>
            <p>Contenido de la página Ventas.</p>
        </div>
    );
};

export default Ventas;