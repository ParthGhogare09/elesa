import React, { useState, useEffect } from 'react';
import { Award, UserPlus, Mail, Shield, CheckCircle, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import PageHeader from '../../../components/layout/PageHeader';

export default function JudgeManagement() {
  const [judges, setJudges] = useState([]);
  const [panels, setPanels] = useState([]);
  const [groups, setGroups] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Senior GD Evaluator');

  const loadData = () => {
    const allUsers = demoService.getUsers();
    setJudges(allUsers.filter((u) => u.role === 'judge'));
    setPanels(demoService.getPanels());
    setGroups(demoService.getGroups());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteJudge = (judge) => {
    if (window.confirm(`Are you sure you want to delete judge account "${judge.name}"?`)) {
      const users = demoService.getUsers().filter((u) => u.id !== judge.id);
      localStorage.setItem('pp_eval_users', JSON.stringify(users));
      loadData();
    }
  };

  const handleAddJudge = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newJudge = {
      id: `user-judge-${Date.now()}`,
      name,
      email,
      role: 'judge',
      title,
      avatar: name.slice(0, 2).toUpperCase(),
      isActive: true,
      assignedPanels: ['panel-a'],
    };

    const users = demoService.getUsers();
    users.push(newJudge);
    localStorage.setItem('pp_eval_users', JSON.stringify(users));
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    loadData();
  };

  const columns = [
    {
      header: 'Judge Profile',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
            {row.avatar || 'JD'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.title}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      key: 'email',
      render: (row) => <span className="text-xs text-slate-600 font-mono">{row.email}</span>,
    },
    {
      header: 'Assigned Panels',
      key: 'panels',
      render: (row) => {
        const assigned = panels.filter((p) => p.assignedJudgeIds?.includes(row.id));
        return (
          <div className="flex flex-wrap gap-1">
            {assigned.map((p) => (
              <Badge key={p.id} variant="blue" size="sm">
                {p.code}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Assigned Groups',
      key: 'groups',
      render: (row) => {
        const judgeGroups = groups.filter((g) => g.judgeIds?.includes(row.id));
        return <span className="font-semibold text-slate-800 text-xs">{judgeGroups.length} Groups</span>;
      },
    },
    {
      header: 'Evaluations Done',
      key: 'completed',
      render: (row) => {
        const judgeGroups = groups.filter((g) => g.judgeIds?.includes(row.id));
        const done = judgeGroups.filter((g) => g.evaluationStatus === 'completed').length;
        return (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {done} / {judgeGroups.length} Done
          </span>
        );
      },
    },
    {
      header: 'Account Status',
      key: 'isActive',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'gray'} size="sm">
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          title="Delete Judge"
          onClick={() => handleDeleteJudge(row)}
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
        title="GD Judges Directory"
        subtitle="Manage faculty and external industry evaluators presiding over Group Discussion panels."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Judges' }]}
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>
            Add Evaluator Judge
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={judges}
        searchPlaceholder="Search judges by name or email..."
        searchKeys={['name', 'email', 'title']}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New GD Judge"
        subtitle="Evaluator will be able to log in to the Judge Portal and score assigned groups."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddJudge}>
              Save Evaluator
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddJudge} className="space-y-4">
          <Input
            label="Full Name & Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prof. Alex Sharma"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="judge@placepro.demo"
            required
          />
          <Input
            label="Designation / Affiliation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Corporate Soft Skills Coach"
          />
        </form>
      </Modal>
    </div>
  );
}
