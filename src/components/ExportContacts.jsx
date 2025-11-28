import { useState, useRef, useEffect } from 'react';
import './ExportContacts.css';
import { API_ENDPOINTS } from '../config/api';
import NestedMultiSelect from './NestedMultiSelect';
//MUI imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

// Industry data structure
const INDUSTRY_OPTIONS = {
  'Technology': [
    'Software Development',
    'IT Services',
    'Computer Hardware',
    'Telecommunications',
    'Internet Services',
    'Cloud Computing',
    'Cybersecurity',
    'Artificial Intelligence'
  ],
  'Healthcare': [
    'Hospitals & Clinics',
    'Pharmaceuticals',
    'Medical Devices',
    'Biotechnology',
    'Health Insurance',
    'Healthcare IT',
    'Mental Health Services'
  ],
  'Finance': [
    'Banking',
    'Investment Banking',
    'Insurance',
    'Asset Management',
    'Financial Technology',
    'Accounting',
    'Real Estate Finance'
  ],
  'Manufacturing': [
    'Automotive',
    'Aerospace',
    'Electronics',
    'Textiles',
    'Food & Beverage',
    'Chemicals',
    'Machinery'
  ],
  'Retail': [
    'E-commerce',
    'Supermarkets',
    'Fashion & Apparel',
    'Consumer Electronics',
    'Home & Garden',
    'Specialty Retail'
  ],
  'Education': [
    'Higher Education',
    'K-12 Education',
    'EdTech',
    'Training & Development',
    'Online Learning',
    'Educational Publishing'
  ],
  'Energy': [
    'Oil & Gas',
    'Renewable Energy',
    'Utilities',
    'Mining',
    'Power Generation',
    'Energy Services'
  ],
  'Media & Entertainment': [
    'Broadcasting',
    'Film & Television',
    'Music',
    'Publishing',
    'Gaming',
    'Advertising',
    'Social Media'
  ]
};

