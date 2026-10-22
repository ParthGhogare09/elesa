import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  pageSize = 10,
  emptyMessage = 'No records found matching your criteria.',
  actions,
  filterComponent,
  keyField = 'id',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter based on search keys
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = row[k];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(row).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Bar with Search & Filters */}
      {(searchable || actions || filterComponent) && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex flex-1 items-center gap-3">
            {searchable && (
              <div className="w-full max-w-xs">
                <Input
                  icon={Search}
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="!mb-0"
                />
              </div>
            )}
            {filterComponent}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3.5 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100/80' : ''} ${
                    col.className || ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  <p className="text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  className="hover:bg-blue-50/30 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key || col.header} className={`px-4 py-3.5 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{sortedData.length}</span> entries
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="!px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="!px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
