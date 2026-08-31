import React, { useState } from 'react';
import { MapPin, Plus, Edit2, ShieldAlert, CheckCircle2, Lock, Wrench } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const ManageCourtsPage = () => {
  const { clubs, courts, addCourt, updateCourt, toggleCourtStatus } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  // New Court Form
  const [courtName, setCourtName] = useState('');
  const [type, setType] = useState('Outdoor'); // Outdoor | Indoor
  const [surface, setSurface] = useState('3G Turf'); // 3G Turf | Synthetic Grass | Acrylic
  const [basePrice, setBasePrice] = useState('500');

  const handleAddCourt = (e) => {
    e.preventDefault();
    if (!courtName || !courtName.trim()) {
      toast.error('Pitch Name cannot be empty.');
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Base Hourly Rate must be a positive number greater than ₹0.');
      return;
    }

    addCourt(myClub.id, {
      name: courtName.trim(),
      type,
      surface,
      basePrice: price
    });

    setIsAddModalOpen(false);
    setCourtName('');
  };

  const handleOpenEdit = (crt) => {
    setSelectedCourt(crt);
    setCourtName(crt.name);
    setBasePrice(String(crt.basePrice));
    setIsEditModalOpen(true);
  };

  const handleSaveCourtEdit = (e) => {
    e.preventDefault();
    if (!selectedCourt) return;

    if (!courtName || !courtName.trim()) {
      toast.error('Pitch Name cannot be empty.');
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Base Hourly Rate must be a positive number greater than ₹0.');
      return;
    }

    updateCourt(selectedCourt.courtId || selectedCourt.id, {
      name: courtName.trim(),
      basePrice: price
    });

    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Manage Courts & Pitch Slots
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Add new pitches, set hourly rates, and toggle availability status (AVAILABLE, BLOCKED, MAINTENANCE)
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add New Court
        </Button>
      </div>

      {/* Courts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myCourts.map((court) => {
          const isAvail = court.status === 'AVAILABLE';
          const isBlocked = court.status === 'BLOCKED';
          const isMaint = court.status === 'MAINTENANCE';

          return (
            <div key={court.courtId || court.id} className="footy-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">{court.type}</Badge>
                    <Badge variant="blue">{court.surface}</Badge>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1">{court.name}</h3>
                </div>

                <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEdit(court)}>
                  Edit Price
                </Button>
              </div>

              <div className="flex justify-between items-center text-xs font-bold p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-400">Base Hourly Rate</span>
                <span className="text-xl font-black text-sport-500">₹{court.basePrice}/hr</span>
              </div>

              {/* Status Toggle Radio Ribbon */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Court Status</span>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => toggleCourtStatus(court.courtId || court.id, 'AVAILABLE')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1 transition-all ${
                      isAvail ? 'bg-sport-500 text-white border-sport-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCourtStatus(court.courtId || court.id, 'BLOCKED')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1 transition-all ${
                      isBlocked ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Blocked</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCourtStatus(court.courtId || court.id, 'MAINTENANCE')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1 transition-all ${
                      isMaint ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Maint.</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Court Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Pitch / Court">
        <form onSubmit={handleAddCourt} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Pitch Name</label>
            <input
              type="text"
              placeholder="e.g. Pitch Charlie (5v5)"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Outdoor">Outdoor</option>
                <option value="Indoor">Indoor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Surface Type</label>
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="3G Turf">3G Artificial Turf</option>
                <option value="Synthetic Grass">Synthetic Grass</option>
                <option value="Acrylic">Acrylic Futsal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Base Price (₹/hr)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Court
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Court Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Pitch Settings">
        <form onSubmit={handleSaveCourtEdit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Pitch Name</label>
            <input
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Base Price (₹/hr)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageCourtsPage;
