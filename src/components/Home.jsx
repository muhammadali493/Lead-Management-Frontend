import { NavLink } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1> DataHunt</h1>
        <p className="tagline">
          When data hides, we hunt it down.
        </p>
        <p className="subtext">
          Manage, filter, and export your data intelligently with DataHunt’s
          smart tools.
        </p>
        <div className="hero-buttons">
          <NavLink to="/upload-csv" className="btn primary">
            🚀 Get Started
          </NavLink>
          <NavLink to="/search-contacts" className="btn secondary">
            🔍 Explore Data
          </NavLink>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">

          <div className="card-header">
            <h3>Upload Data</h3>
          </div>
          <p className="card-description">
            Import your datasets easily with CSV or Excel. Supports mapping and
            bulk uploads.
          </p>
          <div className="tags">
            <span>Column Mapping</span>
            <span>Smart Import</span>
          </div>
          <NavLink to="/upload-csv" className="btn small">
            Upload CSV
          </NavLink>
        </div>

        <div className="feature-card">
          <div className="card-header">
            <h3>Search & Filter</h3>
          </div>
          <p className="card-description">
            Discover insights using advanced filters — search by company, role,
            or location.
          </p>
          <div className="tags">
            <span>Advanced Search</span>
            <span>Real-time Results</span>
          </div>
          <NavLink to="/search-contacts" className="btn small">
            Search Data
          </NavLink>
        </div>
      </section>

      {/* Export Section */}
      <section className="export-section">
        <div className="export-content">
          <h2>Export Your Data</h2>
          <p className="export-description">
            Download filtered results to CSV or Excel — complete with company
            relationships and organized columns.
          </p>
          <NavLink to="/export-contacts" className="btn primary">
            Export Contacts
          </NavLink>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-section">
        <h2>Why Choose DataHunt?</h2>
        <p className="why-subtitle">
          Built for modern teams who need reliable, fast, and intelligent data management.
        </p>

        <div className="why-cards">
          {/* Card 1 */}
          <div className="why-card">
            <div className="why-icon-container">
              <span className="why-badge">AI-Powered</span>
            </div>
            <h4>Smart Deduplication</h4>
            <p>Automatically detect and merge duplicate data entries.</p>
          </div>
          {/* Card 2 */}
          <div className="why-card">
            <div className="why-icon-container">
              <span className="why-badge">Sales-Ready</span>
            </div>
            <h4> Intelligent Filtering</h4>
            <p>Filter and target datasets with precision.</p>
          </div>
          {/* Card 3 */}
          <div className="why-card">
            <div className="why-icon-container">
              <span className="why-badge">Scalable</span>
            </div>
            <h4>Lightning Fast</h4>
            <p>Optimized for real-time search and exports.</p>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="cta-section">
        <h2>Ready to Hunt Smarter?</h2>
        <p>Join teams who trust DataHunt for seamless data management.</p>
        <NavLink to="/upload-csv" className="btn cta">
          Start Managing Data
        </NavLink>
      </section>
    </div>
  );
}

export default Home;