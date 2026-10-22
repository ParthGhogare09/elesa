import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function Leaderboard() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [panels, setPanels] = useState([]);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [panelFilter, setPanelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Merit Entry Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    studentId: '',
    gdScore: 48,
    hrScore: 42,
    selectionStatus: 'selected',
  });
  const [addError, setAddError] = useState('');

  const loadData = () => {
    setResults(demoService.getFinalResults());
    setStudents(demoService.getStudents());
    setGroups(demoService.getGroups());
    setPanels(demoService.getPanels());
  };

  useEffect(() => {
    loadData();
  }, []);

  const topThree = useMemo(() => {
    return results.slice(0, 3);
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const student = students.find((s) => s.id === r.studentId);
      if (branchFilter && student?.branch !== branchFilter) return false;
      if (panelFilter && r.panelId !== panelFilter) return false;
      if (statusFilter && r.selectionStatus !== statusFilter) return false;
      return true;
    });
  }, [results, students, branchFilter, panelFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Registration ID',
      'Candidate Name',
      'Branch',
      'Group',
      'Panel',
      'GD Score (/60)',
      'GD Percentage',
      'HR Combined Score (/50)',
      'HR Percentage',
      'Final Score (/100)',
      'Selection Status',
    ];

    const rows = filteredResults.map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      const group = groups.find((g) => g.id === r.groupId);
      const panel = panels.find((p) => p.id === r.panelId);
      return [
        r.rank,
        `"${student?.registrationId || ''}"`,
        `"${student?.name || ''}"`,
        `"${student?.branch || ''}"`,
        `"${group?.groupName || ''}"`,
        `"${panel?.code || ''}"`,
        r.gdScore,
        `${r.gdPercentage}%`,
        r.hrScore,
        `${r.hrPercentage}%`,
        r.finalScore,
        r.selectionStatus,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlacePro_Final_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteResult = (row) => {
    const student = students.find((s) => s.id === row.studentId);
    if (window.confirm(`Are you sure you want to delete leaderboard entry for "${student?.name || row.studentId}"?`)) {
      demoService.deleteFinalResult(row.id);
      loadData();
    }
  };

  const handleOpenAddModal = () => {
    const rankedStudentIds = new Set(results.map(r => r.studentId));
    const availableStudent = students.find(s => !rankedStudentIds.has(s.id)) || students[0];
    setAddForm({
      studentId: availableStudent?.id || '',
      gdScore: 48,
      hrScore: 42,
      selectionStatus: 'selected',
    });
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleSaveResult = () => {
    try {
      if (!addForm.studentId) throw new Error('Please select a student.');
      const gdScoreNum = Math.min(60, Math.max(0, Number(addForm.gdScore) || 0));
      const hrScoreNum = Math.min(50, Math.max(0, Number(addForm.hrScore) || 0));
      const gdPercentage = Math.round((gdScoreNum / 60) * 100 * 10) / 10;
      const hrPercentage = Math.round((hrScoreNum / 50) * 100 * 10) / 10;
      const finalScore = Math.round(((gdPercentage * 0.4) + (hrPercentage * 0.6)) * 10) / 10;

      const group = groups.find(g => g.studentIds?.includes(addForm.studentId));

      demoService.saveFinalResult({
        studentId: addForm.studentId,
        groupId: group ? group.id : (groups[0]?.id || 'grp-1'),
        panelId: group ? group.panelId : (panels[0]?.id || 'panel-1'),
        gdScore: gdScoreNum,
        gdPercentage,
        hrScore: hrScoreNum,
        hrPercentage,
        finalScore,
        selectionStatus: addForm.selectionStatus,
        rank: results.length + 1,
      });

      loadData();
      setIsAddModalOpen(false);
    } catch (err) {
      setAddError(err.message || 'Error adding merit entry');
    }
  };

  const columns = [
    {
      header: 'Rank',
      key: 'rank',
      sortable: true,
      render: (row) => {
        if (row.rank === 1) {
          return (
            <div className="flex items-center gap-1.5 font-black text-amber-600">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">
                🥇
              </span>
              <span>#1</span>
            </div>
          );
        }
        if (row.rank === 2) {
          return (
            <div className="flex items-center gap-1.5 font-bold text-slate-500">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                🥈
              </span>
              <span>#2</span>
            </div>
          );
        }
        if (row.rank === 3) {
          return (
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-xs border border-amber-200">
                🥉
              </span>
              <span>#3</span>
            </div>
          );
        }
        return <span className="font-semibold text-slate-600 text-xs">#{row.rank}</span>;
      },
    },
    {
      header: 'Candidate',
      key: 'studentId',
      sortable: true,
      render: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return (
          <div>
            <p className="font-bold text-slate-900">{student?.name}</p>
            <p className="text-xs text-slate-400 font-mono">{student?.registrationId} • {student?.branch}</p>
          </div>
        );
      },
    },
    {
      header: 'Group & Panel',
      key: 'groupId',
      render: (row) => {
        const group = groups.find((g) => g.id === row.groupId);
        const panel = panels.find((p) => p.id === row.panelId);
        return (
          <div>
            <p className="text-xs font-medium text-slate-800">{group?.groupName}</p>
            <p className="text-[11px] text-blue-600 font-semibold">{panel?.code || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'GD Score (40%)',
      key: 'gdScore',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{row.gdScore} / 60</span>
          <span className="text-[11px] text-slate-500 block">({row.gdPercentage}%)</span>
        </div>
      ),
    },
    {
      header: 'HR Score (60%)',
      key: 'hrScore',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{row.hrScore} / 50</span>
          <span className="text-[11px] text-slate-500 block">({row.hrPercentage}%)</span>
        </div>
      ),
    },
    {
      header: 'Final Composite Score',
      key: 'finalScore',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-black text-blue-700 text-base">{row.finalScore}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'selectionStatus',
      render: (row) => {
        if (row.selectionStatus === 'selected') {
          return <Badge variant="success" size="sm">Offer Selected</Badge>;
        }
        if (row.selectionStatus === 'waitlisted') {
          return <Badge variant="warning" size="sm">Waitlist</Badge>;
        }
        return <Badge variant="gray" size="sm">Not Selected</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          title="Delete Leaderboard Entry"
          onClick={() => handleDeleteResult(row)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Placement Merit Leaderboard"
        subtitle="Final rankings compiled from weighted Round 1 Group Discussion (40%) and Round 2 HR Interviews (60%)."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Leaderboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
              Export (CSV)
            </Button>
            <Button variant="primary" icon={PlusCircle} onClick={handleOpenAddModal}>
              Add Merit Entry
            </Button>
          </div>
        }
      />

      {/* Top 3 Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((item, index) => {
          const student = students.find((s) => s.id === item.studentId);
          const medals = [
            { title: 'Gold Medalist — Rank #1', bg: 'bg-amber-50/70 border-amber-200', text: 'text-amber-800', badge: '🥇 Rank 1' },
            { title: 'Silver Medalist — Rank #2', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', badge: '🥈 Rank 2' },
            { title: 'Bronze Medalist — Rank #3', bg: 'bg-amber-50/40 border-amber-100', text: 'text-amber-900', badge: '🥉 Rank 3' },
          ];
          const m = medals[index] || medals[0];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border ${m.bg} shadow-sm relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-black tracking-wide ${m.text}`}>
                    {m.badge}
                  </span>
                  <Badge variant="blue" size="sm">Composite: {item.finalScore} / 100</Badge>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{student?.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{student?.registrationId}</p>
                <p className="text-xs text-slate-600 mt-1 font-medium">{student?.branch}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">GD (40%)</span>
                  <strong className="text-slate-800">{item.gdPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">HR (60%)</span>
                  <strong className="text-slate-800">{item.hrPercentage}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tie Breaking Rules & Formula Banner */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold text-slate-800 block">Configured Tie-Breaking Protocol:</span>
          <span>1. Higher Composite Final Score &rarr; 2. Higher HR Interview Score &rarr; 3. Higher GD Score</span>
        </div>
        <span className="text-slate-500 font-medium text-[11px] bg-white px-2.5 py-1 rounded border border-slate-200">
          Formula: (GD % × 0.40) + (HR % × 0.60)
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Filter by Branch"
          options={[
            { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
            { value: 'Information Technology', label: 'Information Technology' },
            { value: 'Electronics & Communication', label: 'Electronics & Communication' },
            { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
            { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
          ]}
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          placeholder="All Engineering Branches"
        />

        <Select
          label="Filter by Panel"
          options={panels.map((p) => ({ value: p.id, label: `${p.code} (${p.name})` }))}
          value={panelFilter}
          onChange={(e) => setPanelFilter(e.target.value)}
          placeholder="All Panels"
        />

        <Select
          label="Selection Status"
          options={[
            { value: 'selected', label: 'Offer Selected' },
            { value: 'waitlisted', label: 'Waitlisted' },
            { value: 'not_selected', label: 'Not Selected' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Final Outcomes"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredResults}
        searchPlaceholder="Search leaderboard by candidate name or registration ID..."
        searchKeys={['studentId', 'rank', 'finalScore']}
        pageSize={12}
      />

      {/* Modal: Add Merit Entry */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Final Merit Leaderboard Entry"
          subtitle="Manually add a student ranking with weighted Round 1 GD and Round 2 HR composite score."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveResult}>
                Save Merit Entry
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {addError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                {addError}
              </div>
            )}

            <Select
              label="Select Candidate"
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.registrationId || s.id}) - ${s.branch || ''}`,
              }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="GD Score (Max 60)"
                type="number"
                min="0"
                max="60"
                value={addForm.gdScore}
                onChange={(e) => setAddForm({ ...addForm, gdScore: e.target.value })}
                required
              />

              <Input
                label="HR Score (Max 50)"
                type="number"
                min="0"
                max="50"
                value={addForm.hrScore}
                onChange={(e) => setAddForm({ ...addForm, hrScore: e.target.value })}
                required
              />
            </div>

            <Select
              label="Selection Status"
              value={addForm.selectionStatus}
              onChange={(e) => setAddForm({ ...addForm, selectionStatus: e.target.value })}
              options={[
                { value: 'selected', label: 'Offer Selected' },
                { value: 'waitlisted', label: 'Waitlisted' },
                { value: 'not_selected', label: 'Not Selected' },
              ]}
              required
            />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between font-medium text-blue-900">
              <span>Estimated Composite Score (40% GD + 60% HR):</span>
              <span className="font-extrabold text-base">
                {Math.round((((Number(addForm.gdScore) || 0) / 60 * 40) + ((Number(addForm.hrScore) || 0) / 50 * 60)) * 10) / 10} / 100
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
