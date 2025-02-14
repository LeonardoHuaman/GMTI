import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  BsSearch,
} from "react-icons/bs";
import {
  FcStatistics,
  FcBullish,
  FcPositiveDynamic,
  FcCancel,
  FcHighPriority,
  FcSupport
} from "react-icons/fc";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav className={`sidebar ${isCollapsed ? "close" : ""}`}>
      <header>
        <div className="image-text">
          <span className="image">
            <img
              src="/images/profile.png"
              alt="Profile"
            />
          </span>
          <div className="text logo-text">
            <span className="name">{!isCollapsed && "Stella Army"}</span>
            <span className="profession">{!isCollapsed && "Web Developer"}</span>
          </div>
        </div>
        <i
          className={`toggle bx ${isCollapsed ? "bx-chevron-right" : "bx-chevron-left"}`}
          onClick={toggleSidebar}
        ></i>
      </header>

      <div className="menu-bar">
        <div className="menu">
          <li className="search-box">
            <BsSearch className="icon" />
            {!isCollapsed && <input type="text" placeholder="Search..." />}
          </li>

          <ul className="menu-links">
            <li className="nav-link">
              <NavLink to="/dashboard">
                <FcStatistics className="icon" />
                <span className="text nav-text">Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-link">
              <NavLink to="/facturas">
                <FcBullish className="icon" />
                <span className="text nav-text">Facturas</span>
              </NavLink>
            </li>
            <li className="nav-link">
              <NavLink to="/servicios">
                <FcSupport className="icon" />
                <span className="text nav-text">Servicios</span>
              </NavLink>
            </li>
            <li className="nav-link">
              <NavLink to="/ventas">
                <FcPositiveDynamic className="icon" />
                <span className="text nav-text">Ventas</span>
              </NavLink>
            </li>
            <li className="nav-link">
              <NavLink to="/anulados">
                <FcCancel className="icon" />
                <span className="text nav-text">Anulados</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="bottom-content">
          <li className="nav-link">
            <NavLink to="/">
              <FcHighPriority className="icon" />
              <span className="text nav-text">Logout</span>
            </NavLink>
          </li>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
