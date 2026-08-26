import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import CourtManagerRow from '../../components/clubManager/CourtManagerRow';
import PricingForm from '../../components/clubManager/PricingForm';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const ManageCourtsPage = () => {
  const { currentUser } = useAuthStore();
  const { clubs, courts, addCourt, updateCourt } = useDataStore();

  const club = clubs.find(c => c.id === currentUser?.clubId) || clubs[0];
  const clubCourts = courts.filter(crt => crt.clubId === club.id);

  const [editingCourt, setEditingCourt] = useState(null);
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);

  // New Court Form
  const [name, setName] = useState('');
  const [format, setFormat] = useState('5v5');
  const [surfaceType, setSurfaceType] = useState('3G Artificial Turf');
  const [basePrice, setBasePrice] = useState('45');
  const [peakPrice, setPeakPrice] = useState('65');

  const handleUpdatePricing = (pricingData) => {
    if (editingCourt) {
      updateCourt(editingCourt.id, pricingData);
      setEditingCourt(null);
    }
  };

  const handleAddCourt = (e) => {
    e.preventDefault();
    addCourt({
      clubId: club.id,
      name,
      format,
      surfaceType,
      basePricePerHour: parseFloat(basePrice),
      peakPricePerHour: parseFloat(peakPrice),
      peakHoursStart: '18:00',
      peakHoursEnd: '22:00',
      isIndoor: format === 'Futsal'
    });
    toast.success(`Added new court "${name}"!`);
    setIsAddCourtModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <Settings className="w-8 h-8 text-emerald-500" />
            <span>Courts & Pitches Management</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage pitch formats, surface specifications, and court availability
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setIsAddCourtModalOpen(true)}>
          Add New Court
        </Button>
      </div>

      <div className="space-y-4">
        {clubCourts.map(court => (
          <CourtManagerRow
            key={court.id}
            court={court}
            onEditPricing={(c) => setEditingCourt(c)}
          />
        ))}
      </div>

      {/* Pricing Edit Modal */}
      <Modal isOpen={!!editingCourt} onClose={() => setEditingCourt(null)} title={`Edit Pricing for ${editingCourt?.name}`}>
        <PricingForm
          court={editingCourt}
          onSubmit={handleUpdatePricing}
          onCancel={() => setEditingCourt(null)}
        />
      </Modal>

      {/* Add Court Modal */}
      <Modal isOpen={isAddCourtModalOpen} onClose={() => setIsAddCourtModalOpen(false)} title="Add New Turf Court">
        <form onSubmit={handleAddCourt} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Court Name</label>
            <input
              type="text"
              placeholder="e.g. Pitch Delta (5v5)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="5v5">5v5</option>
                <option value="7v7">7v7</option>
                <option value="Futsal">Futsal</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Surface Type</label>
              <input
                type="text"
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Base Price ($/hr)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Price ($/hr)</label>
              <input
                type="number"
                value={peakPrice}
                onChange={(e) => setPeakPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddCourtModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Court
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageCourtsPage;
