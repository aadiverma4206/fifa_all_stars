import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Shield, Edit3 } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export const DisputesPage = () => {
  const { disputes, resolveDispute } = useDataStore();

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState('Team A');
  const [scoreStr, setScoreStr] = useState('4 - 3');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    resolveDispute(selectedDispute.id, winnerTeam, scoreStr);
    setIsResolveModalOpen(false);
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Match Disputes & Result Overrides
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review disputed pick-up games, override match winners, and adjust player Elo ratings
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map((dsp) => {
          const isResolved = dsp.status === 'RESOLVED';

          return (
            <div key={dsp.id} className="footy-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{dsp.gameTitle}</h3>
                    <Badge variant={isResolved ? 'emerald' : 'danger'} size="sm">
                      {dsp.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    Reported by: <span className="text-sport-500 font-extrabold">{dsp.reportedBy}</span> • Date: {dsp.createdAt}
                  </p>
                  <p className="text-xs text-rose-500 font-bold pt-1">
                    Dispute Reason: "{dsp.reason}" (Claimed score: {dsp.disputedScore})
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!isResolved ? (
                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleOpenResolve(dsp)}>
                      Resolve Dispute
                    </Button>
                  ) : (
                    <Badge variant="emerald" size="sm">
                      Winner: {dsp.winnerOverride} (Resolved)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Dispute Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Match Dispute">
        {selectedDispute && (
          <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Declared Winner</label>
              <select
                value={winnerTeam}
                onChange={(e) => setWinnerTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Team A">Team A (Arjun's Team)</option>
                <option value="Team B">Team B (Siddharth's Team)</option>
                <option value="Draw">Draw (50/50 Elo Adjustment)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Final Score Override</label>
              <input
                type="text"
                value={scoreStr}
                onChange={(e) => setScoreStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Adjust Elo
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default DisputesPage;
