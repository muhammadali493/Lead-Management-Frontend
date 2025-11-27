import { useState, useRef, useEffect } from 'react';
import './NestedMultiSelect.css';

function NestedMultiSelect({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHoveredIndustry(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleSubIndustrySelect = (subIndustry) => {
    const isSelected = value.includes(subIndustry);
    
    if (isSelected) {
      onChange(value.filter(item => item !== subIndustry));
    } else {
      onChange([...value, subIndustry]);
    }
  };

  const handleMainIndustryClick = (mainIndustry) => {
    const subIndustries = options[mainIndustry];
    const allSelected = subIndustries.every(sub => value.includes(sub));

    if (allSelected) {
      // Deselect all sub-industries
      onChange(value.filter(item => !subIndustries.includes(item)));
    } else {
      // Select all sub-industries
      const newSelections = [...new Set([...value, ...subIndustries])];
      onChange(newSelections);
    }
  };

  const removeChip = (subIndustry) => {
    onChange(value.filter(item => item !== subIndustry));
  };

  const clearAll = () => {
    onChange([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setHoveredIndustry(null);
    }
  };

  const getMainIndustryStatus = (mainIndustry) => {
    const subIndustries = options[mainIndustry];
    const selectedCount = subIndustries.filter(sub => value.includes(sub)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === subIndustries.length) return 'all';
    return 'partial';
  };

  return (
    <div className="nested-multiselect-container" ref={dropdownRef}>
      <div
        className="nested-multiselect-input-wrapper"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="nested-multiselect-tags">
          {value.length > 0 ? (
            value.map((item, index) => (
              <div key={index} className="nested-multiselect-chip">
                <span className="chip-text">{item}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(item);
                  }}
                  className="chip-remove"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <span className="nested-multiselect-placeholder">{placeholder}</span>
          )}
        </div>
        <div className="nested-multiselect-actions">
          {value.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="nested-multiselect-clear-all"
              aria-label="Clear all selections"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className={`nested-multiselect-dropdown-arrow ${isOpen ? 'open' : ''}`}
            aria-label="Toggle dropdown"
          >
            ▼
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="nested-multiselect-dropdown">
          <div className="nested-main-industries">
            {Object.keys(options).map((mainIndustry, index) => {
              const status = getMainIndustryStatus(mainIndustry);
              return (
                <div
                  key={index}
                  className={`nested-main-industry-item ${hoveredIndustry === mainIndustry ? 'hovered' : ''} ${status}`}
                  onMouseEnter={() => setHoveredIndustry(mainIndustry)}
                  onClick={() => handleMainIndustryClick(mainIndustry)}
                >
                  <span className="nested-industry-checkbox">
                    {status === 'all' && '✓'}
                    {status === 'partial' && '−'}
                  </span>
                  <span className="nested-industry-text">{mainIndustry}</span>
                  <span className="nested-industry-arrow">▶</span>
                </div>
              );
            })}
          </div>

          {hoveredIndustry && (
            <div className="nested-sub-industries">
              <div className="nested-sub-industries-title">{hoveredIndustry}</div>
              {options[hoveredIndustry].map((subIndustry, index) => {
                const isSelected = value.includes(subIndustry);
                return (
                  <div
                    key={index}
                    className={`nested-sub-industry-item ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubIndustrySelect(subIndustry);
                    }}
                  >
                    <span className="nested-sub-industry-text">{subIndustry}</span>
                    {isSelected && <span className="nested-checkmark">✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NestedMultiSelect;