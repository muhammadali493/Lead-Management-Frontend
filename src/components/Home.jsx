import { NavLink } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>🕵️‍♂️ DataHunt</h1>
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
          <h3>📤 Upload Data</h3>
          <p>
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
          <h3>🔎 Search & Filter</h3>
          <p>
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
        <h2>📁 Export Your Data</h2>
        <p>
          Download filtered results to CSV or Excel — complete with company
          relationships and organized columns.
        </p>
        <NavLink to="/export-contacts" className="btn primary">
          Export Contacts
        </NavLink>
      </section>

      {/* Why Choose Section */}
      <section className="why-section">
        <h2>Why Choose DataHunt?</h2>
        <div className="why-cards">
          <div className="why-card">
            <h4>🤖 Smart Deduplication</h4>
            <p>Automatically detect and merge duplicate data entries.</p>
          </div>
          <div className="why-card">
            <h4>🎯 Intelligent Filtering</h4>
            <p>Filter and target datasets with precision.</p>
          </div>
          <div className="why-card">
            <h4>⚡ Lightning Fast</h4>
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