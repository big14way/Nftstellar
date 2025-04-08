import { useState, useEffect } from 'react';
import { ListingFilters, ListingStatus, NFTCollection } from '../types/nft';
import styles from '@/styles/MarketplaceFilters.module.css';

interface MarketplaceFiltersProps {
  filters: ListingFilters;
  onFilterChange: (filters: Partial<ListingFilters>) => void;
  collections?: NFTCollection[];
  traits?: { trait_type: string; values: string[] }[];
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  filters,
  onFilterChange,
  collections = [],
  traits = []
}) => {
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const [expandedSections, setExpandedSections] = useState({
    status: true,
    price: true,
    collections: true,
    traits: true,
    sorting: true
  });

  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
  const [selectedTraits, setSelectedTraits] = useState<{ [key: string]: string[] }>({});

  // Apply price filters after a short delay to avoid too many re-renders during slider movement
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters: Partial<ListingFilters> = {};
      if (priceRange.min) newFilters.minPrice = priceRange.min;
      if (priceRange.max) newFilters.maxPrice = priceRange.max;
      onFilterChange(newFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange]);

  // Apply search filter after a short delay to avoid too many re-renders during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ searchQuery: searchTerm || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply trait filters
  useEffect(() => {
    const traitFilters = Object.entries(selectedTraits)
      .flatMap(([trait_type, values]) => 
        values.map(value => ({ trait_type, value }))
      );
    
    if (traitFilters.length > 0) {
      onFilterChange({ traits: traitFilters });
    } else if (filters.traits && filters.traits.length > 0) {
      onFilterChange({ traits: undefined });
    }
  }, [selectedTraits]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStatusChange = (status: ListingStatus | undefined) => {
    onFilterChange({ status });
  };

  const handleSortChange = (sortBy: 'price' | 'createdAt' | 'popularity') => {
    onFilterChange({ sortBy });
  };

  const handleSortDirectionChange = (sortDirection: 'asc' | 'desc') => {
    onFilterChange({ sortDirection });
  };

  const handleCollectionChange = (collection: string | undefined) => {
    onFilterChange({ collection });
  };

  const handleTraitChange = (trait: string, value: string, checked: boolean) => {
    setSelectedTraits(prev => {
      const updatedTraits = { ...prev };
      
      if (!updatedTraits[trait]) {
        updatedTraits[trait] = [];
      }
      
      if (checked) {
        updatedTraits[trait] = [...updatedTraits[trait], value];
      } else {
        updatedTraits[trait] = updatedTraits[trait].filter(v => v !== value);
        
        if (updatedTraits[trait].length === 0) {
          delete updatedTraits[trait];
        }
      }
      
      return updatedTraits;
    });
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
    setSelectedTraits({});
    onFilterChange({
      status: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      collection: undefined,
      traits: undefined,
      searchQuery: undefined
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <button 
          className={styles.clearButton}
          onClick={clearAllFilters}
        >
          Clear All
        </button>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search NFTs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('status')}
        >
          <h4>Status</h4>
          <span className={expandedSections.status ? styles.expanded : styles.collapsed}>
            {expandedSections.status ? '−' : '+'}
          </span>
        </div>
        
        {expandedSections.status && (
          <div className={styles.sectionContent}>
            <div className={styles.checkboxItem}>
              <input
                type="radio"
                id="status-all"
                name="status"
                checked={filters.status === undefined}
                onChange={() => handleStatusChange(undefined)}
              />
              <label htmlFor="status-all">All NFTs</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="radio"
                id="status-active"
                name="status"
                checked={filters.status === ListingStatus.ACTIVE}
                onChange={() => handleStatusChange(ListingStatus.ACTIVE)}
              />
              <label htmlFor="status-active">Buy Now</label>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('price')}
        >
          <h4>Price</h4>
          <span className={expandedSections.price ? styles.expanded : styles.collapsed}>
            {expandedSections.price ? '−' : '+'}
          </span>
        </div>
        
        {expandedSections.price && (
          <div className={styles.sectionContent}>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className={styles.priceInput}
              />
              <span className={styles.priceSeparator}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className={styles.priceInput}
              />
            </div>
            <button 
              className={styles.applyButton}
              onClick={() => onFilterChange({
                minPrice: priceRange.min || undefined,
                maxPrice: priceRange.max || undefined
              })}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {collections.length > 0 && (
        <div className={styles.section}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('collections')}
          >
            <h4>Collections</h4>
            <span className={expandedSections.collections ? styles.expanded : styles.collapsed}>
              {expandedSections.collections ? '−' : '+'}
            </span>
          </div>
          
          {expandedSections.collections && (
            <div className={styles.sectionContent}>
              <div className={styles.checkboxItem}>
                <input
                  type="radio"
                  id="collection-all"
                  name="collection"
                  checked={filters.collection === undefined}
                  onChange={() => handleCollectionChange(undefined)}
                />
                <label htmlFor="collection-all">All Collections</label>
              </div>
              
              {collections.map(collection => (
                <div key={collection.id} className={styles.checkboxItem}>
                  <input
                    type="radio"
                    id={`collection-${collection.id}`}
                    name="collection"
                    checked={filters.collection === collection.id}
                    onChange={() => handleCollectionChange(collection.id)}
                  />
                  <label htmlFor={`collection-${collection.id}`}>{collection.name}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {traits.length > 0 && (
        <div className={styles.section}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('traits')}
          >
            <h4>Properties</h4>
            <span className={expandedSections.traits ? styles.expanded : styles.collapsed}>
              {expandedSections.traits ? '−' : '+'}
            </span>
          </div>
          
          {expandedSections.traits && (
            <div className={styles.sectionContent}>
              {traits.map(trait => (
                <div key={trait.trait_type} className={styles.traitGroup}>
                  <h5>{trait.trait_type}</h5>
                  
                  {trait.values.map(value => (
                    <div key={value} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`trait-${trait.trait_type}-${value}`}
                        checked={selectedTraits[trait.trait_type]?.includes(value) || false}
                        onChange={(e) => handleTraitChange(trait.trait_type, value, e.target.checked)}
                      />
                      <label htmlFor={`trait-${trait.trait_type}-${value}`}>{value}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('sorting')}
        >
          <h4>Sort By</h4>
          <span className={expandedSections.sorting ? styles.expanded : styles.collapsed}>
            {expandedSections.sorting ? '−' : '+'}
          </span>
        </div>
        
        {expandedSections.sorting && (
          <div className={styles.sectionContent}>
            <div className={styles.sortGroup}>
              <div className={styles.checkboxItem}>
                <input
                  type="radio"
                  id="sort-recent"
                  name="sortBy"
                  checked={filters.sortBy === 'createdAt'}
                  onChange={() => handleSortChange('createdAt')}
                />
                <label htmlFor="sort-recent">Recently Listed</label>
              </div>
              
              <div className={styles.checkboxItem}>
                <input
                  type="radio"
                  id="sort-price-low"
                  name="sortBy"
                  checked={filters.sortBy === 'price' && filters.sortDirection === 'asc'}
                  onChange={() => {
                    handleSortChange('price');
                    handleSortDirectionChange('asc');
                  }}
                />
                <label htmlFor="sort-price-low">Price: Low to High</label>
              </div>
              
              <div className={styles.checkboxItem}>
                <input
                  type="radio"
                  id="sort-price-high"
                  name="sortBy"
                  checked={filters.sortBy === 'price' && filters.sortDirection === 'desc'}
                  onChange={() => {
                    handleSortChange('price');
                    handleSortDirectionChange('desc');
                  }}
                />
                <label htmlFor="sort-price-high">Price: High to Low</label>
              </div>
              
              <div className={styles.checkboxItem}>
                <input
                  type="radio"
                  id="sort-popularity"
                  name="sortBy"
                  checked={filters.sortBy === 'popularity'}
                  onChange={() => handleSortChange('popularity')}
                />
                <label htmlFor="sort-popularity">Most Popular</label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceFilters; 