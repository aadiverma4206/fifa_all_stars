import React, { useState } from 'react';
import { MapPin, Search, RotateCcw } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import CourtCard from '../../components/player/CourtCard';

export const CourtsPage = () => {
  const { clubs, courts } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  const filteredCourts = courts.filter(court => {
    const club = clubs.find(c => c.id === court.clubId);
    const searchLower = searchTerm.toLowerCase();
    const courtNameMatch = court.name?.toLowerCase()?.includes(searchLower);
    const clubNameMatch = club?.name?.toLowerCase()?.includes(searchLower);
    const cityMatch = club?.city?.toLowerCase()?.includes(searchLower);
    const addressMatch = club?.address?.toLowerCase()?.includes(searchLower);

    const matchesSearch = courtNameMatch || clubNameMatch || cityMatch || addressMatch;
    const matchesFormat = formatFilter === 'all' || court.type === formatFilter || court.surface === formatFilter;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="space-y-6 py-2 w-full mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-sport-500" />
            <span>Turfs & Courts Directory</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            Find and reserve FIFA grade artificial grass and indoor futsal venues across Indian cities
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search venue name, pitch or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto max-w-full scrollbar-none pb-1 sm:pb-0">
            {['all', 'Outdoor', 'Indoor'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all uppercase border whitespace-nowrap cursor-pointer ${
                  formatFilter === fmt
                    ? 'bg-sport-500 text-white border-sport-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {fmt === 'all' ? 'All Surfaces' : fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      {filteredCourts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map(court => {
            const club = clubs.find(c => c.id === court.clubId);
            return <CourtCard key={court.courtId || court.id} court={court} club={club} />;
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🏟️
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              No pitches found
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No matching turfs or courts found. Try clearing your search parameters.
            </p>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFormatFilter('all'); }}
            className="px-4 py-2 rounded-lg bg-sport-500 text-white text-xs font-extrabold shadow-md inline-flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CourtsPage;
