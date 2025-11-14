import { useState } from 'react';
import './SearchContacts.css';

function SearchContacts() {
  const [filters, setFilters] = useState({
    source_type: '',
    search: '',
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    job_title: '',
    company_country: '',
    company_industry: '',
    company_city: '',
    company_size: '',
    contact_city: '',
    contact_state: '',
    contact_country: '',
    contact_location: '',
    company_location: '',
    company_state: '',
    company_size_range: '',
    email_validation: '',
    email_total_ai: ''
  });

  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const resultsPerPage = 50;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSearch = async () => {
    setLoading(true);
    setShowResults(false);
    setErrorMessage('');

    try {
      const queryParams = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key].trim() !== '') {
          queryParams[key] = filters[key].trim();
        }
      });

      const limit = resultsPerPage;
      const offset = (currentPage - 1) * resultsPerPage;
      queryParams.limit = limit;
      queryParams.offset = offset;

      const queryString = new URLSearchParams(queryParams).toString();
      const apiUrl = `http://192.168.18.9:8005/leads?${queryString}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error('Invalid search parameters. Please check your filters.');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        setResults(data.items);
        setShowResults(true);

        if (data.total !== undefined) {
          setTotalContacts(data.total);
        } else {
          setTotalContacts(data.items.length);
        }

        if (data.items.length === 0) {
          setErrorMessage('No contacts found matching your search criteria.');
        }
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      setResults([]);
      setShowResults(false);
      setErrorMessage(error.message || 'Failed to fetch contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      source_type: '',
      search: '',
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      job_title: '',
      company_country: '',
      company_industry: '',
      company_city: '',
      company_size: '',
      contact_city: '',
      contact_state: '',
      contact_country: '',
      contact_location: '',
      company_location: '',
      company_state: '',
      company_size_range: '',
      email_validation: '',
      email_total_ai: ''
    });
    setShowResults(false);
    setResults([]);
    setErrorMessage('');
    setCurrentPage(1);
    setTotalContacts(0);
  };

  const totalPages = Math.ceil(totalContacts / resultsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setTimeout(() => handleSearch(), 0);
    }
  };

  const openModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  const getEmailValidationBadge = (validation) => {
    if (!validation) return null;
    
    const validationLower = validation.toLowerCase();
    let badgeClass = 'email-badge';
    
    if (validationLower.includes('valid') && !validationLower.includes('invalid')) {
      badgeClass += ' email-badge-valid';
    } else if (validationLower.includes('accept')) {
      badgeClass += ' email-badge-accept';
    } else if (validationLower.includes('invalid') || validationLower.includes('risky')) {
      badgeClass += ' email-badge-invalid';
    } else {
      badgeClass += ' email-badge-default';
    }
    
    return (
      <span className={badgeClass}>
        {validation}
      </span>
    );
  };

  const getSourceBadge = (sourceType) => {
    if (!sourceType) return null;
    
    const sourceLower = sourceType.toLowerCase();
    let badgeClass = 'source-badge';
    
    if (sourceLower === 'seamless') {
      badgeClass += ' source-badge-seamless';
    } else if (sourceLower === 'skrapp') {
      badgeClass += ' source-badge-skrapp';
    } else {
      badgeClass += ' source-badge-default';
    }
    
    return (
      <span className={badgeClass}>
        {sourceType}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // NEW: Helper function to parse combined location string (e.g., "City, State, Country")
  // Splits location string and attempts to extract city, state, and country
  const parseLocationString = (locationString) => {
    if (!locationString || typeof locationString !== 'string') {
      return { city: null, state: null, country: null };
    }
    
    // Split by comma and clean up whitespace
    const parts = locationString.split(',').map(part => part.trim()).filter(Boolean);
    
    if (parts.length === 3) {
      // Assuming format: "City, State, Country"
      return { city: parts[0], state: parts[1], country: parts[2] };
    } else if (parts.length === 2) {
      // Could be "City, Country" or "City, State"
      return { city: parts[0], state: null, country: parts[1] };
    } else if (parts.length === 1) {
      // Just one value - treat as country
      return { city: null, state: null, country: parts[0] };
    }
    
    return { city: null, state: null, country: null };
  };

  // NEW: Get contact location with priority-based fallback
  // Priority 1: Use structured fields (contact_city, contact_state, contact_country)
  // Priority 2: Parse combined location string (contact_location)
  const getContactLocation = (contact) => {
    // Priority 1: Use structured fields if any exist
    if (contact.contact_city || contact.contact_state || contact.contact_country) {
      return {
        city: contact.contact_city || null,
        state: contact.contact_state || null,
        country: contact.contact_country || null
      };
    }
    
    // Priority 2: Parse the combined location string
    if (contact.contact_location) {
      return parseLocationString(contact.contact_location);
    }
    
    // No location data available
    return { city: null, state: null, country: null };
  };

  // NEW: Get company location with priority-based fallback
  // Priority 1: Use structured fields (company_city, company_state, company_country)
  // Priority 2: Parse combined location string (company_location)
  const getCompanyLocation = (contact) => {
    // Priority 1: Use structured fields if any exist
    if (contact.company_city || contact.company_state || contact.company_country) {
      return {
        city: contact.company_city || null,
        state: contact.company_state || null,
        country: contact.company_country || null
      };
    }
    
    // Priority 2: Parse the combined location string
    if (contact.company_location) {
      return parseLocationString(contact.company_location);
    }
    
    // No location data available
    return { city: null, state: null, country: null };
  };

  // UPDATED: formatLocation now accepts a location object instead of separate parameters
  // This makes it work seamlessly with getContactLocation and getCompanyLocation
  const formatLocation = (locationData) => {
    const { city, state, country } = locationData;
    
    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    
    const cityState = parts.join(', ');
    
    if (cityState && country) {
      return (
        <>
          <div className="location-primary">{cityState}</div>
          <div className="location-secondary">{country}</div>
        </>
      );
    } else if (cityState) {
      return <div className="location-primary">{cityState}</div>;
    } else if (country) {
      return <div className="location-secondary">{country}</div>;
    }
    
    return <div className="location-empty">N/A</div>;
  };

  // OLD CODE - No longer needed with new approach
  // const formatLocation = (city, state, country) => {
  //   const parts = [];
  //   if (city) parts.push(city);
  //   if (state) parts.push(state);
  //   
  //   const cityState = parts.join(', ');
  //   
  //   if (cityState && country) {
  //     return (
  //       <>
  //         <div className="location-primary">{cityState}</div>
  //         <div className="location-secondary">{country}</div>
  //       </>
  //     );
  //   } else if (cityState) {
  //     return <div className="location-primary">{cityState}</div>;
  //   } else if (country) {
  //     return <div className="location-secondary">{country}</div>;
  //   }
  //   
  //   return <div className="location-empty">N/A</div>;
  // };

  // OLD CODE - No longer needed with new approach
  // const hasContactLocation = (contact) => {
  //   return contact.contact_city || contact.contact_state || contact.contact_country;
  // };
  const formatFieldName = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  return (
    <div className="search-contacts-container">
      <div className="header-section">
        <div>
          <h1 className="page-title">Search Contacts</h1>
          <p className="page-subtitle">Find and filter your contact database with precision</p>
        </div>
      </div>

      <div className="filters-card">
        <h2 className="filters-title">Search Filters</h2>

        <div className="filters-grid">
          <div className="filter-field">
            <label className="filter-label">Source Type</label>
            <select
              name="source_type"
              value={filters.source_type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {/*<option value="">All Sources</option>*/}
              <option value="all">All</option>
              <option value="seamless">Seamless</option>
              <option value="skrapp">Skrapp</option>
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label">Global Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search across all fields"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">First Name</label>
            <input
              type="text"
              name="first_name"
              value={filters.first_name}
              onChange={handleFilterChange}
              placeholder="Enter first name"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={filters.last_name}
              onChange={handleFilterChange}
              placeholder="Enter last name"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Email</label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Enter email"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={filters.company_name}
              onChange={handleFilterChange}
              placeholder="Enter company name"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Job Title</label>
            <input
              type="text"
              name="job_title"
              value={filters.job_title}
              onChange={handleFilterChange}
              placeholder="Enter job title"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Country</label>
            <input
              type="text"
              name="company_country"
              value={filters.company_country}
              onChange={handleFilterChange}
              placeholder="Enter company country"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Industry</label>
            <input
              type="text"
              name="company_industry"
              value={filters.company_industry}
              onChange={handleFilterChange}
              placeholder="Enter company industry"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company City</label>
            <input
              type="text"
              name="company_city"
              value={filters.company_city}
              onChange={handleFilterChange}
              placeholder="Enter company city"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Size</label>
            <input
              type="text"
              name="company_size"
              value={filters.company_size}
              onChange={handleFilterChange}
              placeholder="Enter company size"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Contact City</label>
            <input
              type="text"
              name="contact_city"
              value={filters.contact_city}
              onChange={handleFilterChange}
              placeholder="Enter contact city"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Contact State</label>
            <input
              type="text"
              name="contact_state"
              value={filters.contact_state}
              onChange={handleFilterChange}
              placeholder="Enter contact state"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Contact Country</label>
            <input
              type="text"
              name="contact_country"
              value={filters.contact_country}
              onChange={handleFilterChange}
              placeholder="Enter contact country"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Contact Location</label>
            <input
              type="text"
              name="contact_location"
              value={filters.contact_location}
              onChange={handleFilterChange}
              placeholder="Enter contact location"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Location</label>
            <input
              type="text"
              name="company_location"
              value={filters.company_location}
              onChange={handleFilterChange}
              placeholder="Enter company location"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company State</label>
            <input
              type="text"
              name="company_state"
              value={filters.company_state}
              onChange={handleFilterChange}
              placeholder="Enter company state"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Company Size Range</label>
            <input
              type="text"
              name="company_size_range"
              value={filters.company_size_range}
              onChange={handleFilterChange}
              placeholder="Enter company size range"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Email Validation</label>
            <input
              type="text"
              name="email_validation"
              value={filters.email_validation}
              onChange={handleFilterChange}
              placeholder="Enter email validation"
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Email Total AI</label>
            <input
              type="text"
              name="email_total_ai"
              value={filters.email_total_ai}
              onChange={handleFilterChange}
              placeholder="Enter email total AI"
              className="filter-input"
            />
          </div>
        </div>

        <div className="button-group">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className={`btn-search ${loading ? 'btn-disabled' : ''}`}
          >
            {loading ? 'Searching...' : 'Search Contacts'}
          </button>
          <button 
            onClick={handleClearFilters}
            className="btn-clear"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading contacts...</p>
        </div>
      )}

      {showResults && results.length > 0 && !loading && (
        <>
          <div className="results-info">
            Showing {results.length} of {totalContacts} contacts 
            (Page {currentPage} of {totalPages || 1})
          </div>

          <div className="results-table-container">
            <div className="table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="table-header">COMPANY</th>
                    <th className="table-header">CONTACT INFO</th>
                    <th className="table-header">COMPANY LOCATION</th>
                    <th className="table-header">CONTACT LOCATION</th>
                    <th className="table-header">COMPANY DETAILS</th>
                    <th className="table-header">SOURCE</th>
                    <th className="table-header">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((contact, index) => (
                    <tr key={contact.id || index} className="table-row">
                      <td className="table-cell">
                        <div className="cell-content">
                          <div className="company-name">{contact.company_name || 'N/A'}</div>
                          <div className="company-industry">{contact.company_industry || 'N/A'}</div>
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="cell-content-contact">
                          <div className="contact-name">
                            {contact.first_name || ''} {contact.last_name || ''}
                          </div>
                          <div className="contact-job-title">{contact.job_title || 'N/A'}</div>
                          <div className="contact-email-wrapper">
                            <span className="contact-email">{contact.email || 'N/A'}</span>
                            {contact.email_validation && getEmailValidationBadge(contact.email_validation)}
                          </div>
                          {contact.email_total_ai && (
                            <div className="email-ai-score">AI Score: {contact.email_total_ai}</div>
                          )}
                        </div>
                      </td>

                      {/* UPDATED: Company location now uses getCompanyLocation helper */}
                      <td className="table-cell">
                        <div className="cell-content-location">
                          {formatLocation(getCompanyLocation(contact))}
                        </div>
                      </td>

                      {/* UPDATED: Contact location now uses getContactLocation helper */}
                      {/* No longer needs hasContactLocation check - formatLocation handles empty data */}
                      <td className="table-cell">
                        <div className="cell-content-location">
                          {formatLocation(getContactLocation(contact))}
                        </div>
                      </td>

                      {/* OLD CODE - Previous implementation */}
                      {/* <td className="table-cell">
                        <div className="cell-content-location">
                          {formatLocation(contact.company_city, contact.company_state, contact.company_country)}
                        </div>
                      </td> */}

                      {/* OLD CODE - Previous implementation */}
                      {/* <td className="table-cell">
                        <div className="cell-content-location">
                          {hasContactLocation(contact) 
                            ? formatLocation(contact.contact_city, contact.contact_state, contact.contact_country)
                            : <div className="location-empty">N/A</div>
                          }
                        </div>
                      </td> */}

                      <td className="table-cell">
                        <div className="cell-content-details">
                          <div className="company-staff">
                            Staff: {contact.company_size ? `${contact.company_size} employees` : 'N/A'}
                          </div>
                          {contact.company_size_range && (
                            <div className="company-size-range">({contact.company_size_range} range)</div>
                          )}
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="cell-content-source">
                          {getSourceBadge(contact.source_type)}
                          <div className="source-filename">
                            {/* {contact.upload_source_filename || 'N/A'} */}
                            {contact.last_upload_source || "NA"}
                          </div>
                          <div className="source-date">
                            {formatDate(contact.created_date)}
                          </div>
                        </div>
                      </td>

                      <td className="table-cell">
                        <button 
                          onClick={() => openModal(contact)}
                          className="btn-view-extra"
                          onMouseOver={(e) => e.target.classList.add('btn-view-extra-hover')}
                          onMouseOut={(e) => e.target.classList.remove('btn-view-extra-hover')}
                        >
                          View Extra
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination-container">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`btn-pagination ${currentPage === 1 ? 'btn-pagination-disabled' : ''}`}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`btn-pagination ${(currentPage === totalPages || totalPages === 0) ? 'btn-pagination-disabled' : ''}`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={closeModal}
              className="modal-close"
            >
              ×
            </button>
            <h2 className="modal-title">Extra Contact Details</h2>
            <div className="modal-details">
              {selectedContact.extra && Object.keys(selectedContact.extra).length > 0 ? (
                Object.entries(selectedContact.extra).map(([key, value]) => (
                  <div key={key}>
                    <strong>{formatFieldName(key)}:</strong> {value || 'N/A'}
                  </div>
                ))
              ) : (
                <div className="no-extra-data">
                  No additional information available for this contact.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchContacts;