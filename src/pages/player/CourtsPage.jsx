import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
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
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <MapPin className="w-8 h-8 text-sport-500" />
          <span>Turfs & Courts Directory</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Find and reserve FIFA grade artificial grass and indoor futsal venues across Indian cities
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="footy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search venue name, pitch or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['all', 'Outdoor', 'Indoor'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase ${
                formatFilter === fmt
                  ? 'bg-sport-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {fmt === 'all' ? 'All Surfaces' : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourts.map(court => {
          const club = clubs.find(c => c.id === court.clubId);
          return <CourtCard key={court.courtId || court.id} court={court} club={club} />;
        })}
      </div>
    </div>
  );
};

export default CourtsPage;
