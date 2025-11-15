import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../services/api';
import { GlobalSearchResult } from '../../types';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/helpers';
import Alert from '../common/Alert';
import Button from '../common/Button';

const UniversalEmployeeSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const debounceTimeout = useRef<number | null>(null);

  const allStatuses = ['active', 'terminated', 'inactive'];
  
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set(allStatuses));
  const [sortConfig, setSortConfig] = useState<{ key: keyof GlobalSearchResult; direction: 'ascending' | 'descending' } | null>(null);


  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setLoading(true);
    setSearched(true);
    
    debounceTimeout.current = window.setTimeout(async () => {
      try {
        setError('');
        const searchResults = await api.universalSearch(query);
        setResults(searchResults);
        // Reset filters and sorting to show all new results
        setSelectedStatuses(new Set(allStatuses));
        setSortConfig(null);
      } catch (err) {
        setError('The search could not be completed. Please try again later.');
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses(prev => {
        const newSet = new Set(prev);
        if (newSet.has(status)) {
            newSet.delete(status);
        } else {
            newSet.add(status);
        }
        return newSet;
    });
  };

  const handleSort = (key: keyof GlobalSearchResult) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'active': return 'green';
          case 'terminated': return 'red';
          case 'inactive': return 'gray';
          default: return 'gray';
      }
  }

  const filteredResults = useMemo(() => results.filter(result => 
    selectedStatuses.has(result.statusSummary)
  ), [results, selectedStatuses]);
  
  const sortedAndFilteredResults = useMemo(() => {
    let sortableItems = [...filteredResults];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === undefined || bValue === undefined) return 0;

            let comparison = 0;
            if (sortConfig.key === 'statusSummary') {
                const statusOrder = { 'active': 1, 'inactive': 2, 'terminated': 3 };
                comparison = (statusOrder[aValue as keyof typeof statusOrder] || 99) - (statusOrder[bValue as keyof typeof statusOrder] || 99);
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            }

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }
    return sortableItems;
  }, [filteredResults, sortConfig]);

  return (
    <Card title="Universal Search">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        <strong>Privacy Notice:</strong> Search results may include shared histories and termination reasons from other dealers in the network. By using this tool, you acknowledge this policy.
                    </p>
                </div>
            </div>
        </div>
      
        <Input
            placeholder="Start typing to search by Name, Phone, or Aadhar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
            autoFocus
        />

        {error && <div className="mt-4"><Alert message={error} variant="danger" onClose={() => setError('')}/></div>}

        {searched && results.length > 0 && !loading && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h5 className="font-semibold text-gray-700 mb-3">Filter Results</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">By Status</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {allStatuses.map(status => (
                                <label key={status} className="flex items-center space-x-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedStatuses.has(status)}
                                        onChange={() => handleStatusFilterChange(status)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="capitalize">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

      {searched && !error && (
        <div className="mt-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h4 className="text-md font-semibold text-gray-600">
                    {loading ? 'Searching...' : `${filteredResults.length} results found for "${query}"`}
                </h4>
                 {results.length > 0 && !loading && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <Button size="sm" variant={sortConfig?.key === 'canonicalName' ? 'primary' : 'secondary'} onClick={() => handleSort('canonicalName')}>Name</Button>
                        <Button size="sm" variant={sortConfig?.key === 'ownerDealerName' ? 'primary' : 'secondary'} onClick={() => handleSort('ownerDealerName')}>Dealer</Button>
                        <Button size="sm" variant={sortConfig?.key === 'statusSummary' ? 'primary' : 'secondary'} onClick={() => handleSort('statusSummary')}>Status</Button>
                        {sortConfig && (
                            <span className="text-lg text-gray-500 font-bold">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                {sortedAndFilteredResults.map(result => (
                <div key={`${result.entityRefId}-${result.ownerDealerId}`} className="p-4 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-primary">{result.canonicalName}</p>
                        <p className="text-sm text-gray-500 capitalize">
                            {result.entityType} | Owner: {result.ownerDealerName}
                            {result.entityType === 'employee' && result.statusSummary === 'active' && result.hireDate && (
                                <span className="ml-2 pl-2 border-l border-gray-300">Hired: {formatDate(result.hireDate)}</span>
                            )}
                        </p>
                    </div>
                    <Badge color={getStatusColor(result.statusSummary)}>{result.statusSummary}</Badge>
                    </div>
                    {result.entityType === 'employee' && result.statusSummary === 'terminated' && result.terminationDate && result.terminationReason && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="p-3 bg-red-50 rounded-md">
                            <p><strong className="font-semibold text-red-800">Terminated on:</strong> <span className="text-red-700">{formatDate(result.terminationDate)}</span></p>
                            <p><strong className="font-semibold text-red-800">Reason:</strong> <span className="text-red-700">{result.terminationReason}</span></p>
                        </div>
                    </div>
                    )}
                </div>
                ))}
                {!loading && query.length > 0 && results.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No matching records found across the network.</p>
                )}
                 {!loading && query.length > 0 && results.length > 0 && filteredResults.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No results match your filter criteria.</p>
                )}
            </div>
        </div>
      )}
    </Card>
  );
};

export default UniversalEmployeeSearchPage;