function ExportContacts() {
  const [filters, setFilters] = useState({
    source_type: 'all',
    search: '',
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    job_title: [],
    company_country: '',
    company_industry: [], 
    company_city: '',
    company_size: '',
    contact_city: '',
    contact_state: '',
    contact_country: '',
    contact_location: '',
    company_location: '',
    company_state: '',
    company_size_range: [],
    email_validation: [],//'',
    email_total_ai: ''
  });

  // State for chip input
  const [jobTitleInput, setJobTitleInput] = useState('');

  // State for company size range dropdown
  const [isSizeRangeDropdownOpen, setIsSizeRangeDropdownOpen] = useState(false);
  const sizeRangeDropdownRef = useRef(null);

  // state for email validation dropdown
  const [isEmailValidationDropdownOpen, setIsEmailValidationDropdownOpen] = useState(false);
  const emailValidationDropdownRef = useRef(null);
  //Date range state
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Export functionality state
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportMode, setExportMode] = useState('standard');
  const [exporting, setExporting] = useState(false);

  const resultsPerPage = 50;

  // Company size range options
  const companySizeRangeOptions = [
    '0 - 1 (Self-employed)',
    '1 - 10',
    '2 - 10',
    '11 - 50',
    '51 - 200',
    '201 - 500',
    '501 - 1000',
    '1001 - 5000'
  ];
  const emailValidationOptions = [
    'Valid',
    'Invalid',
    'Accept all',
    'Catch all',
    'Risky',
    'Unknown'
  ];
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeRangeDropdownRef.current && !sizeRangeDropdownRef.current.contains(event.target)) {
        console.log("User clicked Outside Company size range Dropdown")
        setIsSizeRangeDropdownOpen(false);
      }
      if (emailValidationDropdownRef.current && !emailValidationDropdownRef.current.contains(event.target)) {
        console.log("User Clicked Outside Email Validation Dropdown")
        setIsEmailValidationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Handle company industry change
  const handleCompanyIndustryChange = (selectedIndustries) => {
    setFilters(prev => ({
      ...prev,
      company_industry: selectedIndustries
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Handle job title chip input
  const handleJobTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = jobTitleInput.trim();

      if (trimmedValue === '') {
        console.log("Ignoring Empty Entry")
        return;
      }

      // Check for duplicates (case-insensitive)
      const isDuplicate = filters.job_title.some(
        title => title.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (!isDuplicate) {
        console.log(`Adding ${trimmedValue} to the array`)
        setFilters(prev => ({
          ...prev,
          job_title: [...prev.job_title, trimmedValue]
        }));
        setJobTitleInput(''); // Clear input after adding
        if (errorMessage) setErrorMessage('');
      }
    }
  };

  // Remove job title chip
  const removeJobTitle = (indexToRemove) => {
    console.log(`Removing ${filters.job_title[indexToRemove]} from the array`)
    setFilters(prev => ({
      ...prev,
      job_title: prev.job_title.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Toggle company size range dropdown
  const toggleSizeRangeDropdown = () => {
    setIsSizeRangeDropdownOpen(prev => !prev);
  };

  // Handle company size range selection
  const handleCompanySizeRangeSelect = (option) => {
    const isDuplicate = filters.company_size_range.includes(option);

    if (!isDuplicate) {
      console.log(`Adding ${option} to company_size_range array`);
      setFilters(prev => ({
        ...prev,
        company_size_range: [...prev.company_size_range, option]
      }));
      if (errorMessage) setErrorMessage('');
    } else {
      // Remove if already selected
      console.log(`Removing ${option} from company_size_range array`);
      setFilters(prev => ({
        ...prev,
        company_size_range: prev.company_size_range.filter(item => item !== option)
      }));
    }
  };

  // Remove company size range chip
  const removeCompanySizeRange = (indexToRemove) => {
    console.log(`Removing ${filters.company_size_range[indexToRemove]} from company_size_range array`);
    setFilters(prev => ({
      ...prev,
      company_size_range: prev.company_size_range.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Clear all company size ranges
  const clearAllCompanySizeRanges = () => {
    console.log('Clearing all company size ranges');
    setFilters(prev => ({
      ...prev,
      company_size_range: []
    }));
  };

  // Handle keyboard navigation in dropdown
  const handleSizeRangeKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSizeRangeDropdownOpen(false);
    }
  };
  /*Email Validation handlers*/
  // Toggle email validation dropdown
  const toggleEmailValidationDropdown = () => {
    setIsEmailValidationDropdownOpen(prev => !prev);
  };

  // Handle email validation selection
  const handleEmailValidationSelect = (option) => {
    const isDuplicate = filters.email_validation.includes(option);

    if (!isDuplicate) {
      console.log(`Adding ${option} to email_validation array`);
      setFilters(prev => ({
        ...prev,
        email_validation: [...prev.email_validation, option]
      }));
      if (errorMessage) setErrorMessage('');
    } else {
      // Remove if already selected
      console.log(`Removing ${option} from email_validation array`);
      setFilters(prev => ({
        ...prev,
        email_validation: prev.email_validation.filter(item => item !== option)
      }));
    }
  };

  // Remove email validation chip
  const removeEmailValidation = (indexToRemove) => {
    console.log(`Removing ${filters.email_validation[indexToRemove]} from email_validation array`);
    setFilters(prev => ({
      ...prev,
      email_validation: prev.email_validation.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Clear all email validations
  const clearAllEmailValidations = () => {
    console.log('Clearing all email validations');
    setFilters(prev => ({
      ...prev,
      email_validation: []
    }));
  };

  // Handle keyboard navigation in email validation dropdown
  const handleEmailValidationKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEmailValidationDropdownOpen(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (field, newValue) => {
    setDateRange(prev => ({
      ...prev,
      [field]: newValue
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Clear date range
  const clearDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null
    });
  };


  const handleSearch = async () => {
    setLoading(true);
    setShowResults(false);
    setErrorMessage('');

    try {
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        const value = filters[key];

        // Handle array values (job_title, company_size_range)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(item => {
              if (item && item.trim() !== '') {
                queryParams.append(key, item.trim());
              }
            });
          }
        }
        // Handle string values
        else if (value && value.trim() !== '') {
          queryParams.set(key, value.trim());
        }
      });
      if (dateRange.startDate) {
        const formattedStartDate = dayjs(dateRange.startDate).format('YYYY-MM-DD');
        queryParams.set('created_date_from', formattedStartDate);
        queryParams.set('updated_at_from', formattedStartDate);
      }

      if (dateRange.endDate) {
        const formattedEndDate = dayjs(dateRange.endDate).format('YYYY-MM-DD');
        queryParams.set('created_date_to', formattedEndDate);
        queryParams.set('updated_at_to', formattedEndDate);
      }
      const limit = resultsPerPage;
      const offset = (currentPage - 1) * resultsPerPage;
      queryParams.set('limit', limit);
      queryParams.set('offset', offset);

      //const apiUrl = `http://192.168.18.9:8005/leads?${queryParams.toString()}`;
      const apiUrl = `${API_ENDPOINTS.leads}?${queryParams.toString()}`;
      console.log(`API Request URL is: ${apiUrl}`)
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          console.log(errorData);
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
      source_type: 'all',
      search: '',
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      job_title: [],
      company_country: '',
      company_industry: [], // Changed to array
      company_city: '',
      company_size: '',
      contact_city: '',
      contact_state: '',
      contact_country: '',
      contact_location: '',
      company_location: '',
      company_state: '',
      company_size_range: [],
      email_validation: [],//'',
      email_total_ai: ''
    });
    setJobTitleInput(''); // Clear chip input
    clearDateRange();
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

  // Handle export based on current filters
  const handleExport = async () => {
    if (totalContacts === 0) {
      setErrorMessage('No contacts to export. Please search first.');
      return;
    }

    setExporting(true);
    setErrorMessage('');

    try {
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        const value = filters[key];

        // Handle array values (job_title, company_size_range)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(item => {
              if (item && item.trim() !== '') {
                queryParams.append(key, item.trim());
              }
            });
          }
        }
        // Handle string values
        else if (value && value.trim() !== '') {
          queryParams.set(key, value.trim());
        }
      });
      // Add date range filters for export
      if (dateRange.startDate) {
        const formattedStartDate = dayjs(dateRange.startDate).format('YYYY-MM-DD');
        queryParams.set('created_date_from', formattedStartDate);
        queryParams.set('updated_at_from', formattedStartDate);
      }

      if (dateRange.endDate) {
        const formattedEndDate = dayjs(dateRange.endDate).format('YYYY-MM-DD');
        queryParams.set('created_date_to', formattedEndDate);
        queryParams.set('updated_at_to', formattedEndDate);
      }
      // Add format and mode parameters
      queryParams.set('format', exportFormat);
      queryParams.set('mode', exportMode);

      //const apiUrl = `http://192.168.18.9:8005/leads/export?${queryParams.toString()}`;
      const apiUrl = `${API_ENDPOINTS.leadsExport}?${queryParams.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': exportFormat === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Invalid export parameters. Please check your filters.');
        } else {
          throw new Error(`Export failed: ${response.status} ${response.statusText}`);
        }
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_export_${new Date().getTime()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      setErrorMessage('');
      alert(`Successfully exported ${totalContacts} contacts matching your filters!`);

    } catch (error) {
      setErrorMessage(error.message || 'Failed to export contacts. Please try again.');
    } finally {
      setExporting(false);
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

  const parseLocationString = (locationString) => {
    if (!locationString || typeof locationString !== 'string') {
      return { city: null, state: null, country: null };
    }

    const parts = locationString.split(',').map(part => part.trim()).filter(Boolean);

    if (parts.length === 3) {
      return { city: parts[0], state: parts[1], country: parts[2] };
    } else if (parts.length === 2) {
      return { city: parts[0], state: null, country: parts[1] };
    } else if (parts.length === 1) {
      return { city: null, state: null, country: parts[0] };
    }

    return { city: null, state: null, country: null };
  };

  const getContactLocation = (contact) => {
    if (contact.contact_city || contact.contact_state || contact.contact_country) {
      return {
        city: contact.contact_city || null,
        state: contact.contact_state || null,
        country: contact.contact_country || null
      };
    }

    if (contact.contact_location) {
      return parseLocationString(contact.contact_location);
    }

    return { city: null, state: null, country: null };
  };

  const getCompanyLocation = (contact) => {
    if (contact.company_city || contact.company_state || contact.company_country) {
      return {
        city: contact.company_city || null,
        state: contact.company_state || null,
        country: contact.company_country || null
      };
    }

    if (contact.company_location) {
      return parseLocationString(contact.company_location);
    }

    return { city: null, state: null, country: null };
  };

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
          <h1 className="page-title">Search & Export Contacts</h1>
          <p className="page-subtitle">Find, filter, and export your contact database with precision</p>
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
            <div className="chips-input-container">
              <div className="chips-wrapper">
                {filters.job_title.map((title, index) => (
                  <div key={index} className="chip">
                    <span className="chip-text">{title}</span>
                    <button
                      type="button"
                      onClick={() => removeJobTitle(index)}
                      className="chip-remove"
                      aria-label={`Remove ${title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  onKeyDown={handleJobTitleKeyDown}
                  placeholder={filters.job_title.length === 0 ? "Type job title and press Enter" : ""}
                  className="chips-input"
                />
              </div>
            </div>
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
            <NestedMultiSelect
              options={INDUSTRY_OPTIONS}
              value={filters.company_industry}
              onChange={handleCompanyIndustryChange}
              placeholder="Select Industry"
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
            <div className="multiselect-container" ref={sizeRangeDropdownRef}>
              <div
                className="multiselect-input-wrapper"
                onClick={toggleSizeRangeDropdown}
                onKeyDown={handleSizeRangeKeyDown}
                tabIndex={0}
                role="button"
                aria-expanded={isSizeRangeDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="multiselect-tags">
                  {filters.company_size_range.length > 0 ? (
                    filters.company_size_range.map((range, index) => (
                      <div key={index} className="multiselect-chip">
                        <span className="chip-text">{range}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCompanySizeRange(index);
                          }}
                          className="chip-remove"
                          aria-label={`Remove ${range}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="multiselect-placeholder">Company size ranges</span>
                  )}
                </div>
                <div className="multiselect-actions">
                  {filters.company_size_range.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllCompanySizeRanges();
                      }}
                      className="multiselect-clear-all"
                      aria-label="Clear all selections"
                    >
                      ×
                    </button>
                  )}
                  <button
                    type="button"
                    className={`multiselect-dropdown-arrow ${isSizeRangeDropdownOpen ? 'open' : ''}`}
                    aria-label="Toggle dropdown"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {isSizeRangeDropdownOpen && (
                <div className="multiselect-dropdown" role="listbox">
                  {companySizeRangeOptions.map((option, index) => {
                    const isSelected = filters.company_size_range.includes(option);
                    return (
                      <div
                        key={index}
                        className={`multiselect-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCompanySizeRangeSelect(option)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="multiselect-option-text">{option}</span>
                        {isSelected && (
                          <span className="multiselect-checkmark">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="filter-field">
            <label className="filter-label">Email Validation</label>
            <div className="multiselect-container" ref={emailValidationDropdownRef}>
              <div
                className="multiselect-input-wrapper"
                onClick={toggleEmailValidationDropdown}
                onKeyDown={handleEmailValidationKeyDown}
                tabIndex={0}
                role="button"
                aria-expanded={isEmailValidationDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="multiselect-tags">
                  {filters.email_validation.length > 0 ? (
                    filters.email_validation.map((validation, index) => (
                      <div key={index} className="multiselect-chip">
                        <span className="chip-text">{validation}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEmailValidation(index);
                          }}
                          className="chip-remove"
                          aria-label={`Remove ${validation}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="multiselect-placeholder">Email validation status</span>
                  )}
                </div>
                <div className="multiselect-actions">
                  {filters.email_validation.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllEmailValidations();
                      }}
                      className="multiselect-clear-all"
                      aria-label="Clear all selections"
                    >
                      ×
                    </button>
                  )}
                  <button
                    type="button"
                    className={`multiselect-dropdown-arrow ${isEmailValidationDropdownOpen ? 'open' : ''}`}
                    aria-label="Toggle dropdown"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {isEmailValidationDropdownOpen && (
                <div className="multiselect-dropdown" role="listbox">
                  {emailValidationOptions.map((option, index) => {
                    const isSelected = filters.email_validation.includes(option);
                    return (
                      <div
                        key={index}
                        className={`multiselect-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleEmailValidationSelect(option)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="multiselect-option-text">{option}</span>
                        {isSelected && (
                          <span className="multiselect-checkmark">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
        <div className="date-range-section">
          <h3 className="date-range-title">Filter by Date Range</h3>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="date-range-picker-container">
              <div className="date-picker-field">
                <DatePicker
                  label="From Date"
                  value={dateRange.startDate}
                  onChange={(newValue) => handleDateRangeChange('startDate', newValue)}
                  maxDate={dateRange.endDate || undefined}
                  
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />
              </div>
              <div className='date-picker-field'>
                <DatePicker
                  label="To Date"
                  value={dateRange.endDate}
                  onChange={(newValue) => handleDateRangeChange('endDate', newValue)}
                  minDate={dateRange.startDate || undefined}
                  
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </div>
              <button
                onClick={clearDateRange}
                className='btn-clear-dates'
                disabled={!dateRange.startDate && !dateRange.endDate}
                title='Clear date range'
              >
                Clear Dates
              </button>
            </div>
          </LocalizationProvider>
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
          <div className="export-bar">
            <div className="export-left">
              <label className="export-mode-label">Export Mode:</label>
              <select
                value={exportMode}
                onChange={(e) => setExportMode(e.target.value)}
                className="export-mode-select"
              >
                <option value="standard">Standard</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div className="export-right">
              <label className="export-format-label">Export Format:</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-format-select"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`btn-export ${exporting ? 'btn-export-disabled' : ''}`}
              >
                {exporting ? 'Exporting...' : `Export All Results (${totalContacts})`}
              </button>
            </div>
          </div>

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

                      <td className="table-cell">
                        <div className="cell-content-location">
                          {formatLocation(getCompanyLocation(contact))}
                        </div>
                      </td>

                      <td className="table-cell">
                        <div className="cell-content-location">
                          {formatLocation(getContactLocation(contact))}
                        </div>
                      </td>

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
                            {contact.last_upload_source || "N/A"}
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <div key={key} className="modal-detail-row">
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

export default ExportContacts;