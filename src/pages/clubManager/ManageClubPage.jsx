import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ManageClubPage = () => {
  const { currentUser } = useAuthStore();
  const { clubs, updateClubDetails } = useDataStore();

  const club = clubs.find(c => c.id === currentUser?.clubId) || clubs[0];

  const [name, setName] = useState(club?.name || '');
  const [location, setLocation] = useState(club?.location || '');
  const [openingTime, setOpeningTime] = useState(club?.openingTime || '06:00');
  const [closingTime, setClosingTime] = useState(club?.closingTime || '23:00');
  const [description, setDescription] = useState(club?.description || '');

  const handleSave = (e) => {
    e.preventDefault();
    updateClubDetails(club.id, {
      name,
      location,
      openingTime,
      closingTime,
      description
    });
    toast.success('Club details updated successfully!');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-emerald-500" />
          <span>Manage Club & Venue Details</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update public venue information, opening hours, and pitch guidelines
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl border space-y-6 text-xs font-semibold">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Club Arena Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Location Address</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Opening Time</label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Closing Time</label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Venue Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManageClubPage;
