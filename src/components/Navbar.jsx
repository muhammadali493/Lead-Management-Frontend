import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="lemon-icon">🕵️‍♂️</span>
          <span className="brand-text">DataHunt App</span>
        </div>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
              Home
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/upload-csv" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
              Upload CSV
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/search-contacts" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
              Search Contacts
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/export-contacts" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
              Export Contacts
            </NavLink>
          </li>
        </ul>

        <button className="get-started-btn">Get Started</button>
      </div>
    </nav>
  );
}

export default Navbar;