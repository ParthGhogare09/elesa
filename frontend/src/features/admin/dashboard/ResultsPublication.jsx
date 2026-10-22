import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Trophy,
  Lock,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/layout/PageHeader';

export default function ResultsPublication() {
  const [event, setEvent] = useState(null);
  const [gdWeight, setGdWeight] = useState(40);
  const [hrWeight, setHrWeight] = useState(60);
  const [results, setResults] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [published, setPublished] = useState(false);

  const loadData = () => {
    const ev = demoService.getEvent();
    setEvent(ev);
    setPublished(ev?.resultsPublished || false);
    setGdWeight(ev?.finalScoringConfig?.gdWeightPercentage || 40);
    setHrWeight(ev?.finalScoringConfig?.hrWeightPercentage || 60);
    setResults(demoService.getFinalResults());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculate = () => {
    try {
      const updated = demoService.recalculateFinalScores({
        gdWeight: Number(gdWeight),
        hrWeight: Number(hrWeight),
        workflow: event?.hrScoringConfig?.workflow || 'workflow_b',
      });
      setResults(updated);
      alert(`Scores successfully recalculated with GD: ${gdWeight}% and HR: ${hrWeight}%.`);
    } catch (err) {
      alert(err.message || 'Error updating weights');
    }
  };

  const handlePublish = () => {
    try {
      demoService.publishFinalResults();
      setPublished(true);
      setIsConfirmModalOpen(false);
      loadData();
      alert('Official Final Results and Placement Leaderboard have been published!');
    } catch (err) {
      alert(err.message || 'Error publishing results');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Final Result Publication &amp; Weight Config"
        subtitle="Perform pre-publication validation, verify scoring weight distribution, and publish the official placement drive merit list."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Publish Results' }]}
      />

      {/* Publication Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          published
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {published ? <Lock className="w-6 h-6" /> : <Send className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold">
              {published ? 'Placement Results Officially Published &amp; Frozen' : 'Pre-Publication Stage Active'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {published
                ? 'Rankings and merit scores are visible to candidates. Any modifications will be logged in the permanent audit feed.'
                : 'Review checklist and scoring configurations below prior to freezing the final merit standings.'}
            </p>
          </div>
        </div>

        {!published ? (
          <Button
            variant="primary"
            icon={Send}
            size="lg"
            onClick={() => setIsConfirmModalOpen(true)}
          >
            Publish Final Results
          </Button>
        ) : (
          <Badge variant="success" size="lg">Official Status: Published</Badge>
        )}
      </div>

      {/* Pre-Publish Readiness Checklist */}
      <Card
        title="Pre-Publication Readiness Checklist"
        subtitle="Automatic verification of marks, decisions, and weights"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Round 1 Group Discussion Marks Complete</span>
            </div>
            <span className="text-slate-500 font-mono">100% Verified</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Round 1 Qualification &amp; Shortlist Approved</span>
            </div>
            <span className="text-slate-500 font-mono">Confirmed</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Dual HR Interview Evaluations Submitted</span>
            </div>
            <span className="text-slate-500 font-mono">Completed</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Scoring Weights Balance (100% Total)</span>
            </div>
            <span className="text-emerald-700 font-bold font-mono">
              GD {gdWeight}% + HR {hrWeight}% = 100%
            </span>
          </div>
        </div>
      </Card>

      {/* Scoring Weights Customizer */}
      <Card
        title="Scoring Weights Configuration"
        subtitle="Adjust the proportion between Round 1 (GD) and Round 2 (HR Interview)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Round 1: Group Discussion Weight</span>
                <span className="font-bold text-blue-600">{gdWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={gdWeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGdWeight(val);
                  setHrWeight(100 - val);
                }}
                disabled={published}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Round 2: HR Interview Weight</span>
                <span className="font-bold text-blue-600">{hrWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={hrWeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHrWeight(val);
                  setGdWeight(100 - val);
                }}
                disabled={published}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Formula Preview</span>
            <p className="text-xs text-slate-600 font-mono">
              Final = (GD% × {gdWeight / 100}) + (HR% × {hrWeight / 100})
            </p>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={handleRecalculate}
              disabled={published}
              className="w-full"
            >
              Recompute Rankings with Current Weights
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Result Publication"
        subtitle="This action will finalize rankings and make the placement leaderboard official."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePublish}>
              Yes, Publish Official Results
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            You are about to publish results for <strong>{results.length} evaluated candidates</strong> with weighting:
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-900">
            • Group Discussion: {gdWeight}%<br />
            • HR Interview: {hrWeight}%
          </div>
          <p className="text-slate-500">
            An audit entry will be created and timestamped. Are you sure you wish to proceed?
          </p>
        </div>
      </Modal>
    </div>
  );
}
