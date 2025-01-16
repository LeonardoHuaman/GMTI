import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';
import Sidebar from '../../components/Sidebar';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Expense',
        data: [20000, 15000, 22000, 18000, 24000, 19000],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Profit',
        data: [25000, 20000, 30000, 27000, 35000, 29000],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieData = {
    labels: ['Sold Units', 'Total Units'],
    datasets: [
      {
        data: [32, 68],
        backgroundColor: ['#4bc0c0', '#ffcd56'],
        hoverBackgroundColor: ['#36a2eb', '#ff6384'],
      },
    ],
  };

  const barData = {
    labels: [
      'Gateway str',
      'The Rustic Fox',
      'Velvet Vine',
      'Blue Harbor',
      'Nebula Novelties',
      'Crimson Crafters',
      'Tidal Treasures',
      'Whimsy Wild',
      'Mercantile',
      'Emporium',
    ],
    datasets: [
      {
        label: 'Sales',
        data: [874, 721, 598, 568, 395, 344, 274, 234, 183, 178],
        backgroundColor: '#42a5f5',
      },
    ],
  };

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
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="header">
          <h1>Inventory Management</h1>
          <div className="header-right">
            <input type="text" placeholder="Search" />
            <button>🔔</button>
            <button>⚙</button>
          </div>
        </header>

        <section className="overview">
          <div className="card">
            Total Products: <span>5483</span>
          </div>
          <div className="card">
            Orders: <span>2859</span>
          </div>
          <div className="card">
            Total Stock: <span>5483</span>
          </div>
          <div className="card out-of-stock">
            Out of Stock: <span>38</span>
          </div>
        </section>

        <section className="analytics">
          <div className="chart-container">
            <h3>Inventory Values</h3>
            <Pie data={pieData} key="pieChart" />
          </div>
          <div className="chart-container">
            <h3>Expense vs Profit (Last 6 months)</h3>
            <Line data={lineData} key="lineChart" />
          </div>
          <div className="chart-container">
            <h3>Top 10 Stores by Sales</h3>
            <Bar data={barData} key="barChart" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
