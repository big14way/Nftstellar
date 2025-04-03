import { ListingFilters, ListingStatus } from '../types/nft';

interface MarketplaceFiltersProps {
  filters: ListingFilters;
  onFilterChange: (filters: Partial<ListingFilters>) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range (XLM)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.000001"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.000001"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value as ListingStatus })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value={ListingStatus.ACTIVE}>Active</option>
            <option value={ListingStatus.SOLD}>Sold</option>
            <option value={ListingStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as 'price' | 'createdAt' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="price">Price</option>
            </select>
            <select
              value={filters.sortDirection || 'desc'}
              onChange={(e) => onFilterChange({ sortDirection: e.target.value as 'asc' | 'desc' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            onFilterChange({
              searchQuery: '',
              minPrice: '',
              maxPrice: '',
              status: undefined,
              sortBy: 'createdAt',
              sortDirection: 'desc',
            });
          }}
          className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default MarketplaceFilters; 