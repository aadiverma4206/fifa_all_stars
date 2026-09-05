import React, { useState } from 'react';
import { Plus, Settings, DollarSign } from 'lucide-react';
import { useClubStore } from '../../store/useClubStore';
import CourtManagerRow from '../../components/clubManager/CourtManagerRow';
import PricingForm from '../../components/clubManager/PricingForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { validateTitle, validatePositiveAmount, validateFormAndFocus } from '../../utils/validationUtils';
import toast from 'react-hot-toast';

export const ManageCourtsPage = () => {
  const { club, courts, updateCourt, addCourt } = useClubStore();
  const [editingCourt, setEditingCourt] = useState(null);
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const clubCourts = (courts || []).filter(c => c.clubId === club?.id) || [];

  // New Court Form
  const [name, setName] = useState('');
  const [format, setFormat] = useState('11v11');
  const [surfaceType, setSurfaceType] = useState('3G Artificial Turf');
  const [basePrice, setBasePrice] = useState('45');
  const [peakPrice, setPeakPrice] = useState('65');

  const handleUpdatePricing = (pricingData) => {
    if (editingCourt) {
      updateCourt(editingCourt.id, pricingData);
      setEditingCourt(null);
    }
  };

  const handleAddCourt = async (e) => {
    e.preventDefault();
    if (isAddingCourt) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(name, 'Court Name'), field: 'courtName' },
      { check: () => validatePositiveAmount(basePrice, 'Base Price', false), field: 'basePrice' },
      { check: () => validatePositiveAmount(peakPrice, 'Peak Price', false), field: 'peakPrice' }
    ]);

    if (!isValid) return;

    setIsAddingCourt(true);
    try {
      addCourt({
        clubId: club.id,
        name: name.trim(),
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
    } finally {
      setIsAddingCourt(false);
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-10 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2.5">
            <Settings className="w-6 h-6 text-sport-500" />
            <span>Courts & Pitches Management</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage pitch formats, surface specifications, hourly rates, and court availability
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} rainbowBorder={false} onClick={() => setIsAddCourtModalOpen(true)} className="rounded-md font-bold text-xs uppercase px-4 py-2.5 shadow-sm">
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
              name="courtName"
              type="text"
              placeholder="e.g. Pitch Delta (11v11)"
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
                name="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="11v11">11v11 Official Match</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Surface Type</label>
              <input
                name="surfaceType"
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
                name="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Price ($/hr)</label>
              <input
                name="peakPrice"
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
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingCourt}
              disabled={isAddingCourt}
            >
              Save Court
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageCourtsPage;
