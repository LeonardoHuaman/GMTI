import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // Tu archivo de estilos para el sidebar

const Sidebar = () => {
  return (
    <div className="sidebar">
      <header>
        <div className="image-text">
          <div className="image">
            <img src="/logo.png" alt="Logo" />
          </div>
          <div className="logo-text">
            <span className="name">Stella Army</span>
            <span className="profession">Web Developer</span>
          </div>
        </div>
        <i className="toggle bx bx-chevron-right"></i>
      </header>

      <div className="menu-bar">
        <ul className="menu-links">
          <li>
            <NavLink to="/dashboard" activeClassName="active">
              <i className="bx bx-grid-alt"></i>
              <span className="text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/facturas" activeClassName="active">
              <i className="bx bx-file"></i>
              <span className="text">Facturas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/servicios" activeClassName="active">
              <i className="bx bx-cog"></i>
              <span className="text">Servicios</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/ventas" activeClassName="active">
              <i className="bx bx-shopping-bag"></i>
              <span className="text">Ventas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/anulados" activeClassName="active">
              <i className="bx bx-trash"></i>
              <span className="text">Anulados</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/" activeClassName="active">
              <i className="bx bx-log-out"></i>
              <span className="text">Logout</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
